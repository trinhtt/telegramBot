var http = require('http');
var debugmode = true;
var xml2js = require('xml2js');
var Constants = require('../utils/constants.js');
var parser = new xml2js.Parser({explicitArray : false});
var dbClass = require('../db/database.js');

function getCurrentWeather(url, callback) {
  var req = http.get(url, function(res) {
    // save the data
    var xml = '';
    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('end', function() {

      /****************************************************/
      // DEBUG MODE: Reading RSS from file
      /****************************************************/
      if (debugmode == true) {
        fs = require('fs');
        fs.readFile('./debug/currentWeather.txt', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          parser.parseString(data, function (err, resultXML) {
            if (err != null || resultXML == null) {
              callback(null, 'Error parsing current weather XML.');
              return
            }

            var description = resultXML.rss.channel.item.description;
            string = description.replace(/\s\s+/g, ' ');
            var result = string.match(/<p>(.+?)<\/p>/g);
            if (result != null && result[0]) {
              var trimmedResult = result[0].replace(/<\/?p>/g , '');
              trimmedResult = trimmedResult.replace(/<br\/>/g, '\n');
              trimmedResult = trimmedResult.replace(/<img (.+?)>/g, '');
              callback(trimmedResult, null, resultXML);
            } else {
              callback(null, 'Error parsing current weather XML.')
            }
          });
        });
      }

      /****************************************************/
      // END DEBUG MODE
      /****************************************************/
      else {
        parser.parseString(xml, function (err, resultXML) {
          if (err != null || resultXML == null) {
            callback(null, 'Error parsing current weather XML.');
            return
          }
          var description = resultXML.rss.channel.item.description;
          string = description.replace(/\s\s+/g, ' ');
          string = string.replace(/\n/g, '');
          var result = string.match(/<p>(.+?)<\/p>/g);
          if (result != null && result[0]) {
            var trimmedResult = result[0].replace(/<\/?p>/g , '');
            trimmedResult = trimmedResult.replace(/<br\/>/g, '\n');
            trimmedResult = trimmedResult.replace(/<img (.+?)>/g, '');
            callback(trimmedResult, null, resultXML);
          } else {
            callback(null, 'Error parsing current weather XML.')
          }
        });
      }
    });
  });

  req.on('error', function(err) {
    console.log("Error on req", err);
  });
}

function getWarning(url, callback) {
  var red = http.get(url, function(res) {

    var xml = '';
    res.on('data', function(chunk) {
      xml += chunk;
    });

    res.on('end', function() {

      /****************************************************/
      // DEBUG MODE: Reading RSS from file
      /****************************************************/
      if (debugmode == true) {
        fs = require('fs');
        fs.readFile('./debug/warning.txt', 'utf8', function (err,data) {
          if (err) {
            return console.log(err);
          }
          parser.parseString(data, function (err, result) {
            if (err != null || result == null) {
              callback(null, 'Error parsing warning XML.');
              return
            }

            var title = result.rss.channel.item.title;
            title = title.replace(/\s\s+/g, ' ');
            callback(title, null, result);
          });
        });
      }

      /****************************************************/
      // END DEBUG MODE
      /****************************************************/

      else {
        parser.parseString(xml, function(err, result) {
          if (err != null || result == null) {
            callback(null, 'Error parsing warning XML.')
            return
          }
          var title = result.rss.channel.item[0].title;
          title = title.replace(/\s\s+/g, ' ');
          callback(title, null, result);
        });
      }
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
      callback('Publish date is null');
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
      callback('Publish date is null');
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
