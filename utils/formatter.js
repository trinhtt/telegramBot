
var Constants = require('./constants.js');

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

var formatter = {
  getCorrectURL : getCorrectURL,
  getFormattedLanguage :getFormattedLanguage
};

module.exports = formatter;
