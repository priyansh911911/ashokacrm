import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const useSocket = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_URL || 'https://ashoka-backend.vercel.app', {
      transports: ['websocket'],
      autoConnect: true
    });

    // Join waiter dashboard room
    socketRef.current.emit('join-waiter-dashboard');

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return socketRef.current;
};

export default useSocket;