var Constants = require('../utils/constants.js');
var formatter = require('../utils/formatter.js');
var weatherService = require('../services/weatherServices.js');
var dbClass = require('./../db/database.js');
var dbInstance = null;
var bot = null;

/****************************************************/
// Bot initialization
/****************************************************/

function init(botClass,db){
  bot = botClass;
  dbInstance = db;
  bot.getMe().then(function (me) {
    console.log('Hi my name is %s!', me.username);
  });

  settingUpOntext(bot);

}

/****************************************************/
// Bot listening to input
/****************************************************/

function settingUpOntext(bot){
  bot.onText(/\/current/, function (msg) {
    var chatId = msg.chat.id;
    var userId = msg.from.id;
    var replyId = msg.message_id;

    sendMessageWithFormattedLanguage(userId, chatId, Constants.topics.current, replyId, weatherService.getCurrentWeather);
  });

  bot.onText(/\/warning/, function (msg) {
    var chatId = msg.chat.id;
    var userId = msg.from.id;
    var replyId = msg.message_id;

    sendMessageWithFormattedLanguage(userId, chatId, Constants.topics.warning, replyId, weatherService.getWarning);
  });

  bot.onText(/\/topics/, function (msg) {
    var chatId = msg.chat.id;
    var replyId = msg.message_id;
    //TODO: Make enums of topics, no hard coded string
    bot.sendMessage(chatId, 'current, warning', {reply_to_message_id: replyId});
  });

  bot.onText(/\/help/, function (msg) {
    var chatId = msg.chat.id;
    var replyId = msg.message_id;
    bot.sendMessage(chatId, Constants.helpText.text, {reply_to_message_id: replyId});
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
          bot.sendMessage(chatId, 'Current language is ' + formatter.getFormattedLanguage(callback), {reply_to_message_id: replyId});
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
}

/****************************************************/
// Bot methods to send messages
/****************************************************/

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


/****************************************************/
// Exporting Bot
/****************************************************/
var bot = {
    init : init
};


module.exports = bot;
