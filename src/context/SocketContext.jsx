import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    
    if (!apiUrl) {
      console.log('Socket.io disabled - no API URL configured');
      return;
    }

    let newSocket = null;
    
    const connectSocket = () => {
      newSocket = io(apiUrl, {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        forceNew: true,
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected to server:', apiUrl);
        setIsConnected(true);
        newSocket.emit('join-waiter-dashboard');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection failed:', error.message);
        setIsConnected(false);
      });

      setSocket(newSocket);
    };

    connectSocket();

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
