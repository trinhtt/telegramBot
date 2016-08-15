var TelegramBot = require('node-telegram-bot-api');
var dbClass = require('./database.js');
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
