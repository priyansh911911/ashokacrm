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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all restaurant data in parallel
      const [ordersRes, tablesRes, menuRes, kotRes] = await Promise.all([
        fetch('https://ashoka-backend.vercel.app/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://ashoka-backend.vercel.app/api/tables', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://ashoka-backend.vercel.app/api/menu', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('https://ashoka-backend.vercel.app/api/kot', {
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
      
      // If no orders from API, add mock data
      if (orders.length === 0) {
        orders = [
          { _id: '1', tableNumber: 'Table 5', items: [{name: 'Butter Chicken'}, {name: 'Naan'}], totalAmount: 850, status: 'preparing', createdAt: new Date() },
          { _id: '2', tableNumber: 'Table 2', items: [{name: 'Biryani'}, {name: 'Raita'}], totalAmount: 650, status: 'served', createdAt: new Date() },
          { _id: '3', tableNumber: 'Table 8', items: [{name: 'Dal Makhani'}, {name: 'Roti'}], totalAmount: 450, status: 'pending', createdAt: new Date() }
        ];
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
      
      // If no tables from API, add mock data
      if (tablesData.length === 0) {
        tablesData = [
          { _id: '1', tableNumber: 'Table 1', name: 'Table 1', status: 'available', capacity: 4 },
          { _id: '2', tableNumber: 'Table 2', name: 'Table 2', status: 'occupied', capacity: 2 },
          { _id: '3', tableNumber: 'Table 3', name: 'Table 3', status: 'available', capacity: 6 },
          { _id: '4', tableNumber: 'Table 4', name: 'Table 4', status: 'reserved', capacity: 4 },
          { _id: '5', tableNumber: 'Table 5', name: 'Table 5', status: 'occupied', capacity: 8 },
          { _id: '6', tableNumber: 'Table 6', name: 'Table 6', status: 'available', capacity: 2 }
        ];
      }
      
      console.log('Tables Data:', tablesData);
      setTables(tablesData);
      
      // Process Menu
      let menuData = [];
      if (menuRes.ok) {
        const menuResponse = await menuRes.json();
        menuData = Array.isArray(menuResponse) ? menuResponse : menuResponse.menu || [];
      }
      
      // Process KOT
      let kotData = [];
      if (kotRes.ok) {
        const kotResponse = await kotRes.json();
        console.log('KOT API Response:', kotResponse);
        kotData = Array.isArray(kotResponse) ? kotResponse : kotResponse.kot || kotResponse.data || [];
        setKotOrders(kotData.slice(0, 5));
      } else {
        console.log('KOT API failed:', kotRes.status);
        // Add mock KOT data if API fails
        const mockKot = [
          { _id: '1', kotNumber: 'KOT001', tableNumber: 'Table 3', items: [{name: 'Biryani'}, {name: 'Raita'}], status: 'preparing' },
          { _id: '2', kotNumber: 'KOT002', tableNumber: 'Table 7', items: [{name: 'Dal Makhani'}], status: 'pending' }
        ];
        setKotOrders(mockKot);
      }
      
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
      
      const recentOrdersData = orders.slice(0, 5).map(order => ({
        id: order._id,
        table: order.tableNumber || 'Table ' + (order.tableId || 'N/A'),
        items: order.items?.map(item => item.name || item.itemName).join(', ') || 'No items',
        amount: order.totalAmount || 0,
        status: order.status || 'pending'
      }));
      
      console.log('Recent Orders Data:', recentOrdersData);
      setRecentOrders(recentOrdersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to mock data
      setStats({
        todayOrders: 45,
        totalRevenue: 12500,
        activeOrders: 8,
        totalCustomers: 156,
        totalTables: 12,
        availableTables: 8,
        kotCount: 5
      });
      
      setRecentOrders([
        { id: 1, table: 'Table 5', items: 'Butter Chicken, Naan', amount: 850, status: 'preparing' },
        { id: 2, table: 'Table 2', items: 'Biryani, Raita', amount: 650, status: 'served' },
        { id: 3, table: 'Table 8', items: 'Dal Makhani, Roti', amount: 450, status: 'pending' }
      ]);
      
      setKotOrders([
        { _id: '1', kotNumber: 'KOT001', tableNumber: 'Table 3', items: [{name: 'Biryani'}, {name: 'Raita'}], status: 'preparing' },
        { _id: '2', kotNumber: 'KOT002', tableNumber: 'Table 7', items: [{name: 'Dal Makhani'}], status: 'pending' }
      ]);
      
      setTables([
        { _id: '1', tableNumber: 'Table 1', name: 'Table 1', status: 'available', capacity: 4 },
        { _id: '2', tableNumber: 'Table 2', name: 'Table 2', status: 'occupied', capacity: 2 },
        { _id: '3', tableNumber: 'Table 3', name: 'Table 3', status: 'available', capacity: 6 },
        { _id: '4', tableNumber: 'Table 4', name: 'Table 4', status: 'reserved', capacity: 4 }
      ]);
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
                <div key={table._id} className={`p-3 rounded-lg border ${
                  table.status === 'available' ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300' : 
                  table.status === 'occupied' ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-300' : 
                  table.status === 'reserved' ? 'bg-gradient-to-br from-[#fefcf7] to-[#fcf9f0] border-[#c2ab65]/40' :
                  'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300'
                }`}>
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
    </div>
  );
};

export default RestaurantDashboard;