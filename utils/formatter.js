
var Constants = require('./constants.js');
var xml2js = require('xml2js');
var fs = require('fs');
var parser = new xml2js.Parser({explicitArray : false});

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

function getCorrectURL(language, type) {
  switch (language) {
    case Constants.databaseKeys.English.key:
      if (type == Constants.topics.current) {
        return Constants.webservices.English.rootURL+Constants.webservices.English.currentWeatherRSS
      } else if (type == Constants.topics.warning) {
        return Constants.webservices.English.rootURL+Constants.webservices.English.warningRSS
      }

    case Constants.databaseKeys.SimplifiedChinese.key:
      if (type == Constants.topics.current) {
        return Constants.webservices.SimplifiedChinese.rootURL+Constants.webservices.SimplifiedChinese.currentWeatherRSS
      } else if (type == Constants.topics.warning) {
        return Constants.webservices.SimplifiedChinese.rootURL+Constants.webservices.SimplifiedChinese.warningRSS
      }

    case Constants.databaseKeys.TraditionalChinese.key:
      if (type == Constants.topics.current) {
        return Constants.webservices.TraditionalChinese.rootURL+Constants.webservices.TraditionalChinese.currentWeatherRSS
      } else if (type == Constants.topics.warning) {
        return Constants.webservices.TraditionalChinese.rootURL+Constants.webservices.TraditionalChinese.warningRSS
      }

    default:
      return Constants.webservices.English.rootURL+Constants.webservices.English.currentWeatherRSS
  }
}

function getCorrectData(topic, data, debugmode, callback) {
  var file;

  if (debugmode == true) {
    if (topic == Constants.topics.current) {
      file = './debug/currentWeather.txt';
    } else {
      file = './debug/warning.txt';
    }

    fs.readFile(file, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      parseXML(data, topic, function(trimmedResult, err, resultXML) {
        if (err != null) {
          callback(null, err);
        } else {
          callback(trimmedResult, null, resultXML);
        }
      });
    });
  } else {
    parseXML(data, topic, function(trimmedResult, err, resultXML) {
      if (err != null) {
        callback(null, err);
      } else {
        callback(trimmedResult, null, resultXML);
      }
    });
  }
}

function parseXML(data, topic, callback) {
  parser.parseString(data, function (err, resultXML) {
    if (err != null || resultXML == null) {
      callback(null, Constants.errorMessages.XMLParsingError);
      return
    }

    if (topic == Constants.topics.current) {
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
        callback(null, Constants.errorMessages.XMLParsingError)
      }
    } else {
      var title = resultXML.rss.channel.item
      if (title.constructor === Array) {
        title = title[0].title;
      } else {
        title = title.title;
      }
      title = title.replace(/\s\s+/g, ' ');
      callback(title, null, resultXML);
    }

  });
}

var formatter = {
  getCorrectURL : getCorrectURL,
  getFormattedLanguage: getFormattedLanguage,
  getCorrectData: getCorrectData
};

module.exports = formatter;
