var formatter = require('../utils/formatter.js');
var dbClass = require('./../db/database.js');
var weatherServices = require('../services/weatherServices.js');
var constants = require('../utils/constants.js');
var dbInstance = null;
var bot = null;

/****************************************************/
// Operations initialization
/****************************************************/

function init(botClass,db){
  bot = botClass;
  dbInstance = db;
}

/****************************************************/
// Private methods
/****************************************************/

function sendMessagesToSubscribers(collectionId, type, getMethod) {
  dbClass.getSubscribers(dbInstance, collectionId, function(err, documents) {
    if (err) {
      console.log(err);
      return
    }

    documents.forEach( function(doc) {
      var id = doc._id;
      var chatId = doc.chatId;
      var replyId = doc.replyId;
      sendMessageWithFormattedLanguage(id, chatId, type, replyId, getMethod, true);
    });
  });
}

function sendMessageWithFormattedLanguage(userId, chatId, type, replyId, getMethod, update) {
  if (dbInstance != null) {
    dbClass.getPreferedLanguage(dbInstance, userId, function(err, callback) {
      if (err == null) {
        var url = formatter.getCorrectURL(callback, type);
        var resp2 = getMethod(url, function (result, err) {
          if (err == null) {
            if (update != null) {
              result = 'UPDATE: \n\n' + result;
            }
            bot.sendMessage(chatId, result, {reply_to_message_id: replyId});
          } else {
            bot.sendMessage(chatId, err, {reply_to_message_id: replyId});
          }
        });
      } else {
        console.log(err);
        bot.sendMessage(chatId, err, {reply_to_message_id: replyId});
      }
    });
  }
}

function writeSubscriber(collectionId, msg, chatId, replyId) {
  dbClass.writeSubscriber(dbInstance, collectionId, msg, function(err, result) {
    if (err == null) {
      bot.sendMessage(chatId, result, {reply_to_message_id: replyId});
    } else {
      bot.sendMessage(chatId, err, {reply_to_message_id: replyId});
    }
  });
}

function deleteSubscriber(collectionId, userId, chatId, replyId) {
  dbClass.deleteSubscriber(dbInstance, collectionId, userId, function(err, result) {
    if (err == null) {
      bot.sendMessage(chatId, result, {reply_to_message_id: replyId});
    } else {
      bot.sendMessage(chatId, err, {reply_to_message_id: replyId});
    }
  });
}

function getPreferedLanguage(userId, chatId, replyId) {
  dbClass.getPreferedLanguage(dbInstance, userId, function(err, callback) {
    if (err == null) {
      bot.sendMessage(chatId, 'Current language is ' + formatter.getFormattedLanguage(callback), {reply_to_message_id: replyId});
    } else {
      console.log(err);
      bot.sendMessage(chatId, 'Couldnt find prefered language for user.', {reply_to_message_id: replyId});
    }
  });
}

function createNewUserPreferences(userId, lang, chatId, replyId) {
  dbClass.createNewUserPreferences(dbInstance, userId, lang, function(err, results) {
    if (err == null) {
      bot.sendMessage(chatId, 'Set new language: ' + lang, {reply_to_message_id: replyId});
    } else {
      bot.sendMessage(chatId, 'Couldnt change language.', {reply_to_message_id: replyId});
    }
  });
}

function sendMessageIfUpdate(topic, collectionId, getMethod) {
  var polling;
  if (topic == constants.topics.current) {
    polling = weatherServices.pollCurrentWeatherFeed;
  } else {
    polling = weatherServices.pollWarningFeed;
  }

  polling(function(error, topic, collectionId, publishDate) {
    if (error != null) {
      console.log(error);
    } else {
      dbClass.getLastPubDate(dbInstance, topic, publishDate, function(err, results) {
        if (err == null && results != null) {
          // TODO: Send messages to subscribers
          console.log('Send messages to subscribers, ' + topic + ' update.');
          operations.sendMessagesToSubscribers(collectionId, topic, getMethod);
        }

        if (results == null || err != null) {
          console.log('No updates for ' + topic);
        }
      });
    }
  });
}

/****************************************************/
// Exporting operations
/****************************************************/
var operations = {
    init : init,
    sendMessageWithFormattedLanguage: sendMessageWithFormattedLanguage,
    writeSubscriber: writeSubscriber,
    deleteSubscriber: deleteSubscriber,
    getPreferedLanguage: getPreferedLanguage,
    createNewUserPreferences: createNewUserPreferences,
    sendMessagesToSubscribers: sendMessagesToSubscribers,
    sendMessageIfUpdate: sendMessageIfUpdate
};


module.exports = operations;
