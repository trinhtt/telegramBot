var TelegramBot = require('node-telegram-bot-api');
var token = process.env.TELEGRAM_BOT_TOKEN || '<INSERT TOKEN HERE>';

var options = {
  polling: true
};
var bot = new TelegramBot(token, options);

bot.getMe().then(function (me) {
  console.log('Hi my name is %s!', me.username);
});
