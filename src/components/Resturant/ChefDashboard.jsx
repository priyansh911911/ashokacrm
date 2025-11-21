import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import CountdownTimer from "./CountdownTimer";
import { useKitchenSocket } from "../../hooks/useOrderSocket";
import { Wifi, WifiOff } from 'lucide-react';

const ChefDashboard = () => {
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [allHistoryOrders, setAllHistoryOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);
  const [itemStates, setItemStates] = useState({});
  const [activeTab, setActiveTab] = useState('active');
  const [selectedDate, setSelectedDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  
  // Real-time KOT updates for kitchen staff
  const { isConnected } = useKitchenSocket({
    onNewKOT: (data) => {
      console.log('🍳 Chef received new KOT:', data);
      fetchOrders(); // Refresh orders when new KOT arrives
    },
    onNewOrder: (data) => {
      console.log('🍳 CHEF: New restaurant order received, refreshing...');
      setTimeout(() => fetchOrders(), 1000); // Delay to ensure DB is updated
    },
    onKOTStatusUpdate: (data) => {
      console.log('🍳 Chef received KOT status update:', data);
      fetchOrders(); // Refresh orders when KOT status changes
    },
    onKOTItemUpdate: (data) => {
      console.log('🍳 Chef received KOT item update:', data);
      fetchOrders(); // Refresh orders when item status changes
    },
    showNotifications: true
  });

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/kot/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('KOT API response:', response.data);
      console.log('Total KOTs found:', response.data?.length || 0);
      
      // Get menu items for price lookup
      const menuResponse = await axios.get('/api/items/all');
      const menuItems = Array.isArray(menuResponse.data) ? menuResponse.data : (menuResponse.data.items || []);
      
      // Get all orders to check payment status
      const ordersResponse = await axios.get('/api/restaurant-orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allOrders = ordersResponse.data;
      
      console.log('Restaurant orders:', allOrders?.length || 0);
      
      // Initialize item states from backend
      const newItemStates = {};
      
      // Group KOTs by orderId and merge items
      const kotsByOrder = {};
      response.data
        .forEach(kot => {
          if (!kotsByOrder[kot.orderId]) {
            kotsByOrder[kot.orderId] = {
              ...kot,
              allItems: [...(kot.items || [])],
              allItemStatuses: [...(kot.itemStatuses || [])],
              kotCount: 1
            };
          } else {
            // Merge items from multiple KOTs for same order
            const existingItemCount = kotsByOrder[kot.orderId].allItems.length;
            kotsByOrder[kot.orderId].allItems.push(...(kot.items || []));
            kotsByOrder[kot.orderId].kotCount += 1;
            
            // Adjust item statuses indices for merged items
            const adjustedStatuses = (kot.itemStatuses || []).map(status => ({
              ...status,
              itemIndex: status.itemIndex + existingItemCount
            }));
            kotsByOrder[kot.orderId].allItemStatuses.push(...adjustedStatuses);
          }
        });
      
      // Transform merged KOT data to match order format
      const kotOrders = Object.values(kotsByOrder).map(kot => {
          const relatedOrder = allOrders.find(order => order._id === kot.orderId);
          
          const enhancedItems = kot.allItems?.map((item, index) => {
            // Find menu item to get price and prep time
            const menuItem = menuItems.find(mi => 
              mi._id === item.itemId || 
              mi.name === item.itemName || 
              mi.name === item.name
            );
            
            const price = item.price || item.rate || menuItem?.Price || menuItem?.price || 0;
            const prepTime = menuItem?.timeToPrepare || 0;
            
            // Initialize item state from backend
            const orderId = kot.orderId || kot._id;
            const key = `${orderId}-${index}`;
            const itemStatus = kot.allItemStatuses?.find(is => is.itemIndex === index)?.status || 'pending';
            
            newItemStates[key] = {
              status: itemStatus,
              checked: false
            };
            
            return {
              name: item.itemName || item.name || menuItem?.name || 'Unknown Item',
              quantity: item.quantity || 1,
              price: price,
              prepTime: prepTime,
              status: itemStatus,

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
            items: enhancedItems,
            kotCount: kot.kotCount
          };
        });
      
      // Separate active and history orders
      const activeOrders = kotOrders.filter(order => 
        order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
      );
      const allHistory = kotOrders.filter(order => 
        order.status === 'served' || order.status === 'completed' || order.status === 'cancelled'
      );
      
      console.log('All KOT orders:', kotOrders.length);
      console.log('Active orders:', activeOrders.length);
      console.log('All history orders:', allHistory.length);
      
      setOrders(activeOrders);
      setAllHistoryOrders(allHistory);
      setItemStates(newItemStates);
    } catch (error) {
      console.error('Error fetching KOT data:', error);
      setOrders([]);
      setHistoryOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  
  // Client-side date filtering for history orders
  useEffect(() => {
    if (selectedDate && selectedDate.trim() !== '') {
      const filterDateObj = new Date(selectedDate);
      const filtered = allHistoryOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === filterDateObj.toDateString();
      });
      setHistoryOrders(filtered);
    } else {
      setHistoryOrders(allHistoryOrders);
    }
  }, [selectedDate, allHistoryOrders]);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Chef Dashboard</h1>
            <p className="text-gray-600">Manage kitchen orders</p>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? 'Live Updates Active' : 'Offline Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'active'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Active Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              History ({historyOrders.length})
            </button>
          </div>
          
          {/* Date Filter for History */}
          {activeTab === 'history' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Filter by Date:</label>
                <div className="relative">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => setSelectedDate('')}
                  className="px-3 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                >
                  Show All
                </button>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    showCalendar 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  📅 {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                </button>
              </div>
              
              {/* Inline Calendar */}
              {showCalendar && (
                <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
                  {(() => {
                    const currentDate = selectedDate ? new Date(selectedDate) : new Date();
                    const currentMonth = currentDate.getMonth();
                    const currentYear = currentDate.getFullYear();
                    const today = new Date();
                    
                    const firstDay = new Date(currentYear, currentMonth, 1);
                    const lastDay = new Date(currentYear, currentMonth + 1, 0);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay());
                    
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
                    
                    const days = [];
                    const current = new Date(startDate);
                    
                    for (let i = 0; i < 42; i++) {
                      days.push(new Date(current));
                      current.setDate(current.getDate() + 1);
                    }
                    
                    return (
                      <div className="w-80">
                        {/* Month Navigation */}
                        <div className="flex justify-between items-center mb-4">
                          <button
                            onClick={() => {
                              const newDate = new Date(currentYear, currentMonth - 1, 1);
                              setSelectedDate(newDate.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            ‹
                          </button>
                          <span className="font-semibold text-lg">
                            {monthNames[currentMonth]} {currentYear}
                          </span>
                          <button
                            onClick={() => {
                              const newDate = new Date(currentYear, currentMonth + 1, 1);
                              setSelectedDate(newDate.toISOString().split('T')[0]);
                            }}
                            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            ›
                          </button>
                        </div>
                        
                        {/* Days of Week */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                              {day}
                            </div>
                          ))}
                        </div>
                        
                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1">
                          {days.map((day, index) => {
                            const isCurrentMonth = day.getMonth() === currentMonth;
                            const isToday = day.toDateString() === today.toDateString();
                            const isSelected = selectedDate && day.toDateString() === currentDate.toDateString();
                            
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  setSelectedDate(day.toISOString().split('T')[0]);
                                }}
                                className={`
                                  w-10 h-10 text-sm rounded transition-colors
                                  ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                                  ${isToday ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                                  ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
                                `}
                              >
                                {day.getDate()}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedDate(new Date().toISOString().split('T')[0]);
                            }}
                            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                          >
                            Today
                          </button>
                          <button
                            onClick={() => {
                              setSelectedDate('');
                              setShowCalendar(false);
                            }}
                            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                          >
                            Show All
                          </button>
                          <button
                            onClick={() => setShowCalendar(false)}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
        

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(activeTab === 'active' ? orders : historyOrders).map((order) => (
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
                <div className="text-xs text-gray-500">Table/Room</div>
                <div className="text-sm font-medium truncate">{order.tableNo || 'N/A'}</div>
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
              <div className="grid grid-cols-6 text-xs text-gray-500 font-medium border-b pb-2 mb-2 gap-2">
                <span className="text-center">✓</span>
                <span className="col-span-3">Items</span>
                <span className="text-right">Price</span>
                <span className="text-right">Timer</span>
              </div>
              <div className="max-h-32 sm:max-h-40 overflow-y-auto space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-6 text-xs sm:text-sm gap-2 py-1 border-b border-gray-100 last:border-b-0">
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
                      className={`col-span-3 break-words text-xs leading-tight ${
                        itemStates[`${order._id}-${index}`]?.status === 'delivered' 
                          ? 'text-green-600 line-through' 
                          : itemStates[`${order._id}-${index}`]?.status === 'served' 
                          ? 'text-orange-600' 
                          : 'text-gray-700'
                      }`} 
                      title={`${item.name || 'Unknown'} x ${item.quantity || 1}`}
                    >
                      {item.name || 'Unknown'} x {item.quantity || 1}
                    </span>
                    <span className="text-right text-gray-600">₹{item.price || 0}</span>
                    <div className="text-right">
                      {item.prepTime > 0 && (
                        itemStates[`${order._id}-${index}`]?.status === 'delivered' ? (
                          <div className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-green-100 text-green-600">
                            <span className="text-xs">00:00</span>
                          </div>
                        ) : (
                          <CountdownTimer 
                            orderTime={order.createdAt}
                            prepTime={item.prepTime}
                            status={order.status}
                          />
                        )
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

            {/* Action Buttons - Only show for non-completed and non-cancelled orders */}
            {order.status !== 'completed' && order.status !== 'cancelled' && (
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
                          console.log('Updating item statuses:', {kotId: order.kotId, itemStatuses});
                          const response = await axios.patch(`/api/kot/${order.kotId}/item-statuses`, 
                            {itemStatuses}, 
                            {headers: {Authorization: `Bearer ${token}`}}
                          );
                          console.log('Item statuses updated successfully:', response.data);
                          fetchOrders();
                        } catch (error) {
                          console.error('Error updating item statuses:', error.response?.data || error.message);
                        }
                      }
                    }}
                    className="w-full bg-orange-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-orange-600"
                  >
                    Mark Item to be Served
                  </button>
                )}
                {order.items?.some((item, index) => itemStates[`${order._id}-${index}`]?.status === 'served') && (
                  <button
                    onClick={async () => {
                      const token = localStorage.getItem('token');
                      const itemStatuses = [];
                      
                      const hasCheckedItems = order.items?.some((item, index) => itemStates[`${order._id}-${index}`]?.checked);
                      
                      order.items?.forEach((item, index) => {
                        const key = `${order._id}-${index}`;
                        if (hasCheckedItems) {
                          // Only update checked items
                          if (itemStates[key]?.checked && itemStates[key]?.status === 'served') {
                            itemStatuses.push({itemIndex: index, status: 'delivered'});
                            setItemStates(prev => ({
                              ...prev,
                              [key]: { 
                                ...prev[key], 
                                status: 'delivered',
                                checked: false
                              }
                            }));
                          }
                        } else {
                          // Update all served items
                          if (itemStates[key]?.status === 'served') {
                            itemStatuses.push({itemIndex: index, status: 'delivered'});
                            setItemStates(prev => ({
                              ...prev,
                              [key]: { 
                                ...prev[key], 
                                status: 'delivered',
                                checked: false
                              }
                            }));
                          }
                        }
                      });
                      
                      if (itemStatuses.length > 0) {
                        try {
                          console.log('Marking served items delivered:', {kotId: order.kotId, itemStatuses});
                          const response = await axios.patch(`/api/kot/${order.kotId}/item-statuses`, 
                            {itemStatuses}, 
                            {headers: {Authorization: `Bearer ${token}`}}
                          );
                          console.log('Served items marked delivered:', response.data);
                          fetchOrders();
                        } catch (error) {
                          console.error('Error marking served items delivered:', error.response?.data || error.message);
                        }
                      }
                    }}
                    className="w-full bg-green-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-green-600"
                  >
                    Mark Served Items Delivered
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
                          checked: false
                        }
                      }));
                    });
                    
                    try {
                      console.log('Marking all items delivered:', {kotId: order.kotId, itemStatuses});
                      const response = await axios.patch(`/api/kot/${order.kotId}/item-statuses`, 
                        {itemStatuses}, 
                        {headers: {Authorization: `Bearer ${token}`}}
                      );
                      console.log('All items marked delivered:', response.data);
                      fetchOrders();
                    } catch (error) {
                      console.error('Error marking items delivered:', error.response?.data || error.message);
                    }
                  }}
                  className="w-full bg-blue-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-blue-600"
                >
                  Mark All Items Delivered
                </button>
                <button
                  onClick={() => updateOrderStatus(order._id, 'completed')}
                  className="w-full bg-green-500 text-white py-1 px-2 rounded text-xs font-medium hover:bg-green-600"
                >
                  Mark Order Complete
                </button>
              </div>
            )}
            
            {/* Completed Status Display */}
            {order.status === 'completed' && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-2 text-center">
                <span className="text-green-700 font-medium text-sm">✓ Order Completed</span>
              </div>
            )}
            
            {/* Cancelled Status Display */}
            {order.status === 'cancelled' && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-2 text-center">
                <span className="text-red-700 font-medium text-sm">✗ Order Cancelled</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {(activeTab === 'active' ? orders : historyOrders).length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">{activeTab === 'active' ? '🍳' : '📋'}</div>
          <div className="text-gray-500">
            {activeTab === 'active' ? 'No active orders in kitchen' : 'No order history available'}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChefDashboard;
