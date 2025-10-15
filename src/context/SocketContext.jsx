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
    let newSocket = null;
    let connectionAttempts = 0;
    const maxAttempts = 2;

    const connectSocket = () => {
      if (connectionAttempts >= maxAttempts) {
        console.log('Socket connection failed after max attempts');
        return;
      }

      connectionAttempts++;
      
      newSocket = io(import.meta.env.VITE_API_URL || 'https://ashoka-backend.vercel.app', {
        transports: ['polling', 'websocket'],
        autoConnect: true,
        forceNew: true,
        timeout: 3000,
        reconnection: false // Disable automatic reconnection to prevent spam
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
        connectionAttempts = 0; // Reset on successful connection
        newSocket.emit('join-waiter-dashboard');
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.log('Socket connection failed - server may be offline');
        setIsConnected(false);
        newSocket.close();
        
        // Retry after delay if under max attempts
        if (connectionAttempts < maxAttempts) {
          setTimeout(connectSocket, 3000);
        }
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