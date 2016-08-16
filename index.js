var TelegramBot = require('node-telegram-bot-api');
var http = require('http');
var xml2js = require('xml2js');
var dbClass = require('./database.js');
var Constants = require('./constants.js');
var parser = new xml2js.Parser({explicitArray : false});
var token = process.env.TELEGRAM_BOT_TOKEN || '<INSERT TOKEN HERE>';
var debugmode = true;
var dbInstance;



/****************************************************/
// Setting up the database
/****************************************************/
dbClass.connect(function(database, err) {
  if (err == null) {
    dbInstance = database;
  } else {
    console.log(err);
    return
  }
});

/****************************************************/
// Polling the RSS feed with a timer
/****************************************************/
var timer = setInterval(pollFeedRSS, Constants.timerValue.delayTest);

/****************************************************/
// Setting up the bot
/****************************************************/
var options = {
  polling: true
};

var bot = new TelegramBot(token, options);

bot.getMe().then(function (me) {
  console.log('Hi my name is %s!', me.username);
});

/****************************************************/
// Bot listening to input
/****************************************************/

bot.onText(/\/current/, function (msg) {
  var chatId = msg.chat.id;
  var userId = msg.from.id;
  var replyId = msg.message_id;

  sendMessageWithFormattedLanguage(userId, chatId, Constants.topics.current, replyId, getCurrentWeather);
});

bot.onText(/\/warning/, function (msg) {
  var chatId = msg.chat.id;
  var userId = msg.from.id;
  var replyId = msg.message_id;

  sendMessageWithFormattedLanguage(userId, chatId, Constants.topics.warning, replyId, getWarning);
});

bot.onText(/\/topics/, function (msg) {
  var chatId = msg.chat.id;
  var replyId = msg.message_id;
  //TODO: Make enums of topics, no hard coded string
  bot.sendMessage(chatId, 'current, warning', {reply_to_message_id: replyId});
});

bot.onText(/(\/subscribe current)|(\/subscribe warning)/, function (msg, match) {
  var chatId = msg.chat.id;
  var replyId = msg.message_id;
  var collectionId;
  switch (match[0]) {
    case '/subscribe current':
      collectionId = Constants.databaseCollections.subscribersCurrent;
      break;
    case '/subscribe warning':
      collectionId = Constants.databaseCollections.subscribersWarning;
      break;
    default:
      collectionId = Constants.databaseCollections.subscribersWarning;
      break;
  }

  dbClass.writeSubscriber(dbInstance, collectionId, msg, function(err, result) {
    if (err == null) {
      bot.sendMessage(chatId, result, {reply_to_message_id: replyId});
    } else {
      bot.sendMessage(chatId, err, {reply_to_message_id: replyId});
    }
  });
});

bot.onText(/(\/unsubscribe current)|(\/unsubscribe warning)/, function (msg, match) {
  var chatId = msg.chat.id;
  var replyId = msg.message_id;
  var userId = msg.from.id;
  var collectionId;

  switch (match[0]) {
    case '/unsubscribe current':
      collectionId = Constants.databaseCollections.subscribersCurrent;
      break;
    case '/unsubscribe warning':
      collectionId = Constants.databaseCollections.subscribersWarning;
      break;
    default:
      collectionId = Constants.databaseCollections.subscribersWarning;
      break;
  }

  dbClass.deleteSubscriber(dbInstance, collectionId, userId, function(err, result) {
    if (err == null) {
      bot.sendMessage(chatId, result, {reply_to_message_id: replyId});
    } else {
      bot.sendMessage(chatId, err, {reply_to_message_id: replyId});
    }
  });
});

bot.onText(/\/language/, function (msg) {
  var chatId = msg.chat.id;
  var userId = msg.from.id;
  var replyId = msg.message_id;

  if (dbInstance != null) {
    dbClass.getPreferedLanguage(dbInstance, userId, function(err, callback) {
      if (err == null) {
        bot.sendMessage(chatId, 'Current language is ' + getFormattedLanguage(callback), {reply_to_message_id: replyId});
      } else {
        console.log(err);
        bot.sendMessage(chatId, 'Couldnt find prefered language for user.', {reply_to_message_id: replyId});
      }
    });
  }
});

