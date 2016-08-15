var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var self = require('./database.js');
var constants = require('./constants.js');
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

exports.getPreferedLanguage = function(db, id, callback) {
  // Retrieve the user by its ids
  var collection = db.collection(constants.databaseCollections.users);
  collection.findOne({_id: id}, function(err, document) {
    if (err != null) {
      console.log('Error finding user.');
      callback(err, null)
    }

    if (document == null) {
      console.log('Couldnt find the user. Creating a new one.');
      var defaultLang = constants.databaseKeys.English.key;
      self.createNewUserPreferences(db, id, defaultLang, function(err, results) {
        if (err == null) {
          console.log('Default language English');
          callback(null, results);
        } else {
          console.log('Couldnt retrieve prefered language for this user.');
          callback(err, null);
        }
      });
    } else {
      console.log("Found prefered language for user.");
      callback(null, document.language);
    }
  });
}

exports.createNewUserPreferences = function(db, id, lang, createUserCallback) {
  var collection = db.collection(constants.databaseCollections.users);
  // Default language is English
  var user = { _id: id, language: lang};
  collection.save(user, function(err, results) {
    if (err == null) {
      console.log('User inserted successfully!');
      createUserCallback(null, results);
    } else {
      console.log('Error creating user.');
      createUserCallback(err, null);
    }
  });
}
