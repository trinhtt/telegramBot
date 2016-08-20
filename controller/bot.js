var Constants = require('../utils/constants.js');
var formatter = require('../utils/formatter.js');
var weatherService = require('../services/weatherServices.js');
var operations = require('./operations.js');
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

  operations.init(bot, dbInstance);
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

    operations.sendMessageWithFormattedLanguage(userId, chatId, Constants.topics.current, replyId, weatherService.getCurrentWeather);
  });

  bot.onText(/\/warning/, function (msg) {
    var chatId = msg.chat.id;
    var userId = msg.from.id;
    var replyId = msg.message_id;

    operations.sendMessageWithFormattedLanguage(userId, chatId, Constants.topics.warning, replyId, weatherService.getWarning);
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

    operations.writeSubscriber(collectionId, msg, chatId, replyId);
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

    operations.deleteSubscriber(collectionId, userId, chatId, replyId);
  });

  bot.onText(/\/language/, function (msg) {
    var chatId = msg.chat.id;
    var userId = msg.from.id;
    var replyId = msg.message_id;

    operations.getPreferedLanguage(userId, chatId, replyId);
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

    operations.createNewUserPreferences(userId, lang, chatId, replyId)
  });
}

/****************************************************/
// Exporting Bot
/****************************************************/
var bot = {
    init : init
};


module.exports = bot;
