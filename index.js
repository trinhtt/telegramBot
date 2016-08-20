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
        operations.sendMessagesToSubscribers(Constants.databaseCollections.subscribersCurrent, Constants.topics.current, weatherService.getCurrentWeather);
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
        operations.sendMessagesToSubscribers(Constants.databaseCollections.subscribersWarning, Constants.topics.warning, weatherService.getWarning);
      }

      if (results == null || err != null) {
        console.log('No updates for warning.');
      }
    });

  });
}
