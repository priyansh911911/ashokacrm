import React, { useState, useEffect } from 'react';
import { ChefHat, Users, DollarSign, Clock, TrendingUp, ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
    totalCustomers: 0,
    totalTables: 0,
    availableTables: 0,
    menuItems: 0,
    kotCount: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [kotOrders, setKotOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showTableModal, setShowTableModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all restaurant data in parallel
      const [ordersRes, tablesRes, menuRes, kotRes] = await Promise.all([
        fetch('https://ashoka-backend.vercel.app/api/restaurant-orders/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://ashoka-backend.vercel.app/api/restaurant/tables', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://ashoka-backend.vercel.app/api/menu', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://ashoka-backend.vercel.app/api/restaurant-orders/kot', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      // Process Orders
      let orders = [];
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        console.log('Orders API Response:', ordersData);
        orders = Array.isArray(ordersData) ? ordersData : ordersData.orders || ordersData.data || [];
      } else {
        console.log('Orders API failed:', ordersRes.status);
      }
      

      
      // Process Tables
      let tablesData = [];
      if (tablesRes.ok) {
        const tableResponse = await tablesRes.json();
        console.log('Tables API Response:', tableResponse);
        tablesData = Array.isArray(tableResponse) ? tableResponse : tableResponse.tables || tableResponse.data || [];
      } else {
        console.log('Tables API failed:', tablesRes.status);
      }
      
      console.log('Tables Data:', tablesData);
      setTables(tablesData);
      
      // Process Menu
      let menuData = [];
      if (menuRes.ok) {
        const menuResponse = await menuRes.json();
        menuData = Array.isArray(menuResponse) ? menuResponse : menuResponse.menu || [];
      }
      
      // Process KOT from existing orders
      let kotData = [];
      if (kotRes.ok) {
        const kotResponse = await kotRes.json();
        console.log('KOT API Response:', kotResponse);
        kotData = Array.isArray(kotResponse) ? kotResponse : kotResponse.kot || kotResponse.data || [];
      } else {
        console.log('KOT API failed, using orders data for KOT');
        // Generate KOT from existing orders
        kotData = orders.filter(order => 
          order.status === 'pending' || order.status === 'preparing'
        ).map(order => ({
          _id: order._id,
          kotNumber: `KOT${order._id?.slice(-4) || '001'}`,
          tableNumber: order.tableNo || order.tableNumber || 'Table N/A',
          items: order.items || [],
          status: order.status || 'pending'
        }));
      }
      setKotOrders(kotData.slice(0, 5));
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayOrders = orders.filter(order => 
        new Date(order.createdAt).toDateString() === today
      );
      
      const activeOrders = orders.filter(order => 
        order.status === 'pending' || order.status === 'preparing'
      );
      
      const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const availableTables = tablesData.filter(table => table.status === 'available').length;
      
      setStats({
        todayOrders: todayOrders.length,
        totalRevenue,
        activeOrders: activeOrders.length,
        totalCustomers: new Set(orders.map(o => o.customerId)).size,
        totalTables: tablesData.length,
        availableTables,
        menuItems: menuData.length,
        kotCount: kotData.length
      });
      
      const recentOrdersData = orders.slice(0, 5).map(order => {
        console.log('Processing order:', order);
        
        // Handle table number from different possible fields
        const tableNumber = order.tableNo || order.tableNumber || order.table || 
                           (order.tableId ? `Table ${order.tableId}` : null);
        
        // Handle items from different possible structures
        let itemsText = 'No items';
        if (order.items && Array.isArray(order.items)) {
          if (order.items.length > 0) {
            // Try different item name fields
            itemsText = order.items.map(item => {
              if (typeof item === 'string') return item;
              return item.name || item.itemName || item.itemId?.name || 'Item';
            }).join(', ');
          }
        }
        
        // Handle amount from different possible fields
        const amount = order.amount || order.totalAmount || order.total || 0;
        
        return {
          id: order._id,
          table: tableNumber || 'Table N/A',
          items: itemsText,
          amount: amount,
          status: order.status || 'pending'
        };
      });
      
      console.log('Recent Orders Data:', recentOrdersData);
      setRecentOrders(recentOrdersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, trend, trendUp }) => (
    <div className="bg-white rounded-lg shadow-lg border border-[#c2ab65]/20 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-4 cursor-pointer">
        <div className="flex justify-between items-center mb-2">
          <div className={`p-2 rounded-lg ${color} text-white`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className={`text-xs font-medium ${trendUp ? "text-green-600" : "text-red-600"}`}>
            {trend}
          </span>
        </div>
        <h3 className="text-sm text-text/70">{title}</h3>
        <p className="text-2xl font-bold text-[#1f2937]">{value}</p>
      </div>
      <div className={`h-1 ${color}`}></div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'served': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-gradient-to-br from-[#fefcf7] to-[#fcf9f0]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 mt-4 sm:mt-6 gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1f2937]">
          RESTAURANT DASHBOARD
        </h1>
      </div>

      {/* Status Summary */}
      <div className="bg-gradient-to-br from-white to-[#fefcf7] rounded-lg shadow-lg border border-[#c2ab65]/20 p-4 mb-6">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-start sm:items-center">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm">{stats.todayOrders} Orders Today</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-[#c2ab65] mr-2" />
              <span className="text-sm">{stats.activeOrders} Active Orders</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-[#c2ab65] mr-2" />
              <span className="text-sm">{stats.availableTables}/{stats.totalTables} Tables Available</span>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-[#c2ab65] mr-2" />
              <span className="text-sm">₹{stats.totalRevenue.toLocaleString()} Revenue</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          Array.from({length: 4}).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              icon={ShoppingCart}
              title="Today's Orders"
              value={stats.todayOrders}
              color="bg-gradient-to-r from-[#c2ab65] to-[#d4c078]"
              trend="+12%"
              trendUp={true}
            />
            <StatCard
              icon={DollarSign}
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              color="bg-gradient-to-r from-[#b8a055] to-[#c2ab65]"
              trend="+8%"
              trendUp={true}
            />
            <StatCard
              icon={Clock}
              title="Active Orders"
              value={stats.activeOrders}
              color="bg-gradient-to-r from-[#a89548] to-[#b8a055]"
              trend="-2%"
              trendUp={false}
            />
            <StatCard
              icon={Users}
              title="Available Tables"
              value={`${stats.availableTables}/${stats.totalTables}`}
              color="bg-gradient-to-r from-[#9e8a3b] to-[#a89548]"
              trend="+15%"
              trendUp={true}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gradient-to-br from-white to-[#fefcf7] rounded-lg shadow-lg border border-[#c2ab65]/20 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1f2937] mb-4 border-b border-[#c2ab65]/20 pb-2">
            Recent Orders
          </h2>
          <div className="space-y-4">
            {loading ? (
              Array.from({length: 3}).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-[#fefcf7] to-[#fcf9f0] rounded-lg border border-[#c2ab65]/30 hover:shadow-lg hover:border-[#c2ab65]/50 transition-all">
                  <div>
                    <p className="font-semibold text-[#1f2937]">{order.table}</p>
                    <p className="text-sm text-gray-600">{order.items}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#1f2937]">₹{order.amount}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders found</p>
            )}
          </div>
        </div>

        {/* Tables Overview */}
        <div className="bg-gradient-to-br from-white to-[#fefcf7] rounded-lg shadow-lg border border-[#c2ab65]/20 p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#1f2937] mb-4 border-b border-[#c2ab65]/20 pb-2">
            Tables Status
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {loading ? (
              Array.from({length: 4}).map((_, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : tables.length > 0 ? (
              tables.slice(0, 8).map((table) => (
                <div 
                  key={table._id} 
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                    table.status === 'available' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 hover:border-green-400' : 
                    table.status === 'occupied' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 hover:border-red-400' : 
                    table.status === 'reserved' ? 'bg-gradient-to-br from-[#fefcf7] to-[#fcf9f0] border-[#c2ab65]/40 hover:border-[#c2ab65]/60' :
                    'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setSelectedTable(table);
                    setShowTableModal(true);
                  }}
                >
                  <p className="font-semibold text-sm">{table.tableNumber || table.name}</p>
                  <p className={`text-xs ${
                    table.status === 'available' ? 'text-green-600' : 
                    table.status === 'occupied' ? 'text-red-600' : 
                    table.status === 'reserved' ? 'text-[#c2ab65]' :
                    'text-gray-600'
                  }`}>
                    {table.status}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-4 text-center py-4">No tables found</p>
            )}
          </div>
        </div>
      </div>

      {/* KOT Orders */}
      <div className="bg-gradient-to-br from-white to-[#fefcf7] rounded-lg shadow-lg border border-[#c2ab65]/20 p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#1f2937] mb-4 border-b border-[#c2ab65]/20 pb-2">
          Kitchen Orders (KOT)
        </h2>
        <div className="space-y-3">
          {loading ? (
            Array.from({length: 3}).map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))
          ) : kotOrders.length > 0 ? (
            kotOrders.map((kot) => (
              <div key={kot._id} className="flex items-center justify-between p-3 bg-gradient-to-r from-[#fefcf7] to-[#fcf9f0] rounded-lg border border-[#c2ab65]/30 hover:shadow-md transition-all">
                <div>
                  <p className="font-semibold text-[#1f2937]">KOT #{kot.kotNumber || kot._id.slice(-4)}</p>
                  <p className="text-sm text-gray-600">{kot.tableNumber || 'Table N/A'} - {kot.items?.length || 0} items</p>
                  <p className="text-xs text-gray-500">{kot.items?.map(item => item.name || item.itemName).join(', ') || 'No items'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  kot.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  kot.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {kot.status || 'pending'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No KOT orders found</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white to-[#fefcf7] rounded-lg shadow-lg border border-[#c2ab65]/20 p-4 sm:p-6 mb-6">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#1f2937] mb-4 border-b border-[#c2ab65]/20 pb-2">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/resturant/order-table')}
            className="bg-gradient-to-br from-[#fefcf7] to-[#fcf9f0] rounded-lg p-4 hover:shadow-lg hover:from-[#fcf9f0] hover:to-[#faf6e8] transition-all cursor-pointer border border-[#c2ab65]/30 hover:border-[#c2ab65]/50"
          >
            <ShoppingCart className="w-8 h-8 text-[#c2ab65] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">New Order</p>
          </button>
          <button 
            onClick={() => navigate('/menu')}
            className="bg-gradient-to-br from-[#fefcf7] to-[#fcf9f0] rounded-lg p-4 hover:shadow-lg hover:from-[#fcf9f0] hover:to-[#faf6e8] transition-all cursor-pointer border border-[#c2ab65]/30 hover:border-[#c2ab65]/50"
          >
            <ChefHat className="w-8 h-8 text-[#c2ab65] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">Menu</p>
          </button>
          <button 
            onClick={() => navigate('/table')}
            className="bg-gradient-to-br from-[#fefcf7] to-[#fcf9f0] rounded-lg p-4 hover:shadow-lg hover:from-[#fcf9f0] hover:to-[#faf6e8] transition-all cursor-pointer border border-[#c2ab65]/30 hover:border-[#c2ab65]/50"
          >
            <Users className="w-8 h-8 text-[#c2ab65] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">Tables</p>
          </button>
          <button 
            onClick={() => navigate('/kot')}
            className="bg-gradient-to-br from-[#fefcf7] to-[#fcf9f0] rounded-lg p-4 hover:shadow-lg hover:from-[#fcf9f0] hover:to-[#faf6e8] transition-all cursor-pointer border border-[#c2ab65]/30 hover:border-[#c2ab65]/50"
          >
            <TrendingUp className="w-8 h-8 text-[#c2ab65] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-800">KOT</p>
          </button>
        </div>
      </div>

      {/* Table Details Modal */}
      {showTableModal && selectedTable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#1f2937]">
                {selectedTable.tableNumber || selectedTable.name} Details
              </h3>
              <button 
                onClick={() => setShowTableModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Table Number:</span>
                <span className="text-[#1f2937]">{selectedTable.tableNumber || selectedTable.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedTable.status === 'available' ? 'bg-green-100 text-green-800' :
                  selectedTable.status === 'occupied' ? 'bg-red-100 text-red-800' :
                  selectedTable.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedTable.status}
                </span>
              </div>
              
              {selectedTable.capacity && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Capacity:</span>
                  <span className="text-[#1f2937]">{selectedTable.capacity} people</span>
                </div>
              )}
              
              {selectedTable.location && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Location:</span>
                  <span className="text-[#1f2937]">{selectedTable.location}</span>
                </div>
              )}
              
              {selectedTable.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-[#1f2937] mt-1">{selectedTable.description}</p>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Table ID:</span>
                <span className="text-gray-500 text-sm">{selectedTable._id}</span>
              </div>
            </div>
            
            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => setShowTableModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowTableModal(false);
                  navigate('/resturant/order-table');
                }}
                className="flex-1 px-4 py-2 bg-[#c2ab65] text-white rounded-lg hover:bg-[#b8a055] transition-colors"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;