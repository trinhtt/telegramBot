var TelegramBot = require('node-telegram-bot-api');
var dbClass = require('./database.js');
var Constants = require('./constants.js');
var token = process.env.TELEGRAM_BOT_TOKEN || '<INSERT TOKEN HERE>';
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
  var replyId = msg.message_id;

  bot.sendMessage(chatId, '/current', {reply_to_message_id: replyId});
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
