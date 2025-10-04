import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import { Plus, Edit, Trash2, Package, Clock, User, MapPin } from 'lucide-react';

const Order = () => {
  const { axios } = useAppContext();
  const [activeTab, setActiveTab] = useState('orders');
  const [showVendorAnalytics, setShowVendorAnalytics] = useState(false);
  const [orders, setOrders] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    orderType: 'Kitchen to Pantry',
    selectedItems: [],
    priority: 'medium',
    notes: '',
    guestName: '',
    roomNumber: '',
    totalAmount: 0,
    vendor: ''
  });
  
  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    GSTin: '',
    UpiID: '',
    scannerCodeUrl: '',
    isActive: true
  });

  useEffect(() => {
    fetchOrders();
    fetchPantryItems();
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vendor/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vendorsData = Array.isArray(response.data) ? response.data : (response.data.vendors || []);
      console.log('Fetched vendors:', vendorsData);
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setVendors([]);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/pantry/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const ordersData = data.orders || data.data || data || [];
      console.log('Fetched orders:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      showToast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchPantryItems = async () => {
    try {
      const { data } = await axios.get('/api/pantry/items', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Pantry Items API Response:', data);
      
      // Handle different response formats
      let items = [];
      if (Array.isArray(data)) {
        items = data;
      } else if (data.items && Array.isArray(data.items)) {
        items = data.items;
      } else if (data.data && Array.isArray(data.data)) {
        items = data.data;
      }
      
      console.log('All Pantry Items:', items);
      
      // Don't filter by category, use all items
      setPantryItems(items);
      
      if (items.length === 0) {
        showToast.error('No pantry items found. Please add some items first.');
      }
    } catch (error) {
      console.error('Pantry Items Error:', error);
      showToast.error('Failed to fetch pantry items: ' + error.message);
      setPantryItems([]);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (formData.selectedItems.length === 0) {
      showToast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        orderType: formData.orderType,
        items: formData.selectedItems.map(item => ({
          itemId: item.pantryItemId,
          pantryItemId: item.pantryItemId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice || 0,
          notes: item.notes || ''
        })),
        priority: formData.priority,
        notes: formData.notes,
        guestName: formData.guestName,
        roomNumber: formData.roomNumber,
        totalAmount: formData.totalAmount,
        vendorId: formData.vendor,
        orderNumber: `ORD-${Date.now()}`
      };

      if (editingOrder) {
        await axios.put(`/api/pantry/orders/${editingOrder._id}`, orderData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showToast.success('Order updated successfully');
      } else {
        await axios.post('/api/pantry/orders', orderData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showToast.success('Order created successfully');
      }

      resetForm();
      fetchOrders();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;

    try {
      await axios.delete(`/api/pantry/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast.success('Order deleted successfully');
      fetchOrders();
    } catch (error) {
      showToast.error('Failed to delete order');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`/api/pantry/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      showToast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      showToast.error('Failed to update order status');
    }
  };

  const addItem = () => {
    console.log('Add Item clicked, pantryItems:', pantryItems);
    if (pantryItems.length === 0) {
      showToast.error('No pantry items available. Please add items first.');
      return;
    }
    const firstItem = pantryItems[0];
    console.log('Adding item:', firstItem);
    setFormData(prev => {
      const newFormData = {
        ...prev,
        selectedItems: [...prev.selectedItems, {
          pantryItemId: firstItem._id,
          name: firstItem.name,
          quantity: 1,
          unit: firstItem.unit || 'pcs',
          unitPrice: firstItem.price || 0,
          notes: ''
        }]
      };
      console.log('Updated formData:', newFormData);
      return newFormData;
    });
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index, field, value) => {
    setFormData(prev => {
      const updatedItems = [...prev.selectedItems];
      if (field === 'pantryItemId') {
        const selectedItem = pantryItems.find(item => item._id === value);
        if (selectedItem) {
          updatedItems[index] = {
            ...updatedItems[index],
            pantryItemId: value,
            name: selectedItem.name,
            unit: selectedItem.unit
          };
        }
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: field === 'quantity' ? Number(value) : value
        };
      }
      return { ...prev, selectedItems: updatedItems };
    });
  };

  const resetForm = () => {
    setFormData({
      orderType: 'Kitchen to Pantry',
      selectedItems: [],
      priority: 'medium',
      notes: '',
      guestName: '',
      roomNumber: '',
      totalAmount: 0,
      vendor: ''
    });
    setEditingOrder(null);
    setShowOrderForm(false);
  };

  const handleVendorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVendorFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVendorFormData(prev => ({
          ...prev,
          scannerCodeUrl: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/vendor/add', vendorFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.success('Vendor added successfully!');
      resetVendorForm();
      fetchVendors();
    } catch (err) {
      showToast.error('Failed to add vendor');
    } finally {
      setLoading(false);
    }
  };

  const resetVendorForm = () => {
    setVendorFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      GSTin: '',
      UpiID: '',
      scannerCodeUrl: '',
      isActive: true
    });
    setSelectedImage(null);
    setShowVendorForm(false);
  };

  const getVendorName = (vendorId) => {
    if (!vendorId) return 'N/A';
    
    // Handle if vendorId is an object with _id property
    const id = typeof vendorId === 'object' ? vendorId._id : vendorId;
    
    const vendor = vendors.find(v => v._id === id);
    return vendor?.name || 'N/A';
  };

  const getVendorAnalytics = () => {
    const analytics = {};
    
    orders.forEach(order => {
      if (order.vendorId && order.totalAmount) {
        const vendorId = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
        const vendorName = getVendorName(vendorId);
        
        if (!analytics[vendorId]) {
          analytics[vendorId] = {
            name: vendorName,
            totalOrders: 0,
            totalAmount: 0,
            avgAmount: 0,
            lastOrderDate: null,
            orders: []
          };
        }
        
        analytics[vendorId].totalOrders++;
        analytics[vendorId].totalAmount += order.totalAmount;
        analytics[vendorId].orders.push({
          date: order.createdAt || order.orderDate,
          amount: order.totalAmount,
          orderNumber: order.orderNumber
        });
        
        if (!analytics[vendorId].lastOrderDate || new Date(order.createdAt) > new Date(analytics[vendorId].lastOrderDate)) {
          analytics[vendorId].lastOrderDate = order.createdAt;
        }
      }
    });
    
    // Calculate averages
    Object.keys(analytics).forEach(vendorId => {
      analytics[vendorId].avgAmount = analytics[vendorId].totalAmount / analytics[vendorId].totalOrders;
      analytics[vendorId].orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return Object.values(analytics).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setFormData({
      orderType: order.orderType || 'Kitchen to Pantry',
      selectedItems: order.items || [],
      priority: order.priority || 'medium',
      notes: order.notes || '',
      guestName: order.guestName || '',
      roomNumber: order.roomNumber || '',
      totalAmount: order.totalAmount || 0
    });
    setShowOrderForm(true);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      fulfilled: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || 'bg-blue-100 text-blue-800'}`}>
        {priority?.charAt(0).toUpperCase() + priority?.slice(1) || 'Medium'}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus && order.status !== filterStatus) return false;
    if (filterType && order.orderType !== filterType) return false;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">Pantry Orders</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowVendorAnalytics(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
          >
            Vendor Analytics
          </button>
          <button
            onClick={() => setShowVendorForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
          >
            Add Vendor
          </button>
          <button
            onClick={() => setShowOrderForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Create Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">All Types</option>
            <option value="Kitchen to Pantry">Kitchen to Pantry</option>
            <option value="Pantry to Reception">Pantry to Reception</option>
          </select>
        </div>
      </div>

      {/* Orders List - Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {order.orderNumber || order._id?.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.orderType === 'kitchen-to-pantry' ? 'Kitchen → Pantry' : 'Pantry → Reception'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.guestName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getVendorName(order.vendorId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityBadge(order.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                        {order.status === 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'approved')}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Approve
                          </button>
                        )}
                        {order.status === 'approved' && (
                          <button
                            onClick={() => updateOrderStatus(order._id, 'fulfilled')}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Fulfill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders List - Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            Loading...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
            No orders found
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    #{order.orderNumber || order._id?.slice(-8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.orderType === 'kitchen-to-pantry' ? 'Kitchen → Pantry' : 'Pantry → Reception'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(order.priority)}
                  {getStatusBadge(order.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Guest:</span>
                  <p className="font-medium">{order.guestName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Vendor:</span>
                  <p className="font-medium">{getVendorName(order.vendorId)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Items:</span>
                  <p className="font-medium">{order.items?.length || 0} items</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleEditOrder(order)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteOrder(order._id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'approved')}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                  >
                    Approve
                  </button>
                )}
                {order.status === 'approved' && (
                  <button
                    onClick={() => updateOrderStatus(order._id, 'fulfilled')}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    Fulfill
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Vendor Form Modal */}
      {showVendorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Add New Vendor</h2>
              <form onSubmit={handleVendorSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      name="name"
                      value={vendorFormData.name}
                      onChange={handleVendorChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      name="phone"
                      value={vendorFormData.phone}
                      onChange={handleVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={vendorFormData.email}
                      onChange={handleVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      name="GSTin"
                      value={vendorFormData.GSTin}
                      onChange={handleVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input
                      name="UpiID"
                      value={vendorFormData.UpiID}
                      onChange={handleVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scanner QR Code</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {vendorFormData.scannerCodeUrl && (
                      <div className="mt-2">
                        <img 
                          src={vendorFormData.scannerCodeUrl} 
                          alt="Scanner QR Code" 
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={vendorFormData.address}
                    onChange={handleVendorChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={vendorFormData.isActive}
                    onChange={handleVendorChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetVendorForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Adding...' : 'Add Vendor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Analytics Modal */}
      {showVendorAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Vendor Price Analytics</h2>
                <button
                  onClick={() => setShowVendorAnalytics(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {getVendorAnalytics().map((vendor, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                        <p className="text-sm text-gray-600">
                          Last Order: {vendor.lastOrderDate ? new Date(vendor.lastOrderDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">₹{vendor.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded p-3 text-center">
                        <p className="text-xl font-semibold text-blue-600">{vendor.totalOrders}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center">
                        <p className="text-xl font-semibold text-orange-600">₹{vendor.avgAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center">
                        <p className="text-xl font-semibold text-purple-600">
                          {vendor.orders.length > 0 ? `₹${vendor.orders[0].amount}` : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Latest Order</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recent Orders:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {vendor.orders.slice(0, 5).map((order, orderIndex) => (
                          <div key={orderIndex} className="flex justify-between items-center bg-white rounded p-2 text-sm">
                            <span className="text-gray-600">
                              {order.orderNumber} - {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="font-medium text-green-600">₹{order.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getVendorAnalytics().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No vendor analytics data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingOrder ? 'Edit Order' : 'Create New Order'}
              </h2>
              
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                    <select
                      value={formData.orderType}
                      onChange={(e) => setFormData(prev => ({ ...prev, orderType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Kitchen to Pantry">Kitchen to Pantry</option>
                      <option value="Pantry to Reception">Pantry to Reception</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  <select
                    value={formData.vendor}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Vendor ({vendors.length} available)</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
                    <input
                      type="text"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                {formData.orderType === 'Pantry to Reception' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">Items</label>
                    <button
                      type="button"
                      onClick={addItem}
                      disabled={pantryItems.length === 0}
                      className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Item ({pantryItems.length} available)
                    </button>
                  </div>
                  
                  {pantryItems.length === 0 ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      No pantry items available. Please add pantry items first before creating orders.
                    </div>
                  ) : formData.selectedItems.length === 0 ? (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                      No items added yet. Click "Add Item" to add items to this order.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formData.selectedItems.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded">
                          <select
                            value={item.pantryItemId}
                            onChange={(e) => updateItem(index, 'pantryItemId', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {pantryItems.map(pantryItem => (
                              <option key={pantryItem._id} value={pantryItem._id}>
                                {pantryItem.name}
                              </option>
                            ))}
                          </select>
                          
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          
                          <span className="text-sm text-gray-600">{item.unit}</span>
                          
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || formData.selectedItems.length === 0}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : editingOrder ? 'Update Order' : 'Create Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;