/****************************************************/
// Message initialization
/****************************************************/

var Message = function (msg) {
  this.chatId = msg.chat.id;
  this.userId = msg.from.id;
  this.replyId = msg.message_id;
}

module.exports = Message;
