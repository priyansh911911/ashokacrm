import { useEffect, useRef, useState } from 'react';

const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const [readyState, setReadyState] = useState(0);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000;

  const connect = () => {
    try {
      const ws = new WebSocket('ws://localhost:5000/banquet-ws');
      
      ws.onopen = () => {
        setReadyState(1);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (error) {
          setLastMessage(event.data);
        }
      };

      ws.onclose = () => {
        setReadyState(3);
        console.log('WebSocket disconnected');
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setReadyState(3);
      };

      setSocket(ws);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const sendMessage = (message) => {
    if (socket && readyState === 1) {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message));
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
