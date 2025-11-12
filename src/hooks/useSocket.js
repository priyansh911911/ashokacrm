import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = import.meta.env.VITE_API_URL || 'https://ashoka-api.shineinfosolutions.in';
    console.log('🔗 Connecting to Socket.IO server:', socketUrl);
    
    socketRef.current = io(socketUrl, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    // Connection event handlers
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('🔗 WebSocket connected to:', socketUrl);
      console.log('🆔 Socket ID:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('❌ WebSocket disconnected:', reason);
    });
    
    socketRef.current.on('connect_error', (error) => {
      console.error('🚫 WebSocket connection error:', error);
      setIsConnected(false);
    });
    
    socketRef.current.on('reconnect', (attemptNumber) => {
      console.log('🔄 WebSocket reconnected after', attemptNumber, 'attempts');
    });
    
    socketRef.current.on('reconnect_error', (error) => {
      console.error('🚫 WebSocket reconnection error:', error);
    });

    // Join rooms
    socketRef.current.emit('join-waiter-dashboard');
    socketRef.current.emit('join-pantry-updates');
    socketRef.current.emit('join-kitchen-updates');

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinRoom = (room) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-room', room);
    }
  };

  const leaveRoom = (room) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', room);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    joinRoom,
    leaveRoom
  };
};

// Real-time pantry hook
export const usePantrySocket = (onOrderUpdate, onItemUpdate, onVendorUpdate) => {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for real-time updates
    socket.on('pantry-order-created', onOrderUpdate);
    socket.on('pantry-order-updated', onOrderUpdate);
    socket.on('pantry-item-updated', onItemUpdate);
    socket.on('vendor-updated', onVendorUpdate);

    return () => {
      socket.off('pantry-order-created');
      socket.off('pantry-order-updated');
      socket.off('pantry-item-updated');
      socket.off('vendor-updated');
    };
  }, [socket, isConnected, onOrderUpdate, onItemUpdate, onVendorUpdate]);

  return { socket, isConnected };
};

export default useSocket;
