import { useState, useEffect, useRef } from 'react';
//import socket from '../../../services/socket';
import '../assets/chat.css';
//import { request } from "../utils/remote/axios";
//mport { requestMethods } from "../utils/enums/request.methods";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token || !user?.id) {
        console.error('authentication required');
        return;
      }
      loadInitialMessages();

      // Socket connection
      socket.connect(token, user.id);
      
      // Socket event handlers
      socket.onMessage((message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });
  
      socket.onConnectionChange((connected) => {
        setIsConnected(connected);
        if (connected) scrollToBottom();
      });
  
      socket.onError((err) => {
        setError('Connection error. Try refreshing.');
        console.error('Socket error:', err);
      });
  
      return () => {
        socket.disconnect();
      };
  }, [token, user.id]);

  const loadInitialMessages = async () => {
    try {
      
      const response =await request({
              method: requestMethods.GET,
              route: "/messages",
            }); 
      setMessages(response.data); 
    } catch (err) {
      setError('Failed to load message history');
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      await socket.sendMessage(input);
      setInput('');
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  return (
    <div className="chat-container">
      <div className="status-bar">
        {error && <div className="error">{error}</div>}
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Online' : 'Offline'}
        </div>
      </div>
      
      <div className="messages">
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet. Be the first to chat!</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id || msg.timestamp} className="message">
              <div className="message-header">
                <strong>{msg.username || `User ${msg.userId}`}</strong>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="message-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!input.trim() || !isConnected}>
          {isConnected ? 'Send' : 'Connecting...'}
        </button>
      </form>
    </div>
  );
};

export default  Chat;