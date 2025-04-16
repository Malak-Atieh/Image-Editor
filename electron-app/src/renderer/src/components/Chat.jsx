// Chat.jsx
import { useState, useEffect, useRef } from 'react';
import '../assets/chat.css';
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const socket = new WebSocket('ws://localhost:3001');
    setWs(socket);

    // Request past messages on open
    socket.onopen = () => {
        
        const token = localStorage.getItem('token');
        console.log("JWT sent to WS:", token);
        if (token) {
            socket.send(JSON.stringify({ 
              type: 'auth', 
              token 
            }));
          }
    };

    // Listen for new messages
    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'messages') {
        console.log(data)
        setMessages(data.messages);
      } else if (data.type === 'new_message') {
        console.log("here ")
        setMessages(prev => [data, ...prev]);
      }


    };

    return () => socket.close();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (input.trim() && ws && ws.readyState === WebSocket.OPEN) {
        
        try{
            const tempMessage  = {
            id: `temp-${Date.now()}`,
            content: input,
            name: 'You',
            timestamp:  new Date().toISOString(),
            isTemp: true
          };
          setMessages(prev => [tempMessage , ...prev]);
          setInput('');
       await ws.send(JSON.stringify({ 
        type: 'new_message', 
        content: input 
      }));
     
    } catch (error) {
        console.error('Failed to send message:', error);
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }
    }
  };

  return (
    <div className="chat-container">
    
    <div className="messages">
      {messages.length === 0 ? (
        <div className="empty-state">No messages yet. Be the first to chat!</div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className="message">
            <div className="message-header">
              <strong>{msg.name || `User ${msg.userId}`}</strong>
              <span className="timestamp">
              {new Date(msg.created_at).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
                })}
              </span>
            </div>
            <div className="message-content">{msg.content}</div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>

    <div className="message-form">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  </div>

  );
};

export default Chat;