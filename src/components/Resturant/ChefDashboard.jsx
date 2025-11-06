import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";

const ChefDashboard = () => {
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/kot/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get all orders to check payment status
      const ordersResponse = await axios.get('/api/restaurant-orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allOrders = ordersResponse.data;
      
      // Transform KOT data to match order format
      const kotOrders = response.data
        .filter(kot => kot.status !== 'served')
        .map(kot => {
          const relatedOrder = allOrders.find(order => order._id === kot.orderId);
          const totalAmount = kot.items?.reduce((sum, item) => {
            const price = item.rate || item.price || 0;
            const quantity = item.quantity || 1;
            return sum + (price * quantity);
          }, 0) || 0;
          
          return {
            _id: kot.orderId || kot._id,
            tableNo: kot.tableNo,
            customerName: relatedOrder?.customerName || 'Guest',
            status: kot.status || 'pending',
            createdAt: kot.createdAt,
            amount: totalAmount,
            items: kot.items?.map(item => ({
              name: item.itemName || item.name || 'Unknown Item',
              quantity: item.quantity || 1,
              price: item.rate || item.price || 0
            })) || []
          };
        });
      
      setOrders(kotOrders);
    } catch (error) {
      console.error('Error fetching KOT data:', error);
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the KOT for this order
      const kotResponse = await axios.get('/api/kot/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const kot = kotResponse.data.find(k => k.orderId === orderId);
      
      if (kot) {
        // Update KOT status
        await axios.patch(`/api/kot/${kot._id}/status`, {
          status: newStatus
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update corresponding order status
        await axios.patch(`/api/restaurant-orders/${orderId}/status`, {
          status: newStatus
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-red-100 text-red-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending': return 0;
      case 'preparing': return 50;
      case 'ready': return 100;
      default: return 10; // Default for new orders
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chef Dashboard</h1>
        <p className="text-gray-600">Manage kitchen orders</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 min-h-[320px] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
              <div className="flex-1">
                <div className="text-xs sm:text-sm text-gray-500 truncate">
                  Order# {order._id.slice(-4)} / {order.orderType || 'Dine In'}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>

            {/* Table Info */}
            <div className="flex items-center mb-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold mr-2">
                {order.tableNo || 'T'}
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Table Number</div>
                <div className="text-sm font-medium truncate">Table {order.tableNo || 'N/A'}</div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-end mb-3">
              <div className="text-xs sm:text-sm text-orange-500 font-medium">
                {order.items?.length || 0} Items →
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 mb-3">
              <div className="grid grid-cols-3 text-xs text-gray-500 font-medium border-b pb-1 mb-2">
                <span className="truncate">Items</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
              </div>
              <div className="max-h-24 sm:max-h-32 overflow-y-auto space-y-1">
                {order.items?.map((item, index) => {
                  const itemPrice = item.rate || item.price || item.Price || 0;
                  return (
                    <div key={index} className="grid grid-cols-3 text-xs sm:text-sm gap-1">
                      <span className="text-gray-700 truncate" title={item.name || item.itemName || 'Unknown'}>
                        {item.name || item.itemName || 'Unknown'}
                      </span>
                      <span className="text-center text-gray-600">{item.quantity || 1}</span>
                      <span className="text-right text-gray-600">₹{itemPrice}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-2 mb-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-800 text-sm">Total</span>
                <span className="font-bold text-base sm:text-lg">₹{order.amount || 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {(!order.status || order.status === 'pending') && (
                <button
                  onClick={() => updateOrderStatus(order._id, 'preparing')}
                  className="flex-1 bg-blue-500 text-white py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  Start Preparing
                </button>
              )}
              {order.status === 'preparing' && (
                <button
                  onClick={() => updateOrderStatus(order._id, 'ready')}
                  className="flex-1 bg-green-500 text-white py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  Mark Ready
                </button>
              )}
              {order.status === 'ready' && (
                <div className="flex-1 bg-blue-100 text-blue-800 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium text-center">
                  Ready for Pickup
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">🍳</div>
          <div className="text-gray-500">No active orders in kitchen</div>
        </div>
      )}
    </div>
  );
};

export default ChefDashboard;