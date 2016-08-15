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
