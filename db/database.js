var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var self = require('./database.js');
var constants = require('../utils/constants.js');
var host = 'localhost';
var port = '27017';

// Connection URL
var url = 'mongodb://' + host + ':' +
          port +'/telegrambot';

// Use connect method to connect to the Server
exports.connect = function(callback) {
  MongoClient.connect(url, function(err, database) {
    if (err == null) {
      console.log(constants.successMessages.databaseConnectionSuccess);
      callback(database, null);
    } else {
      console.log(constants.errorMessages.databaseConnectionError);
      callback(null, err);
    }
  });
}

exports.getPreferedLanguage = function(db, id, callback) {
  // Retrieve the user by its ids
  var collection = db.collection(constants.databaseCollections.users);
  collection.findOne({_id: id}, function(err, document) {
    if (err != null) {
      console.log(constants.errorMessages.noUserFoundError);
      callback(err, null)
    }

    if (document == null) {
      console.log(constants.errorMessages.noUserFoundCreateNewError);
      var defaultLang = constants.databaseKeys.English.key;
      self.createNewUserPreferences(db, id, defaultLang, function(err, results) {
        if (err == null) {
          console.log(constants.successMessages.defaultLanguage);
          callback(null, results);
        } else {
          console.log(constants.errorMessages.cantRetrieveLanguage);
          callback(err, null);
        }
      });
    } else {
      console.log(constants.successMessages.foundLanguage);
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
      console.log(constants.successMessages.userInsertSuccess);
      createUserCallback(null, results);
    } else {
      console.log(constants.errorMessages.userInsertError);
      createUserCallback(err, null);
    }
  });
}

exports.writeSubscriber = function(db, collectionId, message, callback) {
  var collection = db.collection(collectionId);
  var subscriber = { _id: message.userId, chatId: message.chatId, replyId: message.replyId};
  collection.save(subscriber, function(err, results) {
    if (err == null) {
      callback(null, constants.successMessages.subscriptionSuccess);
    } else {
      callback(constants.errorMessages.subscriptionError, null);
    }
  });
}

exports.deleteSubscriber = function(db, collectionId, userId, callback) {
  var collection = db.collection(collectionId);
  collection.remove({_id: userId}, function(err, results) {
    if (err == null) {
      callback(null, constants.successMessages.unsubscriptionSuccess);
    } else {
      callback(constants.errorMessages.unsubscriptionError, null);
    }
  });
}

exports.getLastPubDate = function(db, collectionId, lastPubDate, callback) {
  var collection = db.collection(constants.databaseCollections.pubDate);

  collection.findOne({_id: collectionId}, function(err, document) {
    if (err != null) {
      console.log(constants.errorMessages.noUserFoundError);
      callback(err, null);
    }

    // Create a new pubDate if the document is null
    if (document == null) {
      writePubDate(db, collectionId, lastPubDate, function(err, results) {
        if (err != null) {
          callback(err, null);
        } else {
          callback(null, true);
        }
      });
    } else {
      var date1 = new Date(document.pubDate);
      var date2 = new Date(lastPubDate);

      if (date2 > date1) {
        writePubDate(db, collectionId, lastPubDate, function(err, results) {
          if (err != null) {
            callback(err, null);
          } else {
            callback(null, true);
          }
        });
      } else {
        callback(null, null);
      }
    }
  });

}

exports.getSubscribers = function(db, collectionId, callback) {
  var collection = db.collection(collectionId);
  var results = collection.find()
  callback(null, results);
}

function writePubDate(db, collectionId, lastPubDate, callback) {
  var collection = db.collection(constants.databaseCollections.pubDate);
  var doc = { _id: collectionId, pubDate: lastPubDate};
  collection.save(doc, function(err, results) {
    if (err == null) {
      console.log('Writing last pubDate for ' + collectionId);
      callback(null, results);
    } else {
      console.log(constants.errorMessages.pubDateError);
      callback(err, null);
    }
  });
}
