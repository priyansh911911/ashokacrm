import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import { Plus, Edit, Trash2, Package, Clock, User, MapPin } from 'lucide-react';

const Order = () => {
  const { axios } = useAppContext();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [vendorAnalytics, setVendorAnalytics] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showFormAnalytics, setShowFormAnalytics] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    orderType: 'Kitchen to Pantry',
    selectedItems: [],
    priority: 'medium',
    notes: '',
    totalAmount: 0,
    vendor: '',
    guestName: ''
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
        guestName: formData.guestName || 'Guest',
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
        totalAmount: formData.totalAmount,
        vendorId: formData.vendor || null
      };
      
      console.log('Submitting order data:', orderData);

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
      console.error('Order submission error:', error.response?.data);
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
    const confirmMessage = `Are you sure you want to change the order status to "${newStatus.toUpperCase()}"?\n\nThis action cannot be undone.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await axios.patch(`/api/pantry/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      showToast.success(`Order status updated to ${newStatus}`);
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
      const newItem = {
        pantryItemId: firstItem._id,
        name: firstItem.name,
        quantity: 1,
        unit: firstItem.unit || 'pcs',
        unitPrice: firstItem.price || 0,
        notes: ''
      };
      
      const updatedItems = [...prev.selectedItems, newItem];
      const totalAmount = updatedItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      
      const newFormData = {
        ...prev,
        selectedItems: updatedItems,
        totalAmount: totalAmount
      };
      console.log('Updated formData:', newFormData);
      return newFormData;
    });
  };

  const removeItem = (index) => {
    setFormData(prev => {
      const updatedItems = prev.selectedItems.filter((_, i) => i !== index);
      const totalAmount = updatedItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      
      return {
        ...prev,
        selectedItems: updatedItems,
        totalAmount: totalAmount
      };
    });
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
            unit: selectedItem.unit,
            unitPrice: selectedItem.price || 0
          };
        }
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value
        };
      }
      
      // Calculate total amount
      const totalAmount = updatedItems.reduce((sum, item) => {
        return sum + (item.quantity * item.unitPrice);
      }, 0);
      
      return { 
        ...prev, 
        selectedItems: updatedItems,
        totalAmount: totalAmount
      };
    });
  };

  const resetForm = () => {
    setFormData({
      orderType: 'Kitchen to Pantry',
      selectedItems: [],
      priority: 'medium',
      notes: '',
      totalAmount: 0,
      vendor: '',
      guestName: ''
    });
    setEditingOrder(null);
    setShowOrderForm(false);
  };



  const getVendorName = (vendorId) => {
    if (!vendorId) return 'N/A';
    
    // Handle if vendorId is an object with _id property
    const id = typeof vendorId === 'object' ? vendorId._id : vendorId;
    
    const vendor = vendors.find(v => v._id === id);
    return vendor?.name || 'N/A';
  };



  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setFormData({
      orderType: order.orderType || 'Kitchen to Pantry',
      selectedItems: order.items || [],
      priority: order.priority || 'medium',
      notes: order.notes || '',
      totalAmount: order.totalAmount || 0,
      guestName: order.guestName || ''
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

  const getVendorAnalytics = (vendorId) => {
    const vendorOrders = orders.filter(order => {
      if (!order.vendorId) return false;
      const id = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
      return id === vendorId;
    });
    
    return {
      vendor: vendors.find(v => v._id === vendorId),
      total: {
        orders: vendorOrders.length,
        amount: vendorOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        items: vendorOrders.reduce((sum, order) => sum + (order.items?.length || 0), 0)
      },
      statusBreakdown: {
        pending: vendorOrders.filter(o => o.status === 'pending').length,
        approved: vendorOrders.filter(o => o.status === 'approved').length,
        fulfilled: vendorOrders.filter(o => o.status === 'fulfilled').length,
        cancelled: vendorOrders.filter(o => o.status === 'cancelled').length
      }
    };
  };

  const handleVendorSelect = (vendorId) => {
    setFilterVendor(vendorId);
    if (vendorId) {
      const analytics = getVendorAnalytics(vendorId);
      setVendorAnalytics(analytics);
      setShowAnalytics(true);
    } else {
      setVendorAnalytics(null);
      setShowAnalytics(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus && order.status !== filterStatus) return false;
    if (filterType && order.orderType !== filterType) return false;
    if (filterVendor) {
      if (!order.vendorId) return false;
      const orderId = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
      if (orderId !== filterVendor) return false;
    }
    return true;
  });

  const generateInvoice = (order) => {
    const vendor = vendors.find(v => v._id === (typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId));
    const subtotal = order.totalAmount;
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    setInvoiceData({
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toLocaleDateString(),
      order,
      vendor,
      subtotal,
      tax,
      total
    });
    setShowInvoice(true);
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">Pantry Orders</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              if (filterVendor) {
                const selectedVendor = vendors.find(v => v._id === filterVendor);
                setFormData(prev => ({
                  ...prev,
                  vendor: filterVendor,
                  orderType: 'Reception to Vendor'
                }));
              }
              setShowOrderForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
          >
            Create Order{filterVendor ? ' for Selected Vendor' : ''}
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
            <option value="Reception to Vendor">Reception to Vendor</option>
          </select>

          <select
            value={filterVendor}
            onChange={(e) => handleVendorSelect(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          >
            <option value="">All Vendors</option>
            {vendors.map(vendor => (
              <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vendor Payment Info */}
      {filterVendor && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Info: {vendors.find(v => v._id === filterVendor)?.name}
              </h3>
              <div className="text-sm text-gray-600 mb-2">
                <strong>UPI ID:</strong> 
                {vendors.find(v => v._id === filterVendor)?.UpiID ? (
                  <button
                    onClick={() => {
                      const vendor = vendors.find(v => v._id === filterVendor);
                      const totalAmount = vendorAnalytics?.total?.amount || 0;
                      
                      // Check if mobile device
                      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                      
                      if (isMobile) {
                        const upiUrl = `upi://pay?pa=${vendor.UpiID}&pn=${encodeURIComponent(vendor.name)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('Payment for orders')}`;
                        window.location.href = upiUrl;
                      } else {
                        // Desktop fallback: copy UPI ID to clipboard
                        navigator.clipboard.writeText(vendor.UpiID).then(() => {
                          alert(`UPI ID copied to clipboard: ${vendor.UpiID}\nAmount: ₹${totalAmount}\nOpen your UPI app and pay manually.`);
                        }).catch(() => {
                          alert(`UPI ID: ${vendor.UpiID}\nAmount: ₹${totalAmount}\nCopy this UPI ID and pay using your UPI app.`);
                        });
                      }
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    {vendors.find(v => v._id === filterVendor)?.UpiID}
                  </button>
                ) : 'Not provided'}
              </div>
              {vendorAnalytics?.total?.amount > 0 && (
                <div className="text-sm text-green-600 font-medium">
                  Total Amount: ₹{vendorAnalytics.total.amount.toFixed(2)}
                </div>
              )}
            </div>
            {vendors.find(v => v._id === filterVendor)?.scannerImg && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 mb-2">QR Code</span>
                <img 
                  src={vendors.find(v => v._id === filterVendor)?.scannerImg} 
                  alt="Payment QR Code" 
                  className="w-20 h-20 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    const vendor = vendors.find(v => v._id === filterVendor);
                    const totalAmount = vendorAnalytics?.total?.amount || 0;
                    
                    // Check if mobile device
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                    
                    if (isMobile) {
                      const upiUrl = `upi://pay?pa=${vendor.UpiID}&pn=${encodeURIComponent(vendor.name)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('Payment for orders')}`;
                      window.location.href = upiUrl;
                    } else {
                      // Desktop fallback: copy UPI ID to clipboard
                      navigator.clipboard.writeText(vendor.UpiID).then(() => {
                        alert(`UPI ID copied to clipboard: ${vendor.UpiID}\nAmount: ₹${totalAmount}\nOpen your UPI app and pay manually.`);
                      }).catch(() => {
                        alert(`UPI ID: ${vendor.UpiID}\nAmount: ₹${totalAmount}\nCopy this UPI ID and pay using your UPI app.`);
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Vendor Analytics */}
      {showAnalytics && vendorAnalytics && (
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Analytics: {vendorAnalytics.vendor?.name}
            </h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-500 hover:text-gray-700 text-lg sm:text-base self-end sm:self-auto"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 sm:gap-4">
            {/* Total Stats */}
            <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3 sm:mb-4 text-base sm:text-lg">Vendor Analytics</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">{vendorAnalytics.total.orders}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">₹{vendorAnalytics.total.amount.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">{vendorAnalytics.total.items}</div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base">Order Status Breakdown</h3>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></span>
                <span className="text-xs sm:text-sm">Pending: {vendorAnalytics.statusBreakdown.pending}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-400 rounded-full"></span>
                <span className="text-xs sm:text-sm">Approved: {vendorAnalytics.statusBreakdown.approved}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"></span>
                <span className="text-xs sm:text-sm">Fulfilled: {vendorAnalytics.statusBreakdown.fulfilled}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></span>
                <span className="text-xs sm:text-sm">Cancelled: {vendorAnalytics.statusBreakdown.cancelled}</span>
              </div>
            </div>
          </div>

          {/* Previous Orders */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Previous Orders</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.filter(order => {
                if (!order.vendorId) return false;
                const id = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
                return id === filterVendor;
              }).slice(0, 10).map((order) => (
                <div key={order._id} className="bg-gray-50 p-3 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        #{order._id?.slice(-8)}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {getStatusBadge(order.status)}
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        ₹{order.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>Items:</strong>
                    <div className="mt-1 space-y-1">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.name || 'Item'}</span>
                          <span>{item.quantity} × ₹{item.unitPrice?.toFixed(2) || '0.00'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {order.specialInstructions && (
                    <div className="mt-2 text-xs text-gray-500">
                      <strong>Notes:</strong> {order.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
              {orders.filter(order => {
                if (!order.vendorId) return false;
                const id = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
                return id === filterVendor;
              }).length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No previous orders found for this vendor
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Orders List - Desktop Table */}
      <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
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
                  <td colSpan="7" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {order.orderNumber || order._id?.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.orderType === 'Kitchen to Pantry' ? 'Kitchen → Pantry' : 
                       order.orderType === 'Pantry to Reception' ? 'Pantry → Reception' :
                       order.orderType === 'Reception to Pantry' ? 'Reception → Pantry' :
                       order.orderType === 'Reception to Vendor' ? 'Reception → Vendor' :
                       order.orderType}
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
                        <button
                          onClick={() => generateInvoice(order)}
                          className="text-green-600 hover:text-green-900 text-xs"
                        >
                          Invoice
                        </button>

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
                    {order.orderType === 'Kitchen to Pantry' ? 'Kitchen → Pantry' : 
                     order.orderType === 'Pantry to Reception' ? 'Pantry → Reception' :
                     order.orderType === 'Reception to Pantry' ? 'Reception → Pantry' :
                     order.orderType === 'Reception to Vendor' ? 'Reception → Vendor' :
                     order.orderType}
                  </p>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(order.priority)}
                  {getStatusBadge(order.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
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
                <button
                  onClick={() => generateInvoice(order)}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Invoice
                </button>

              </div>
            </div>
          ))
        )}
      </div>



      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingOrder ? 'Edit Order' : 'Create New Order'}
              </h2>
              
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {/* General Analytics in Form */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-blue-800 text-sm">📊 Order Analytics</h4>
                    <button
                      type="button"
                      onClick={() => setShowFormAnalytics(!showFormAnalytics)}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-300 hover:bg-blue-100"
                    >
                      {showFormAnalytics ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {showFormAnalytics && (
                    <>
                      <div className="grid grid-cols-3 gap-3 text-center text-xs mb-3">
                        <div>
                          <div className="text-lg font-bold text-blue-600">{orders.length}</div>
                          <div className="text-gray-600">Total Orders</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">₹{orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0).toFixed(0)}</div>
                          <div className="text-gray-600">Total Amount</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">{pantryItems.length}</div>
                          <div className="text-gray-600">Available Items</div>
                        </div>
                      </div>
                      
                      {/* Items List */}
                      <div className="border-t border-blue-200 pt-2">
                        <h5 className="font-medium text-blue-700 mb-2 text-xs">Available Items & Prices:</h5>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {pantryItems.slice(0, 10).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs bg-white/50 px-2 py-1 rounded">
                              <span className="text-gray-700">{item.name}</span>
                              <span className="text-green-600 font-medium">₹{item.price || 0}</span>
                            </div>
                          ))}
                          {pantryItems.length > 10 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{pantryItems.length - 10} more items...
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
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
                      <option value="Reception to Vendor">Reception to Vendor</option>
                      <option value="Daily Essentials Distributor">🛒 Daily Essentials Distributor</option>
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

                {(formData.orderType === 'Reception to Vendor' || formData.orderType === 'Daily Essentials Distributor') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                    <select
                      value={formData.vendor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    >
                      <option value="">Select Vendor ({vendors.length} available)</option>
                      {vendors.map(vendor => (
                        <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                      ))}
                    </select>
                    
                    {/* Vendor Analytics in Form */}
                    {formData.vendor && (() => {
                      const analytics = getVendorAnalytics(formData.vendor);
                      return (
                        <div className="mt-3 bg-blue-50 p-3 rounded-lg border">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-blue-800 text-sm">📊 Vendor Analytics: {analytics.vendor?.name}</h4>
                            <button
                              type="button"
                              onClick={() => setShowFormAnalytics(!showFormAnalytics)}
                              className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded border border-blue-300 hover:bg-blue-100"
                            >
                              {showFormAnalytics ? 'Hide' : 'Show'}
                            </button>
                          </div>
                          {showFormAnalytics && (
                            <>
                              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                                <div>
                                  <div className="text-lg font-bold text-blue-600">{analytics.total.orders}</div>
                                  <div className="text-gray-600">Orders</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-green-600">₹{analytics.total.amount.toFixed(0)}</div>
                                  <div className="text-gray-600">Amount</div>
                                </div>
                                <div>
                                  <div className="text-lg font-bold text-purple-600">{analytics.total.items}</div>
                                  <div className="text-gray-600">Items</div>
                                </div>
                              </div>
                              <div className="mt-2 flex justify-between text-xs">
                                <span className="text-yellow-600">Pending: {analytics.statusBreakdown.pending}</span>
                                <span className="text-green-600">Fulfilled: {analytics.statusBreakdown.fulfilled}</span>
                              </div>
                              
                              {/* Vendor Items List */}
                              <div className="border-t border-blue-200 pt-2 mt-2">
                                <h5 className="font-medium text-blue-700 mb-2 text-xs">Recent Order Items:</h5>
                                <div className="max-h-24 overflow-y-auto space-y-1">
                                  {(() => {
                                    const vendorOrders = orders.filter(order => {
                                      if (!order.vendorId) return false;
                                      const id = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
                                      return id === formData.vendor;
                                    });
                                    const allItems = vendorOrders.flatMap(order => order.items || []);
                                    return allItems.slice(0, 8).map((item, idx) => {
                                      // Try to get item name from pantryItems if not available in order
                                      let itemName = item.name || item.itemName;
                                      if (!itemName && (item.itemId || item.pantryItemId)) {
                                        const pantryItem = pantryItems.find(p => p._id === (item.itemId || item.pantryItemId));
                                        itemName = pantryItem?.name;
                                      }
                                      console.log('Item debug:', item, 'Found name:', itemName);
                                      return (
                                        <div key={idx} className="flex justify-between text-xs bg-white/50 px-2 py-1 rounded">
                                          <span className="text-gray-700">{itemName || 'Unknown Item'} x{item.quantity || 1}</span>
                                          <span className="text-green-600 font-medium">₹{((item.quantity || 1) * (item.unitPrice || 0)).toFixed(0)}</span>
                                        </div>
                                      );
                                    });
                                  })()}
                                  {(() => {
                                    const vendorOrders = orders.filter(order => {
                                      if (!order.vendorId) return false;
                                      const id = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
                                      return id === formData.vendor;
                                    });
                                    const allItems = vendorOrders.flatMap(order => order.items || []);
                                    return allItems.length > 8 && (
                                      <div className="text-xs text-gray-500 text-center py-1">
                                        +{allItems.length - 8} more items...
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}



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
                        <div key={index} className="p-3 border rounded space-y-3">
                          <div className="flex items-center space-x-3">
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
                            
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Unit Price (₹)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Total</label>
                              <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded text-sm font-medium">
                                ₹{(item.quantity * item.unitPrice).toFixed(2)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Unit: {item.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total Amount Display */}
                {formData.selectedItems.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
                      <span className="text-xl font-bold text-green-600">₹{formData.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

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

      {/* Invoice Modal */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Invoice Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={downloadPDF}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Save as PDF
                  </button>
                  <button
                    onClick={() => setShowInvoice(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-8 border" id="invoice-content">
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">INVOICE</h1>
                  <p className="text-gray-600">Invoice #{invoiceData.invoiceNumber}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">From:</h3>
                    <p className="text-gray-600">
                      Ashoka Hotel<br/>
                      123 Hotel Street<br/>
                      City, State 12345
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">To:</h3>
                    <p className="text-gray-600">
                      {invoiceData.vendor?.name || 'Vendor'}<br/>
                      {invoiceData.vendor?.address || 'Address'}<br/>
                      {invoiceData.vendor?.phone || 'Phone'}
                    </p>
                  </div>
                </div>
                
                <div className="mb-8">
                  <p><strong>Date:</strong> {invoiceData.date}</p>
                  <p><strong>Order ID:</strong> #{invoiceData.order._id?.slice(-8)}</p>
                </div>
                
                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2">Item</th>
                      <th className="text-right py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.order.items?.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2">{item.name}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">₹{item.unitPrice?.toFixed(2)}</td>
                        <td className="text-right py-2">₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span>Subtotal:</span>
                      <span>₹{invoiceData.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span>Tax (18%):</span>
                      <span>₹{invoiceData.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
                      <span>Total:</span>
                      <span>₹{invoiceData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center text-gray-600">
                  <p>Thank you for your business!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;