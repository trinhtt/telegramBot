var TelegramBot = require('node-telegram-bot-api');
var dbClass = require('./db/database.js');
var Constants = require('./utils/constants.js');
var weatherService = require('./services/weatherServices.js');
var botClass = require('./controller/bot.js');
var formatter = require('./utils/formatter.js');
var token = process.env.TELEGRAM_BOT_TOKEN || '<INSERT TOKEN HERE>';
var debugmode = false;
var dbInstance;

/****************************************************/
// Setting up the bot
/****************************************************/
var options = {
  polling: true
};

var bot = new TelegramBot(token, options);

/****************************************************/
// Setting up the database
/****************************************************/
dbClass.connect(function(database, err) {
  if (err == null) {
    dbInstance = database;
    botClass.init(bot, database);
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
// Private methods
/****************************************************/

function pollFeedRSS() {
  pollCurrentWeatherFeed();
  pollWarningFeed();
}

function pollCurrentWeatherFeed() {
  // Poll current weather feed
  var currentWeatherURL = Constants.webservices.English.rootURL+Constants.webservices.English.currentWeatherRSS;
  weatherService.getCurrentWeather(currentWeatherURL, function(result, err, xml) {
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
        sendMessagesToSubscribers(Constants.databaseCollections.subscribersCurrent, Constants.topics.current, weatherService.getCurrentWeather);
      }

      if (results == null || err != null) {
        console.log('No updates for current weather.');
      }
    });
  });
}

function pollWarningFeed() {
  // Poll warning feed
  var currentWarningURL = Constants.webservices.English.rootURL+Constants.webservices.English.warningRSS;
  weatherService.getWarning(currentWarningURL, function(title, err, res) {
    if (err != null) {
      console.log(err);
      return
    }

    var publishDate = res.rss.channel.pubDate;
    if (publishDate == null) {
      console.log('Publish date is null');
      return
    }

    dbClass.getLastPubDate(dbInstance, Constants.topics.warning, publishDate, function(err, results) {
      if (err == null && results != null) {
        // TODO: Send messages to subscribers
        console.log('Send messages to subscribers, warning update.');
        sendMessagesToSubscribers(Constants.databaseCollections.subscribersWarning, Constants.topics.warning, weatherService.getWarning);
      }

      if (results == null || err != null) {
        console.log('No updates for warning.');
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
        var url = formatter.getCorrectURL(callback, type);
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
