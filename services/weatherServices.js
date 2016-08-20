var http = require('http');
var debugmode = false;
var Constants = require('../utils/constants.js');
var formatter = require('../utils/formatter.js');
var dbClass = require('../db/database.js');

function getCurrentWeather(url, callback) {
  var req = http.get(url, function(res) {
    // save the data
    var xml = '';
    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('end', function() {
      formatter.getCorrectData(Constants.topics.current, xml, debugmode, function(trimmedResult, err, resultXML) {
        if (err != null) {
          callback(null, err);
        } else {
          callback(trimmedResult, null, resultXML);
        }
      });
    });
  });

  req.on('error', function(err) {
    console.log(err);
  });
}

function getWarning(url, callback) {
  var red = http.get(url, function(res) {

    var xml = '';
    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('end', function() {
      formatter.getCorrectData(Constants.topics.warning, xml, debugmode, function(trimmedResult, err, resultXML) {
        if (err != null) {
          callback(null, err);
        } else {
          callback(trimmedResult, null, resultXML);
        }
      });
    });

  });
}

function pollWarningFeed(callback) {
  // Poll warning feed
  var currentWarningURL = Constants.webservices.English.rootURL+Constants.webservices.English.warningRSS;
  getWarning(currentWarningURL, function(title, err, res) {
    if (err != null) {
      callback(err);
      return
    }

    var publishDate = res.rss.channel.pubDate;
    if (publishDate == null) {
      callback(Constants.errorMessages.publishDateNull);
      return
    }

    callback(null, Constants.topics.warning, Constants.databaseCollections.subscribersWarning, publishDate);
  });
}

function pollCurrentWeatherFeed(callback) {
  // Poll current weather feed
  var currentWeatherURL = Constants.webservices.English.rootURL+Constants.webservices.English.currentWeatherRSS;
  getCurrentWeather(currentWeatherURL, function(result, err, xml) {
    if (err != null) {
      callback(err);
      return
    }

    var publishDate = xml.rss.channel.item.pubDate;
    if (publishDate == null) {
      callback(Constants.errorMessages.publishDateNull);
      return
    }

    callback(null, Constants.topics.current, Constants.databaseCollections.subscribersCurrent, publishDate);
  });
}


var weatherServices = {
  getCurrentWeather : getCurrentWeather,
  getWarning : getWarning,
  pollWarningFeed: pollWarningFeed,
  pollCurrentWeatherFeed: pollCurrentWeatherFeed
}

module.exports = weatherServices;
