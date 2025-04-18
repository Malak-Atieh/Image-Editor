const Message = require('../models/Message');

const MessageController = {
  async handleNewMessage(ws, wss, message) {
    const messageId = await Message.save(ws.userId, message.content);

    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          id: messageId,
          type: 'message',
          userId: ws.userId,
          name: ws.name,
          content: message.content,
          timestamp: new Date().toISOString()
        }));
      }
    });
  },

  async sendRecentMessages(ws) {
    const messages = await Message.getRecent();
    ws.send(JSON.stringify({ type: 'messages', messages }));
  }
};

module.exports = MessageController;
