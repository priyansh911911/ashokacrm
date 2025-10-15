import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);

  useEffect(() => {
    const socketInstance = io('http://localhost:5000');
    
    socketInstance.on('connect', () => {
      setReadyState(1);
      console.log('Socket.io connected');
    });

    socketInstance.on('banquet-update', (data) => {
      setLastMessage(data);
    });

    socketInstance.on('disconnect', () => {
      setReadyState(3);
      console.log('Socket.io disconnected');
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = (message) => {
    if (socket && readyState === 1) {
      socket.emit('banquet-message', message);
    }
  };

  return {
    socket,
    lastMessage,
    readyState,
    sendMessage
  };
};

export default useWebSocket;