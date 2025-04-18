process.env.TZ = 'UTC';
require('dotenv').config();

const WebSocket = require('ws');
const handleWebSocketConnection = require('./routes/websocket');

const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
  console.log("New client connected");
  handleWebSocketConnection(ws, wss);
});

console.log('WebSocket server running on ws://localhost:3001');
