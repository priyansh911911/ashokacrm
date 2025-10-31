import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, Users, DollarSign, RefreshCw } from 'lucide-react';
import DashboardLoader from '../DashboardLoader';
import LowStockInvoice from './LowStockInvoice';

const PantryDashboard = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPrintInvoice, setShowPrintInvoice] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalItems: 0,
    lowStockItems: [],
    recentOrders: [],
    totalOrders: 0,
    totalVendors: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [itemsRes, ordersRes, vendorsRes] = await Promise.all([
        axios.get('/api/pantry/items', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/pantry/orders', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('/api/vendor/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const items = Array.isArray(itemsRes.data) ? itemsRes.data : (itemsRes.data.items || itemsRes.data.data || []);
      const orders = ordersRes.data.orders || ordersRes.data.data || ordersRes.data || [];
      const vendors = Array.isArray(vendorsRes.data) ? vendorsRes.data : (vendorsRes.data.vendors || []);

      // Calculate low stock items (items with stockQuantity <= minStockLevel)
      const lowStockItems = items.filter(item => (item.stockQuantity || 0) <= (item.minStockLevel || 10));
      
      // Calculate total value
      const totalValue = items.reduce((sum, item) => sum + ((item.stockQuantity || 0) * (item.price || 0)), 0);

      console.log('Low Stock Items:', lowStockItems.map(item => ({
        name: item.name,
        stockQuantity: item.stockQuantity,
        unit: item.unit,
        minStockLevel: item.minStockLevel
      })));
      
      setDashboardData({
        totalItems: items.length,
        lowStockItems,
        recentOrders: orders.slice(0, 5),
        totalOrders: orders.length,
        totalVendors: vendors.length,
        totalValue
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const generateLowStockInvoice = async () => {
    try {
      // First check if there are low stock items
      if (dashboardData.lowStockItems.length === 0) {
        showToast.error('No low stock items found to generate invoice');
        return;
      }

      const response = await axios.get('/api/pantry/invoice/low-stock', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob'
      });
      
      console.log('PDF Response:', response);
      console.log('Response size:', response.data.size);
      console.log('Response type:', response.data.type);
      
      // Check if we got a valid PDF response
      if (response.data.size === 0) {
        showToast.error('Empty PDF response received');
        return;
      }
      
      // Create and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `low-stock-invoice-${new Date().toISOString().split('T')[0]}.pdf`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);
      
      showToast.success('Low stock invoice downloaded successfully');
    } catch (error) {
      console.error('Low stock invoice error:', error);
      if (error.response?.status === 404) {
        showToast.error('No low stock items found to generate invoice');
      } else if (error.response?.status === 500) {
        showToast.error('Server error generating PDF. Please try again.');
      } else {
        showToast.error(`Failed to generate invoice: ${error.message}`);
      }
    }
  };

  const generateExcelReport = () => {
    if (dashboardData.lowStockItems.length === 0) {
      showToast.error('No low stock items to export');
      return;
    }

    // Create CSV content
    const headers = ['Item Name', 'Category', 'Current Stock', 'Unit', 'Price per Unit', 'Total Value'];
    const csvContent = [
      headers.join(','),
      ...dashboardData.lowStockItems.map(item => [
        `"${item.name || 'N/A'}"`,
        `"${typeof item.category === 'object' ? item.category?.name || 'N/A' : item.category || 'N/A'}"`,
        item.stockQuantity ?? 0,
        `"${item.unit || 'pcs'}"`,
        item.price || 0,
        ((item.stockQuantity || 0) * (item.price || 0)).toFixed(2)
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `low-stock-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast.success('Excel report downloaded successfully');
  };

  const printLowStockItems = () => {
    if (dashboardData.lowStockItems.length === 0) {
      showToast.error('No low stock items to create invoice');
      return;
    }
    setShowPrintInvoice(true);
  };

  const handlePrintLowStockItems = () => {
    window.print();
  };

  const handleItemClick = (itemId) => {
    navigate(`/pantry/item?edit=${itemId}`);
  };

  if (loading) {
    return <DashboardLoader pageName="Pantry Dashboard" />;
  }

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">Pantry Dashboard</h1>
        <button
          onClick={generateExcelReport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          Export Excel
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalItems}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">{dashboardData.lowStockItems.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalOrders}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <ShoppingCart className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalVendors}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory value</p>
              <p className="text-2xl font-bold text-gray-900">₹{dashboardData.totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Status</p>
              <p className="text-lg font-bold text-green-600">
                {dashboardData.lowStockItems.length === 0 ? 'Good' : 'Needs Attention'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Low Stock Items</h2>
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                {dashboardData.lowStockItems.length} items
              </span>
              {dashboardData.lowStockItems.length > 0 && (
                <button
                  onClick={printLowStockItems}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Print Low Stock Items
                </button>
              )}
            </div>
          </div>
          
          {dashboardData.lowStockItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">All items are well stocked!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.lowStockItems.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200 cursor-pointer hover:bg-red-100 transition-colors"
                  onClick={() => handleItemClick(item._id)}
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Category: {typeof item.category === 'object' ? item.category?.name || 'N/A' : item.category || 'N/A'}</p>
                    <p className="text-sm text-gray-600">Unit: {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{item.stockQuantity || 0}</p>
                    <p className="text-xs text-gray-500">in stock</p>
                    <p className="text-xs text-gray-500">₹{item.price || 0}/unit</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Last 5 orders
            </span>
          </div>
          
          {dashboardData.recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">No recent orders</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {dashboardData.recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <h3 className="font-medium text-gray-900">#{order._id?.slice(-8)}</h3>
                    <p className="text-sm text-gray-600">{order.orderType}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₹{order.totalAmount || 0}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                      order.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
            <Package className="text-blue-600 mb-2" size={24} />
            <p className="font-medium text-blue-900">Add New Item</p>
          </button>
          <button className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
            <ShoppingCart className="text-green-600 mb-2" size={24} />
            <p className="font-medium text-green-900">Create Order</p>
          </button>
          <button className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
            <AlertTriangle className="text-orange-600 mb-2" size={24} />
            <p className="font-medium text-orange-900">Restock Alert</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
            <Users className="text-purple-600 mb-2" size={24} />
            <p className="font-medium text-purple-900">Manage Vendors</p>
          </button>
        </div>
      </div> */}

      {/* Low Stock Invoice Modal */}
      {showPrintInvoice && (
        <LowStockInvoice 
          lowStockItems={dashboardData.lowStockItems}
          onClose={() => setShowPrintInvoice(false)}
        />
      )}
    </div>
  );
};

export default PantryDashboard;