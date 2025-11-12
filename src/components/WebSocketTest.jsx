import React from 'react';
import useSocket from '../hooks/useSocket';

const WebSocketTest = () => {
  const { socket, isConnected } = useSocket();

  const testConnection = () => {
    if (socket && isConnected) {
      socket.emit('test-message', { message: 'Hello from frontend!' });
      console.log('Test message sent');
    } else {
      console.log('Socket not connected');
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: isConnected ? '#4CAF50' : '#f44336',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 9999
    }}>
      <div>WebSocket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</div>
      <div>Server: {import.meta.env.VITE_API_URL || 'localhost:5000'}</div>
      <button onClick={testConnection} style={{ marginTop: '5px' }}>
        Test Connection
      </button>
    </div>
  );
};

export default WebSocketTest;