import { useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { showToast } from '../utils/toaster';
import soundManager from '../utils/sound';

/**
 * Custom hook for real-time order and KOT updates
 * @param {Object} options - Configuration options
 * @param {Function} options.onNewOrder - Callback for new orders
 * @param {Function} options.onOrderStatusUpdate - Callback for order status updates
 * @param {Function} options.onNewKOT - Callback for new KOTs
 * @param {Function} options.onKOTStatusUpdate - Callback for KOT status updates
 * @param {Function} options.onKOTItemUpdate - Callback for KOT item status updates
 * @param {boolean} options.showNotifications - Whether to show toast notifications
 */
export const useOrderSocket = (options = {}) => {
  const { socket, isConnected } = useSocket();
  const {
    onNewOrder,
    onOrderStatusUpdate,
    onNewKOT,
    onKOTStatusUpdate,
    onKOTItemUpdate,
    showNotifications = true
  } = options;

  // Handle new restaurant orders
  const handleNewOrder = useCallback((data) => {
    console.log('🍽️ New restaurant order received:', data);
    
    // Play buzzer sound for new order
    soundManager.playNewKOTSound();
    
    if (showNotifications) {
      showToast.success(`New order for Table ${data.tableNo} - ${data.itemCount} items`);
    }
    
    if (onNewOrder) {
      onNewOrder(data);
    }
  }, [onNewOrder, showNotifications]);

  // Handle order status updates
  const handleOrderStatusUpdate = useCallback((data) => {
    console.log('📋 Order status updated:', data);
    
    if (showNotifications) {
      showToast.info(`Table ${data.tableNo} order ${data.status}`);
    }
    
    if (onOrderStatusUpdate) {
      onOrderStatusUpdate(data);
    }
  }, [onOrderStatusUpdate, showNotifications]);

  // Handle new KOTs
  const handleNewKOT = useCallback((data) => {
    console.log('🧾 New KOT received:', data);
    
    // Play buzzer sound for new KOT
    soundManager.playNewKOTSound();
    
    if (showNotifications) {
      showToast.success(`New KOT #${data.kot.displayNumber} for Table ${data.tableNo}`);
    }
    
    if (onNewKOT) {
      onNewKOT(data);
    }
  }, [onNewKOT, showNotifications]);

  // Handle KOT status updates
  const handleKOTStatusUpdate = useCallback((data) => {
    console.log('🍳 KOT status updated:', data);
    
    if (showNotifications) {
      const statusMessages = {
        pending: 'received',
        preparing: 'being prepared',
        ready: 'ready for serving',
        served: 'served',
        cancelled: 'cancelled'
      };
      const message = statusMessages[data.status] || data.status;
      showToast.info(`KOT #${data.kot?.displayNumber} is ${message}`);
    }
    
    if (onKOTStatusUpdate) {
      onKOTStatusUpdate(data);
    }
  }, [onKOTStatusUpdate, showNotifications]);

  // Handle KOT item status updates
  const handleKOTItemUpdate = useCallback((data) => {
    console.log('🥘 KOT item status updated:', data);
    
    if (showNotifications) {
      showToast.info(`Items updated for KOT #${data.kot?.displayNumber}`);
    }
    
    if (onKOTItemUpdate) {
      onKOTItemUpdate(data);
    }
  }, [onKOTItemUpdate, showNotifications]);

  // Handle table status updates
  const handleTableStatusUpdate = useCallback((data) => {
    console.log('🪑 Table status updated:', data);
    
    if (showNotifications) {
      showToast.info(`Table ${data.tableNumber} is now ${data.status}`);
    }
  }, [showNotifications]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the waiters room for order updates
    socket.emit('join-waiter-dashboard');
    
    // Set up event listeners
    socket.on('new-order', handleNewOrder);
    socket.on('new-restaurant-order', handleNewOrder);
    socket.on('order-status-updated', handleOrderStatusUpdate);
    socket.on('new-kot', handleNewKOT);
    socket.on('new-kot-created', handleNewKOT);
    socket.on('kot-status-updated', handleKOTStatusUpdate);
    socket.on('kot-item-status-updated', handleKOTItemUpdate);
    socket.on('table-status-updated', handleTableStatusUpdate);

    // Cleanup listeners on unmount
    return () => {
      socket.off('new-order', handleNewOrder);
      socket.off('new-restaurant-order', handleNewOrder);
      socket.off('order-status-updated', handleOrderStatusUpdate);
      socket.off('new-kot', handleNewKOT);
      socket.off('new-kot-created', handleNewKOT);
      socket.off('kot-status-updated', handleKOTStatusUpdate);
      socket.off('kot-item-status-updated', handleKOTItemUpdate);
      socket.off('table-status-updated', handleTableStatusUpdate);
    };
  }, [
    socket,
    isConnected,
    handleNewOrder,
    handleOrderStatusUpdate,
    handleNewKOT,
    handleKOTStatusUpdate,
    handleKOTItemUpdate,
    handleTableStatusUpdate
  ]);

  return {
    isConnected,
    socket
  };
};

/**
 * Hook specifically for kitchen staff to receive live KOT updates
 */
export const useKitchenSocket = (options = {}) => {
  const { socket, isConnected } = useSocket();
  const {
    onNewOrder,
    onNewKOT,
    onKOTStatusUpdate,
    onKOTItemUpdate,
    showNotifications = true
  } = options;

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Join the kitchen updates room
    socket.emit('join-kitchen-updates');
    
    console.log('🍳 Kitchen socket connected - listening for KOT updates');

    return () => {
      console.log('🍳 Kitchen socket disconnected');
    };
  }, [socket, isConnected]);

  // Use the main order socket hook with kitchen-specific settings
  return useOrderSocket({
    onNewOrder,
    onNewKOT,
    onKOTStatusUpdate,
    onKOTItemUpdate,
    showNotifications
  });
};

export default useOrderSocket;