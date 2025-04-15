require('dotenv').config();
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const pool = mysql.createPool(process.env.DATABASE_URL);

const wss = new WebSocket.Server({ port: 3001 });
async function saveMessage(userId, content) {
  const [result] = await pool.execute(
    'INSERT INTO messages (user_id, content) VALUES (?, ?)',
    [userId, content]
  );
  return result.insertId;
}

async function getRecentMessages() {
  const [messages] = await pool.execute(
    'SELECT m.*, u.username FROM messages m JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC LIMIT 50'
  );
  return messages;
}

wss.on('connection', async (ws, req) => {
  // Send recent messages when client connects
  try {
    const messages = await getRecentMessages();
    ws.send(JSON.stringify({
      type: 'history',
      messages: messages.reverse() // Show oldest first
    }));
  } catch (error) {
    console.error('Failed to load messages:', error);
  }

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      // Authentication
      if (message.type === 'auth') {
        try {
          const decoded = jwt.verify(message.token, process.env.JWT_SECRET);
          ws.userId = decoded.userId;
          ws.username = decoded.username;
          console.log(`User ${ws.username} connected`);
        } catch (error) {
          ws.close(1008, 'Invalid token');
        }
        return;
      }

      // Message handling
      if (message.type === 'message' && ws.userId) {
        const messageId = await saveMessage(ws.userId, message.content);
        
        const broadcastMessage = {
          id: messageId,
          type: 'message',
          userId: ws.userId,
          username: ws.username,
          content: message.content,
          timestamp: new Date().toISOString()
        };

        // Broadcast to all connected clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(broadcastMessage));
          }
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
});

console.log('WebSocket server running on ws://localhost:3001');