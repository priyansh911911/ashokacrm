import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import CountdownTimer from "./CountdownTimer";

const ChefDashboard = () => {
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [itemStates, setItemStates] = useState({});

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/kot/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get menu items for price lookup
      const menuResponse = await axios.get('/api/items/all');
      const menuItems = Array.isArray(menuResponse.data) ? menuResponse.data : (menuResponse.data.items || []);
      
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
          
          const enhancedItems = kot.items?.map(item => {
            // Find menu item to get price and prep time
            const menuItem = menuItems.find(mi => 
              mi._id === item.itemId || 
              mi.name === item.itemName || 
              mi.name === item.name
            );
            
            const price = item.price || item.rate || menuItem?.Price || menuItem?.price || 0;
            const prepTime = menuItem?.timeToPrepare || 0;
            
            return {
              name: item.itemName || item.name || menuItem?.name || 'Unknown Item',
              quantity: item.quantity || 1,
              price: price,
              prepTime: prepTime
            };
          }) || [];
          
          const totalAmount = enhancedItems.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
          }, 0);
          
          return {
            _id: kot.orderId || kot._id,
            kotId: kot._id,
            tableNo: kot.tableNo,
            customerName: relatedOrder?.customerName || 'Guest',
            status: kot.status || 'pending',
            createdAt: kot.createdAt,
            amount: totalAmount,
            items: enhancedItems
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Chef Dashboard</h1>
        <p className="text-gray-600">Manage kitchen orders</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
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
              <div className="grid grid-cols-7 text-xs text-gray-500 font-medium border-b pb-1 mb-2">
                <span className="text-center">✓</span>
                <span className="col-span-3 truncate">Items</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Price</span>
                <span className="text-right">Timer</span>
              </div>
              <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-1">
                {order.items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-7 text-xs sm:text-sm gap-1">
                    <div className="flex justify-center">
                      <input 
                        type="checkbox" 
                        className="w-3 h-3" 
                        checked={itemStates[`${order._id}-${index}`]?.checked || itemStates[`${order._id}-${index}`]?.status === 'delivered'}
                        disabled={itemStates[`${order._id}-${index}`]?.status === 'delivered'}
                        onChange={(e) => {
                          const key = `${order._id}-${index}`;
                          setItemStates(prev => ({
                            ...prev,
                            [key]: { 
                              ...prev[key], 
                              checked: e.target.checked 
                            }
                          }));
                        }}
                      />
                    </div>
                    <span 
                      className={`col-span-3 truncate ${
                        itemStates[`${order._id}-${index}`]?.status === 'delivered' 
                          ? 'text-green-600 line-through' 
                          : itemStates[`${order._id}-${index}`]?.status === 'served' 
                          ? 'text-orange-600' 
                          : 'text-gray-700'
                      }`} 
                      title={item.name || 'Unknown'}
                    >
                      {item.name || 'Unknown'}
                    </span>
                    <span className="text-center text-gray-600">{item.quantity || 1}</span>
                    <span className="text-right text-gray-600">₹{item.price || 0}</span>
                    <div className="text-right">
                      {item.prepTime > 0 && (
                        <CountdownTimer 
                          orderTime={order.createdAt}
                          prepTime={item.prepTime}
                          status={order.status}
                        />
                      )}
                    </div>
                  </div>
                ))}
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
            <div className="flex flex-col gap-1">
              {order.items?.some((item, index) => itemStates[`${order._id}-${index}`]?.checked && itemStates[`${order._id}-${index}`]?.status !== 'served' && itemStates[`${order._id}-${index}`]?.status !== 'delivered') && (
                <button
                  onClick={async () => {
                    const token = localStorage.getItem('token');
                    const itemStatuses = [];
                    
                    order.items?.forEach((item, index) => {
                      const key = `${order._id}-${index}`;
                      if (itemStates[key]?.checked) {
                        itemStatuses.push({itemIndex: index, status: 'served'});
                        setItemStates(prev => ({
                          ...prev,
                          [key]: { 
                            ...prev[key], 
                            status: 'served',
                            checked: false
                          }
                        }));
                      }
                    });
                    
                    if (itemStatuses.length > 0) {
                      try {
                        await axios.patch(`/api/kot/${order.kotId}/item-statuses`, 
                          {itemStatuses}, 
                          {headers: {Authorization: `Bearer ${token}`}}
                        );
                      } catch (error) {
                        console.error('Error updating item statuses:', error);
                      }
                    }
                  }}
                  className="w-full bg-orange-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-orange-600"
                >
                  Mark Item to be Served
                </button>
              )}
              <button
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  const itemStatuses = order.items?.map((item, index) => ({
                    itemIndex: index, 
                    status: 'delivered'
                  })) || [];
                  
                  order.items?.forEach((item, index) => {
                    const key = `${order._id}-${index}`;
                    setItemStates(prev => ({
                      ...prev,
                      [key]: { 
                        ...prev[key], 
                        status: 'delivered',
                        checked: true
                      }
                    }));
                  });
                  
                  try {
                    await axios.patch(`/api/kot/${order.kotId}/item-statuses`, 
                      {itemStatuses}, 
                      {headers: {Authorization: `Bearer ${token}`}}
                    );
                  } catch (error) {
                    console.error('Error updating item statuses:', error);
                  }
                }}
                className="w-full bg-blue-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-600"
              >
                Mark Order Delivered
              </button>
              <button
                onClick={() => updateOrderStatus(order._id, 'completed')}
                className="w-full bg-green-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-green-600"
              >
                Mark Order Complete
              </button>
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