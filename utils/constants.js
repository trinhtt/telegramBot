/*
* Constants file
*/
var constants = {

      webservices : {
        English: {
          rootURL: 'http://rss.weather.gov.hk/rss',
          currentWeatherRSS: '/CurrentWeather.xml',
          warningRSS: '/WeatherWarningSummaryv2.xml'
        },
        TraditionalChinese: {
          rootURL: 'http://rss.weather.gov.hk/rss',
          currentWeatherRSS: '/CurrentWeather_uc.xml',
          warningRSS: '/WeatherWarningSummaryv2_uc.xml'
        },
        SimplifiedChinese: {
          rootURL: 'http://gbrss.weather.gov.hk/rss',
          currentWeatherRSS: '/CurrentWeather_uc.xml',
          warningRSS: '/WeatherWarningSummaryv2_uc.xml'
        }
      },

      topics : {
        current: 'current',
        warning: 'warning'
      },

      timerValue : {
        delay: 1000*60*5,
        delayTest: 1000*10
      },

      databaseKeys : {
        English: {
          key: 'en',
          display: 'english'
        },
        TraditionalChinese: {
          key: 'zh_tw',
          display: '繁體中文'
        },
        SimplifiedChinese: {
          key: 'zh_cn',
          display: '简体中文'
        }
      },

      databaseCollections : {
        users: 'users',
        pubDate: 'pubDate',
        subscribersCurrent: 'subscribersCurrent',
        subscribersWarning: 'subscribersWarning'
      },

      helpText : {
        text: 'Available commands:\n\n' +
              '\\help: Displays all the available commands\n\n' +
              '\\current: Displays the current weather\n\n' +
              '\\warning: Displays weather warning\n\n' +
              '\\language: Displays the language you will receive the results\n\n' +
              '\\subscribe (current|warning): Subscribe to current or warning feed. When there is something new, you will receive a notification\n\n' +
              '\\unsubscribe (current|warning): To unsubscribe to a feed. You won\'t receive notifications anymore.\n\n' +
              '\\topics: Topics that you can query the bot\n\n' +
              '\\(english)(simplified)(traditional): Change the language you will receive the results'
      },

      errorMessages : {
        databaseConnectionError: 'Couldn\'t connect to database',
        noUserFoundError: 'No user found',
        noUserFoundCreateNewError: 'Couldn\'t find the user. Creating a new one.',
        cantRetrieveLanguage: 'Couldn\'t retrieve prefered language for this user',
        userInsertError: 'Error creating user',
        subscriptionError: 'Error subscribing to topic',
        unsubscriptionError: 'Error unsubscribing to topic',
        pubDateError: 'Error writing pubDate',
        XMLParsingError: 'Error parsing XML',
        publishDateNull: 'Publish date is null'
      },

      successMessages : {
        databaseConnectionSuccess: 'Connected correctly to database',
        defaultLanguage: 'Default language is English',
        foundLanguage: 'Found prefered language for user',
        userInsertSuccess: 'User inserted successfully!',
        subscriptionSuccess: 'Subscribed successfully!',
        unsubscriptionSuccess: 'Unsubscribed successfully!',
        pubDateSuccess: 'Writing pubDate successfully!'
      },

      botMessages: {
        currentLanguage: 'Current language is ',
        noUpdate: 'No update for ',
        sendMessage: 'Send messages to subscriber, '
      }

};

module.exports = constants;
