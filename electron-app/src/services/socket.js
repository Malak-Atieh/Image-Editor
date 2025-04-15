class SocketService {
  constructor() {
    this.socket = null;
    this.messageCallbacks = [];
    this.connectionCallbacks = [];
    this.errorCallbacks = [];
  }
  connect = async (token, userId) => {
    try {
      // Close existing connection if any
      this.disconnect(); 

      this.socket = new WebSocket('ws://localhost:3001');
      
      this.socket.onopen = () => {
        this.socket.send(JSON.stringify({
          type: 'auth',
          token,
          userId
        }));
        this.connectionCallbacks.forEach(cb => cb(true));
      };

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.messageCallbacks.forEach(cb => cb(message));
      };

      this.socket.onerror = (error) => {
        this.errorCallbacks.forEach(cb => cb(error));
      };

      this.socket.onclose = () => {
        this.connectionCallbacks.forEach(cb => cb(false));
      };

    } catch (error) {
      this.errorCallbacks.forEach(cb => cb(error));
    }
  };

  sendMessage = (content) => {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        content
      }));
    }
  };

    onMessage(callback) {
      this.messageCallbacks.push(callback);
    }
    onConnectionChange = (callback) => {
      this.connectionCallbacks.push(callback);
    };
  
    onError = (callback) => {
      this.errorCallbacks.push(callback);
    };
  
    disconnect = () => {
      this.socket?.close();
    };
  }
  
  export default new SocketService();