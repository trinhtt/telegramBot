var TelegramBot = require('node-telegram-bot-api');
var dbClass = require('./db/database.js');
var Constants = require('./utils/constants.js');
var weatherService = require('./services/weatherServices.js');
var botClass = require('./controller/bot.js');
var formatter = require('./utils/formatter.js');
var operations = require('./controller/operations.js');
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
    operations.init(bot, database);

    /****************************************************/
    // Polling the RSS feed with a timer
    /****************************************************/
    var timer = setInterval(pollFeedRSS, Constants.timerValue.delayTest);

  } else {
    console.log(err);
    return
  }
});

/****************************************************/
// Private methods
/****************************************************/

function pollFeedRSS() {
  operations.sendMessageIfUpdate(Constants.topics.current, Constants.databaseCollections.subscribersCurrent, weatherService.getCurrentWeather);
  operations.sendMessageIfUpdate(Constants.topics.warning, Constants.databaseCollections.subscribersWarning, weatherService.getWarning);
}
