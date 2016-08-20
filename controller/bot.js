var Constants = require('../utils/constants.js');
var formatter = require('../utils/formatter.js');
var weatherService = require('../services/weatherServices.js');
var operations = require('./operations.js');
var dbClass = require('./../db/database.js');
var Message = require('../model/message.js');
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
    var message = new Message(msg);

    operations.sendMessageWithFormattedLanguage(message.userId, message.chatId, Constants.topics.current, message.replyId, weatherService.getCurrentWeather);
  });

  bot.onText(/\/warning/, function (msg) {
    var message = new Message(msg);

    operations.sendMessageWithFormattedLanguage(message.userId, message.chatId, Constants.topics.warning, message.replyId, weatherService.getWarning);
  });

  bot.onText(/\/topics/, function (msg) {
    var message = new Message(msg);
    bot.sendMessage(message.chatId, Constants.topics.current + ', ' + Constants.topics.warning, {reply_to_message_id: message.replyId});
  });

  bot.onText(/\/help/, function (msg) {
    var message = new Message(msg);

    bot.sendMessage(message.chatId, Constants.helpText.text, {reply_to_message_id: message.replyId});
  });

  bot.onText(/(\/subscribe current)|(\/subscribe warning)/, function (msg, match) {
    var message = new Message(msg);
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

    operations.writeSubscriber(collectionId, message);
  });

  bot.onText(/(\/unsubscribe current)|(\/unsubscribe warning)/, function (msg, match) {
    var message = new Message(msg);
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

    operations.deleteSubscriber(collectionId, message);
  });

  bot.onText(/\/language/, function (msg) {
    var message = new Message(msg);

    operations.getPreferedLanguage(message);
  });

  bot.onText(/\/(simplified)|(traditional)|(english)/, function (msg, match) {
    var message = new Message(msg);
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

    operations.createNewUserPreferences(message, lang)
  });
}

/****************************************************/
// Exporting Bot
/****************************************************/
var bot = {
    init : init
};


module.exports = bot;
