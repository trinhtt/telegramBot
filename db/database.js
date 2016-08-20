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

exports.writeSubscriber = function(db, collectionId, msg, callback) {
  var collection = db.collection(collectionId);
  var cID = msg.chat.id;
  var rID = msg.message_id;
  var uID = msg.from.id;
  var subscriber = { _id: uID, chatId: cID, replyId: rID};
  collection.save(subscriber, function(err, results) {
    if (err == null) {
      callback(null, 'Subscribe successfully!');
    } else {
      createUserCallback('Error subscribing.', null);
    }
  });
}

exports.deleteSubscriber = function(db, collectionId, userId, callback) {
  var collection = db.collection(collectionId);
  collection.remove({_id: userId}, function(err, results) {
    if (err == null) {
      callback(null, 'Unsubscribe successfully!');
    } else {
      createUserCallback('Error Unsubscribe.', null);
    }
  });
}

exports.getLastPubDate = function(db, collectionId, lastPubDate, callback) {
  var collection = db.collection(constants.databaseCollections.pubDate);

  collection.findOne({_id: collectionId}, function(err, document) {
    if (err != null) {
      console.log('Error finding user.');
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
      console.log('Error writing pubDate.');
      callback(err, null);
    }
  });
}
