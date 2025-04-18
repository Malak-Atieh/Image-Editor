const jwt = require('jsonwebtoken');
const MessageController = require('../app/controllers/MessageController');

function handleWebSocketConnection(ws, wss) {
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);

      if (message.type === 'auth') {
        const decoded = jwt.verify(message.token, process.env.JWT_SECRET);
        ws.userId = decoded.sub;
        ws.name = decoded.name;

        console.log(`User ${ws.name} connected`);
        await MessageController.sendRecentMessages(ws);
        return;
      }

      if (message.type === 'new_message' && ws.userId) {
        await MessageController.handleNewMessage(ws, wss, message);
      }
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        ws.close(1008, 'Invalid token');
      } else {
        console.error('Error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Server error'
        }));
      }
    }
  });
}

module.exports = handleWebSocketConnection;
