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
