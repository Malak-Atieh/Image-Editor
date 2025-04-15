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
// server.js (WebSocket server)
wss.on('connection', async (ws, req) => {
  console.log("hereee");
  // Authentication middleware
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      
      if (message.type === 'auth') {
        const decoded = jwt.verify(message.token, process.env.JWT_SECRET);
        ws.userId = decoded.sub; // Standard JWT uses 'sub' for user ID
        ws.username = decoded.name;
        console.log(`User ${ws.username} connected`);
        
        // Send message history
        const messages = await getRecentMessages();
        ws.send(JSON.stringify({
          type: 'history',
          messages: messages.reverse()
        }));
        return;
      }

      if (message.type === 'message' && ws.userId) {
        const messageId = await saveMessage(ws.userId, message.content);
        
        // Broadcast to all clients
        wss.clients.forEach(client => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              id: messageId,
              type: 'message',
              userId: ws.userId,
              username: ws.username,
              content: message.content,
              timestamp: new Date().toISOString()
            }));
          }
        });
      }
    } catch (error) {
      console.error('WebSocket error:', error);
      if (error.name === 'JsonWebTokenError') {
        ws.close(1008, 'Invalid token');
      }
    }
  });
});

console.log('WebSocket server running on ws://localhost:3001');