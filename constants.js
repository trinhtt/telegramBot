exports.webservices = {
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
}

exports.topics = {
  current: 'current',
  warning: 'warning'
}

exports.databaseKeys = {
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
}

exports.databaseCollections = {
  users: 'users'
}