bot.onText(/\/(simplified)|(traditional)|(english)/, function (msg, match) {
  var chatId = msg.chat.id;
  var userId = msg.from.id;
  var replyId = msg.message_id;
  var lang;

  switch (match[0]) {
    case 'english':
      lang = Constants.databaseKeys.English.key;
      break;

    case 'traditional':
      lang = Constants.databaseKeys.TraditionalChinese.key;
      break;

    case '/simplified':
      lang = Constants.databaseKeys.SimplifiedChinese.key;
      break;

    default:
      lang = Constants.databaseKeys.English.key;
  }

  dbClass.createNewUserPreferences(dbInstance, userId, lang, function(err, results) {
    if (err == null) {
      bot.sendMessage(chatId, 'Set new language: ' + lang, {reply_to_message_id: replyId});
    } else {
      bot.sendMessage(chatId, 'Couldnt change language.', {reply_to_message_id: replyId});
    }
  });
});

/****************************************************/
// Private methods
/****************************************************/

function getFormattedLanguage(language) {
  switch (language) {
    case Constants.databaseKeys.English.key:
      return Constants.databaseKeys.English.display

    case Constants.databaseKeys.SimplifiedChinese.key:
      return Constants.databaseKeys.SimplifiedChinese.display

    case Constants.databaseKeys.TraditionalChinese.key:
      return Constants.databaseKeys.TraditionalChinese.display

    default:
      return Constants.databaseKeys.English.display
  }
}

function getCorrectURL(language, type) {
  switch (language) {
    case Constants.databaseKeys.English.key:
      if (type == Constants.topics.current) {
        return Constants.webservices.English.rootURL+Constants.webservices.English.currentWeatherRSS
      } else if (type == Constants.topics.warning) {
        return Constants.webservices.English.rootURL+Constants.webservices.English.warningRSS
      }

    case Constants.databaseKeys.SimplifiedChinese.key:
      if (type == Constants.topics.current) {
        return Constants.webservices.SimplifiedChinese.rootURL+Constants.webservices.SimplifiedChinese.currentWeatherRSS
      } else if (type == Constants.topics.warning) {
        return Constants.webservices.SimplifiedChinese.rootURL+Constants.webservices.SimplifiedChinese.warningRSS
      }

    case Constants.databaseKeys.TraditionalChinese.key:
      if (type == Constants.topics.current) {
        return Constants.webservices.TraditionalChinese.rootURL+Constants.webservices.TraditionalChinese.currentWeatherRSS
      } else if (type == Constants.topics.warning) {
        return Constants.webservices.TraditionalChinese.rootURL+Constants.webservices.TraditionalChinese.warningRSS
      }

    default:
      return Constants.webservices.English.rootURL+Constants.webservices.English.currentWeatherRSS
  }
}

function getCurrentWeather(url, callback) {
  var req = http.get(url, function(res) {
    // save the data
    var xml = '';
    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('end', function() {

      /****************************************************/
      // DEBUG MODE: Reading RSS from file
      /****************************************************/
      if (debugmode == true) {
        fs = require('fs');
        fs.readFile('./debug/currentWeather.txt', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          parser.parseString(data, function (err, resultXML) {
            if (err != null || resultXML == null) {
              callback(null, 'Error parsing current weather XML.');
              return
            }

            var description = resultXML.rss.channel.item.description;
            string = description.replace(/\s\s+/g, ' ');
            var result = string.match(/<p>(.+?)<\/p>/g);
            if (result != null && result[0]) {
              var trimmedResult = result[0].replace(/<\/?p>/g , '');
              trimmedResult = trimmedResult.replace(/<br\/>/g, '\n');
              trimmedResult = trimmedResult.replace(/<img (.+?)>/g, '');
              callback(trimmedResult, null, resultXML);
            } else {
              callback(null, 'Error parsing current weather XML.')
            }
          });
        });
      }

      /****************************************************/
      // END DEBUG MODE
      /****************************************************/
      else {
        parser.parseString(xml, function (err, resultXML) {
          if (err != null || resultXML == null) {
            callback(null, 'Error parsing current weather XML.');
            return
          }

          var description = resultXML.rss.channel.item.description;
          string = description.replace(/\s\s+/g, ' ');
          string = string.replace(/\n/g, '');
          var result = string.match(/<p>(.+?)<\/p>/g);
          if (result != null && result[0]) {
            var trimmedResult = result[0].replace(/<\/?p>/g , '');
            trimmedResult = trimmedResult.replace(/<br\/>/g, '\n');
            trimmedResult = trimmedResult.replace(/<img (.+?)>/g, '');
            callback(trimmedResult, null, resultXML);
          } else {
            callback(null, 'Error parsing current weather XML.')
          }
        });
      }
    });
  });

  req.on('error', function(err) {
    console.log("Error");
  });
}

