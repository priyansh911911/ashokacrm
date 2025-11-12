import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

const useConditionalSocket = () => {
  const { socket, isConnected } = useSocket();
  const [shouldUseSocket, setShouldUseSocket] = useState(false);

  useEffect(() => {
    // Check if we're on a page that needs Socket.io
    const needsSocket = window.location.pathname.includes('/restaurant') || 
                       window.location.pathname.includes('/kot') ||
                       window.location.pathname.includes('/table');
    
    setShouldUseSocket(needsSocket);
  }, []);

  return {
    socket: shouldUseSocket ? socket : null,
    isConnected: shouldUseSocket ? isConnected : false,
    shouldUseSocket
  };
};

export default useConditionalSocket;
