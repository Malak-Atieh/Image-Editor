process.env.TZ = 'UTC';
require('dotenv').config();
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const wss = new WebSocket.Server({ port: 3001 });

async function saveMessage(userId, content) {
  
  const [result] = await pool.execute(
    'INSERT INTO messages (user_id, content,created_at) VALUES (?, ?, NOW())',
    [userId, content]
  );
  return result.insertId;
}

async function getRecentMessages() {
  
  const [messages] = await pool.execute(
    'SELECT m.*, u.name FROM messages m JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC LIMIT 50'
  );
  return messages;
}
// server.js (WebSocket server)
wss.on('connection',  (ws) => {

  console.log("New client connected");
  // Authentication middleware
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      console.log(message);

      if (message.type === 'auth') {
        const decoded = jwt.verify(message.token, process.env.JWT_SECRET);
        
        ws.userId = decoded.sub; 
        ws.name = decoded.name;

        console.log(`User ${ws.name} connected`);
        
        // Send message history
        const messages = await getRecentMessages();
        ws.send(JSON.stringify({
          type: 'messages',
          messages
        }));
        console.log('Sending message history:', messages);

        return;
      }

      if (message.type === 'new_message' && ws.userId) {
        const messageId = await saveMessage(ws.userId, message.content);
        
        // Broadcast to all clients
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
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
});

console.log('WebSocket server running on ws://localhost:3001');