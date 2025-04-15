import { useEffect, useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Connect to WebSocket
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('WebSocket connected');
      if (!token) {
        console.error('No token found!');
        return;
      }
      // Authenticate with JWT
      ws.send(JSON.stringify({
        type: 'auth',
        token: token
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'history') {
        setMessages(data.messages);
      } 
      else if (data.type === 'message') {
        setMessages(prev => [data, ...prev]);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [token]);

  const sendMessage = (content) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        content: content
      }));
    }
  };

  return (
    <div>
      {/* Message list */}
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.username}:</strong> {msg.content}
        </div>
      ))}
      
      {/* Message input */}
      <input 
        type="text" 
        onClick={(e) => {
          if (e.key === 'Enter' && e.target.value) {
            sendMessage(e.target.value);
            e.target.value = '';
          }
        }}
      />
    </div>
  );
};

export default Chat;