var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var host = 'localhost';
var port = '27017';

// Connection URL
var url = 'mongodb://' + host + ':' +
          port +'/telegrambot';

// Use connect method to connect to the Server
exports.connect = function(callback) {
  MongoClient.connect(url, function(err, database) {
    if (err == null) {
      console.log("Connected correctly to server");
      callback(database, null);
    } else {
      console.log("Couldn't connect to server");
      callback(null, err);
    }
  });
}