function getWarning(url, callback) {
  var red = http.get(url, function(res) {

    var xml = '';
    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('end', function() {

      /****************************************************/
      // DEBUG MODE: Reading RSS from file
      /****************************************************/
      if (debugmode == true) {
        fs = require('fs');
        fs.readFile('./debug/warning.txt', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          parser.parseString(data, function (err, result) {
            if (err != null || result == null) {
              callback(null, 'Error parsing warning XML.');
              return
            }

            var title = result.rss.channel.item.title;
            title = title.replace(/\s\s+/g, ' ');
            callback(title, null, result);
          });
        });
      }

      /****************************************************/
      // END DEBUG MODE
      /****************************************************/

      else {
        parser.parseString(xml, function(err, result) {
          if (err != null || result == null) {
            callback(null, 'Error parsing warning XML.')
            return
          }
          var title = result.rss.channel.item.title;
          title = title.replace(/\s\s+/g, ' ');
          callback(title, null, result);
        });
      }
    });

  });
}

function pollFeedRSS() {
  pollCurrentWeatherFeed();
}

function pollCurrentWeatherFeed() {
  // Poll current weather feed
  var currentWeatherURL = Constants.webservices.English.rootURL+Constants.webservices.English.currentWeatherRSS;
  getCurrentWeather(currentWeatherURL, function(result, err, xml) {
    if (err != null) {
      console.log(err);
      return
    }

    var publishDate = xml.rss.channel.item.pubDate;
    if (publishDate == null) {
      console.log('Publish date is null');
      return
    }

    dbClass.getLastPubDate(dbInstance, Constants.topics.current, publishDate, function(err, results) {
      if (err == null && results != null) {
        console.log('Send messages to subscribers, current weather update.');
        sendMessagesToSubscribers(Constants.databaseCollections.subscribersCurrent, Constants.topics.current, getCurrentWeather);
      }

      if (results == null || err != null) {
        console.log('No updates for current weather.');
      }
    });
  });
}

function sendMessagesToSubscribers(collectionId, type, getMethod) {
  dbClass.getSubscribers(dbInstance, collectionId, function(err, documents) {
    if (err) {
      console.log(err);
      return
    }

    documents.forEach( function(doc) {
      var id = doc._id;
      var chatId = doc.chatId;
      var replyId = doc.replyId;
      sendMessageWithFormattedLanguage(id, chatId, type, replyId, getMethod, true);
    });
  });
}

function sendMessageWithFormattedLanguage(userId, chatId, type, replyId, getMethod, update) {
  if (dbInstance != null) {
    dbClass.getPreferedLanguage(dbInstance, userId, function(err, callback) {
      if (err == null) {
        var url = getCorrectURL(callback, type);
        var resp2 = getMethod(url, function (result, err) {
          if (err == null) {
            if (update != null) {
              result = 'UPDATE: \n\n' + result;
            }
            bot.sendMessage(chatId, result, {reply_to_message_id: replyId});
          } else {
            bot.sendMessage(chatId, err, {reply_to_message_id: replyId});
          }
        });
      } else {
        console.log(err);
        bot.sendMessage(chatId, err, {reply_to_message_id: replyId});
      }
    });
  }
}
