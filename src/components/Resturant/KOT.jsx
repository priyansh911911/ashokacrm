import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Pagination from '../common/Pagination';

const KOT = () => {
  const { axios } = useAppContext();
  const [activeTab, setActiveTab] = useState('kots');
  const [kots, setKots] = useState([]);
  const [orders, setOrders] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [tables, setTables] = useState([]);
  const [kotForm, setKotForm] = useState({
    orderId: '',
    tableNo: '',
    items: [],
    priority: 'normal',
    estimatedTime: '',
    assignedChef: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredKots, setFilteredKots] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [lastKotCount, setLastKotCount] = useState(0);
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [orderCount, setOrderCount] = useState(0);
  const [staffNotification, setStaffNotification] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [userRestaurantRole, setUserRestaurantRole] = useState(null);

  useEffect(() => {
    fetchUserRole();
    fetchMenuItems();
    fetchKOTs();
    fetchOrders();
    fetchChefs();
    fetchTables();
    
    // Show test notification
    setTimeout(() => {
      setNewOrderNotification({
        tableNo: '5',
        itemCount: 3,
        orderId: 'TEST123',
        items: [{name: 'Burger'}, {name: 'Fries'}, {name: 'Coke'}]
      });
    }, 3000);
    
    // Show staff notification
    setTimeout(() => {
      setStaffNotification({
        title: 'Staff Alert',
        message: 'New task assigned to kitchen staff',
        type: 'info'
      });
    }, 5000);
    
    // Check for new orders every 2 seconds
    const interval = setInterval(() => {
      checkForNewOrders();
      checkForNewKOTs();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Re-fetch KOTs when menu items are loaded
  useEffect(() => {
    if (menuItems.length > 0) {
      fetchKOTs();
    }
  }, [menuItems]);

  const fetchKOTs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/kot/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Enhance KOTs with item names
      const enhancedKots = response.data.map(kot => ({
        ...kot,
        items: kot.items?.map(item => {
          
          // Handle different item data structures
          if (typeof item === 'string') {
            return { name: item, quantity: 1 };
          }
          
          if (typeof item === 'object') {
            // Try to find menu item by ID
            let itemName = item.name || item.itemName;
            
            if (item.itemId && menuItems.length > 0) {
              const menuItem = menuItems.find(mi => mi._id === item.itemId || mi.id === item.itemId);
              if (menuItem) {
                itemName = menuItem.name || menuItem.itemName;
              }
            }
            
            // If still no name, try to match by other properties
            if (!itemName && menuItems.length > 0) {
              const menuItem = menuItems.find(mi => 
                mi.name === item.name || 
                mi.itemName === item.itemName ||
                mi._id === item.id
              );
              if (menuItem) {
                itemName = menuItem.name || menuItem.itemName;
              }
            }
            
            return {
              ...item,
              name: itemName || 'Unknown Item'
            };
          }
          
          return item;
        }) || []
      }));
      

      // Filter out served KOTs
      const activeKots = enhancedKots.filter(kot => kot.status !== 'served');
      
      // Check for new KOTs
      if (kots.length > 0 && activeKots.length > kots.length) {
        const newKot = activeKots[activeKots.length - 1];
        setNewOrderNotification({
          tableNo: newKot.tableNo,
          itemCount: newKot.items?.length || 0,
          orderId: newKot.orderId,
          items: newKot.items || []
        });
        
        setTimeout(() => {
          setNewOrderNotification(null);
        }, 5000);
      }
      
      setKots(activeKots);
      setFilteredKots(activeKots);
    } catch (error) {
      console.error('Error fetching KOTs:', error);
    }
  };
  
  const fetchMenuItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/items/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const itemsData = Array.isArray(response.data) ? response.data : (response.data.items || []);
      setMenuItems(itemsData);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };
  
  const checkForNewOrders = () => {
    const newOrders = JSON.parse(localStorage.getItem('newOrders') || '[]');
    if (newOrders.length > 0) {
      const latestOrder = newOrders[newOrders.length - 1];
      setNewOrderNotification({
        tableNo: latestOrder.tableNo,
        itemCount: latestOrder.items?.length || 0,
        orderId: latestOrder.orderId,
        items: latestOrder.items || []
      });
      
      // Clear the notification from localStorage
      localStorage.removeItem('newOrders');
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setNewOrderNotification(null);
      }, 5000);
    }
  };
  
  const checkForNewKOTs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/kot/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const currentKotCount = response.data.length;
      if (lastKotCount > 0 && currentKotCount > lastKotCount) {
        const newKots = response.data.slice(lastKotCount);
        if (newKots.length > 0) {
          const latestKot = newKots[0];
          setNewOrderNotification({
            tableNo: latestKot.tableNo,
            itemCount: latestKot.items?.length || 0,
            orderId: latestKot.orderId,
            items: latestKot.items || []
          });
          
          setTimeout(() => {
            setNewOrderNotification(null);
          }, 5000);
        }
      }
      setLastKotCount(currentKotCount);
    } catch (error) {
      console.error('Error checking for new KOTs:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/restaurant-orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check for new orders
      if (orderCount > 0 && response.data.length > orderCount) {
        const newOrder = response.data[response.data.length - 1];
        setNewOrderNotification({
          tableNo: newOrder.tableNo,
          itemCount: newOrder.items?.length || 0,
          orderId: newOrder._id,
          items: newOrder.items || []
        });
        
        setTimeout(() => {
          setNewOrderNotification(null);
        }, 8000);
      }
      
      setOrderCount(response.data.length);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchChefs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/search/field?model=users&field=role&value=restaurant', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const chefData = Array.isArray(response.data) ? response.data : (response.data.users || response.data.data || []);
      setChefs(chefData.filter(user => user.restaurantRole === 'chef'));
    } catch (error) {
      console.error('Error fetching chefs:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/restaurant/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tableData = Array.isArray(response.data) ? response.data : (response.data.tables || response.data.data || []);
      setTables(tableData);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    }
  };

  const fetchUserRole = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRole(response.data.role);
      setUserRestaurantRole(response.data.restaurantRole);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const markServed = async (kotId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/kot/${kotId}/served`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Notify staff about served item
      setStaffNotification({
        title: 'Order Served',
        message: `KOT ${kotId} has been marked as served by chef`,
        type: 'success'
      });
      
      setTimeout(() => {
        setStaffNotification(null);
      }, 5000);
      
      fetchKOTs();
    } catch (error) {
      console.error('Error marking KOT as served:', error);
    }
  };

  const canMarkAsServed = () => {
    return userRole === 'restaurant' && (userRestaurantRole === 'chef' || userRestaurantRole === 'manager');
  };

  const createKOT = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/kot/create', kotForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Send notification to assigned chef
      if (kotForm.assignedChef) {
        try {
          await axios.post('/api/notifications/create', {
            title: 'New KOT Assigned',
            message: `New KOT for Table ${kotForm.tableNo} - ${kotForm.items?.length || 0} items (Priority: ${kotForm.priority})`,
            type: 'kitchen',
            priority: kotForm.priority,
            department: 'kitchen',
            userId: kotForm.assignedChef
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (notifError) {
          console.error('Notification failed:', notifError);
        }
      }
      
      alert('KOT created successfully!');
      setKotForm({
        orderId: '',
        tableNo: '',
        items: [],
        priority: 'normal',
        estimatedTime: '',
        assignedChef: ''
      });
      fetchKOTs();
    } catch (error) {
      console.error('Error creating KOT:', error);
      alert('Failed to create KOT');
    }
  };

  const updateKOTStatus = async (kotId, newStatus, orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Update KOT status
      await axios.patch(`/api/kot/${kotId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update corresponding order status
      const orderStatus = getOrderStatusFromKOT(newStatus);
      if (orderStatus && orderId) {
        await axios.patch(`/api/restaurant-orders/${orderId}/status`, {
          status: orderStatus
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Show notification
        alert(`Order status updated to ${orderStatus}`);
      }
      
      fetchKOTs();
      fetchOrders();
    } catch (error) {
      console.error('Error updating KOT status:', error);
      alert('Failed to update status');
    }
  };
  
  const getOrderStatusFromKOT = (kotStatus) => {
    switch (kotStatus) {
      case 'pending': return 'pending';
      case 'preparing': return 'preparing';
      case 'ready': return 'ready';
      case 'served': return 'served';
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const filtered = kots.filter(kot => 
        kot.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kot._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kot.tableNo?.toString().includes(searchQuery)
      );
      setFilteredKots(filtered);
    } else {
      setFilteredKots(kots);
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* New Order Notification */}
      {newOrderNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-bounce max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-bold flex items-center">
                🔔 New Order!
              </h4>
              <p className="text-sm mt-1">
                Table {newOrderNotification.tableNo} - {newOrderNotification.itemCount} items
              </p>
              <p className="text-xs opacity-90 mb-2">
                Order: {newOrderNotification.orderId?.slice(-6)}
              </p>
              <div className="text-xs opacity-90">
                <strong>Items:</strong>
                <div className="max-h-16 overflow-y-auto">
                  {newOrderNotification.items?.map((item, index) => (
                    <div key={index} className="truncate">
                      • {item.name || item.itemName || 'Unknown'} x{item.quantity} {item.note && `(${item.note})`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setNewOrderNotification(null)}
              className="ml-3 text-white hover:text-gray-200 text-lg flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Staff Notification */}
      {staffNotification && (
        <div className="fixed top-20 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg animate-pulse max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-bold flex items-center">
                👨‍🍳 {staffNotification.title}
              </h4>
              <p className="text-sm mt-1">
                {staffNotification.message}
              </p>
            </div>
            <button 
              onClick={() => setStaffNotification(null)}
              className="ml-3 text-white hover:text-gray-200 text-lg flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-text">Kitchen Order Tickets (KOT)</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-border">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('kots')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'kots'
                    ? 'bg-primary text-text border-b-2 border-primary'
                    : 'text-gray-500 hover:text-text hover:bg-accent'
                }`}
              >
                All KOTs
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'bg-primary text-text border-b-2 border-primary'
                    : 'text-gray-500 hover:text-text hover:bg-accent'
                }`}
              >
                Create KOT
              </button>
            </nav>
          </div>
          
          <div className="p-0">
            {activeTab === 'kots' && (
              <div className="p-6">
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by Order ID, KOT ID, or Table..."
                      className="flex-1 p-2 border border-border rounded bg-white text-text focus:border-primary focus:outline-none text-sm"
                      style={{ borderColor: 'hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                    />
                    <button
                      type="submit"
                      className="bg-primary text-text px-4 py-2 rounded hover:bg-hover transition-colors whitespace-nowrap text-sm"
                      style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
                    >
                      Search
                    </button>
                  </div>
                </form>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead style={{ backgroundColor: 'hsl(45, 71%, 69%)' }}>
                      <tr>
                        <th className="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>Order ID</th>
                        <th className="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>KOT #</th>
                        <th className="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>Table</th>
                        <th className="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>Items</th>
                        <th className="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>Priority</th>
                        <th className="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>Status</th>
                        <th className="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>Chef</th>
                        <th className="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKots.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((kot, index) => (
                        <tr key={kot._id} className={index % 2 === 0 ? 'bg-background' : 'bg-white'}>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm font-mono" style={{ color: 'hsl(45, 100%, 20%)' }}>
                            <div className="font-semibold">{kot.orderId?.slice(-6) || 'N/A'}</div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>{kot._id.slice(-6)}</td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>{kot.tableNo}</td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                            <div className="max-w-xs">
                              {kot.items && kot.items.length > 0 ? (
                                <div className="space-y-1">
                                  {kot.items.slice(0, 3).map((item, idx) => {
                                    const itemName = typeof item === 'string' ? item : (item.name || item.itemName || 'Unknown Item');
                                    const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;
                                    const note = typeof item === 'object' ? item.note : null;
                                    
                                    return (
                                      <div key={idx} className="truncate">
                                        • {itemName} x{quantity}
                                        {note && <span className="text-gray-500 text-xs"> ({note})</span>}
                                      </div>
                                    );
                                  })}
                                  {kot.items.length > 3 && (
                                    <div className="text-gray-500 text-xs">+{kot.items.length - 3} more items</div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">No items</span>
                              )}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(kot.priority)}`}>
                              {kot.priority}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(kot.status)}`}>
                              {kot.status}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 text-xs sm:text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>{kot.assignedChef?.name || 'Unassigned'}</td>
                          <td className="px-2 sm:px-4 py-3">
                            <div className="flex flex-col sm:flex-row gap-1">
                              {kot.status === 'pending' && (
                                <button
                                  onClick={() => updateKOTStatus(kot._id, 'preparing', kot.orderId)}
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 whitespace-nowrap"
                                >
                                  Start Preparing
                                </button>
                              )}
                              {kot.status === 'preparing' && (
                                <button
                                  onClick={() => updateKOTStatus(kot._id, 'ready', kot.orderId)}
                                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 whitespace-nowrap"
                                >
                                  Mark Ready
                                </button>
                              )}
                              {kot.status === 'ready' && (
                                canMarkAsServed() ? (
                                  <button
                                    onClick={() => markServed(kot._id)}
                                    className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 whitespace-nowrap"
                                  >
                                    Mark Served
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="bg-gray-300 text-gray-500 px-2 py-1 rounded text-xs cursor-not-allowed whitespace-nowrap"
                                    title="Only chefs can mark orders as served"
                                  >
                                    Mark Served
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filteredKots.length / itemsPerPage)}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredKots.length}
                />
                
                {filteredKots.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? 'No KOTs found matching your search.' : 'No KOTs found.'}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'create' && (
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <h2 className="text-xl font-bold mb-4" style={{ color: 'hsl(45, 100%, 20%)' }}>Create New KOT</h2>
                  <form onSubmit={createKOT} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-text">Select Order</label>
                <select
                  value={kotForm.orderId}
                  onChange={(e) => {
                    const selectedOrder = orders.find(o => o._id === e.target.value);
                    setKotForm({
                      ...kotForm,
                      orderId: e.target.value,
                      tableNo: selectedOrder?.tableNo || '',
                      items: selectedOrder?.items || []
                    });
                  }}
                  className="w-full p-3 border-2 border-border rounded-lg bg-white text-text focus:border-primary focus:outline-none transition-colors"
                  style={{ borderColor: 'hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  required
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order._id} value={order._id}>
                      Order {order._id.slice(-6)} - Table {order.tableNo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-text">Table Number</label>
                <select
                  value={kotForm.tableNo}
                  onChange={(e) => setKotForm({...kotForm, tableNo: e.target.value})}
                  className="w-full p-3 border-2 border-border rounded-lg bg-white text-text focus:border-primary focus:outline-none transition-colors"
                  style={{ borderColor: 'hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                  required
                >
                  <option value="">Select Table</option>
                  {Array.isArray(tables) && tables.map(table => (
                    <option key={table._id} value={table.tableNumber}>
                      Table {table.tableNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-text">Priority Level</label>
                <select
                  value={kotForm.priority}
                  onChange={(e) => setKotForm({...kotForm, priority: e.target.value})}
                  className="w-full p-3 border-2 border-border rounded-lg bg-white text-text focus:border-primary focus:outline-none transition-colors"
                  style={{ borderColor: 'hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                >
                  <option value="low">Low Priority</option>
                  <option value="normal">Normal Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-text">Estimated Time (minutes)</label>
                <input
                  type="number"
                  placeholder="Enter estimated time"
                  value={kotForm.estimatedTime}
                  onChange={(e) => setKotForm({...kotForm, estimatedTime: e.target.value})}
                  className="w-full p-3 border-2 border-border rounded-lg bg-white text-text focus:border-primary focus:outline-none transition-colors"
                  style={{ borderColor: 'hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-text">Assign Chef</label>
                <select
                  value={kotForm.assignedChef}
                  onChange={(e) => setKotForm({...kotForm, assignedChef: e.target.value})}
                  className="w-full p-3 border-2 border-border rounded-lg bg-white text-text focus:border-primary focus:outline-none transition-colors"
                  style={{ borderColor: 'hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                >
                  <option value="">Select Chef</option>
                  {chefs.map(chef => (
                    <option key={chef._id} value={chef._id}>
                      {chef.name || chef.username}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full p-3 rounded-lg font-semibold transition-colors shadow-md"
                style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
              >
                Create KOT
              </button>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default KOT;