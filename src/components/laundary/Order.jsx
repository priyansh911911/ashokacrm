import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Filter,
  X,
  Save,
  User,
  Package,
  List,
  CheckCircle,
  Clock,
  Truck,
  Info,
  AlertCircle,
  Check,
  CreditCard,
  Shield,
  Clipboard,
  RotateCcw,
  Ban,
  AlertTriangle,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast, { Toaster } from 'react-hot-toast';
import LaundryEditForm from './Editform';
import AddOrderForm from './AddOrderForm';

// Apply theme styles
const themeStyles = {
  primary: 'hsl(45, 43%, 58%)',
  secondary: 'hsl(45, 71%, 69%)',
  accent: 'hsl(45, 100%, 80%)',
  background: 'hsl(45, 100%, 95%)',
  text: 'hsl(45, 100%, 20%)',
  border: 'hsl(45, 100%, 85%)',
  hover: 'hsl(45, 32%, 46%)'
};

// Main App Component
const App = () => {
  // Apply theme to document
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', themeStyles.primary);
    document.documentElement.style.setProperty('--color-secondary', themeStyles.secondary);
    document.documentElement.style.setProperty('--color-accent', themeStyles.accent);
    document.documentElement.style.setProperty('--color-background', themeStyles.background);
    document.documentElement.style.setProperty('--color-text', themeStyles.text);
    document.documentElement.style.setProperty('--color-border', themeStyles.border);
    document.documentElement.style.setProperty('--color-hover', themeStyles.hover);
  }, []);
  const { axios } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [laundryRates, setLaundryRates] = useState([]);
  const [itemStatusUpdateAvailable, setItemStatusUpdateAvailable] = useState(true);
  const [bookings, setBookings] = useState([]);

  const getAuthToken = () => localStorage.getItem("token");

  const fetchBookings = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await axios.get("/api/bookings/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookingsData = Array.isArray(response.data) ? response.data : response.data?.bookings || [];
      console.log('Fetched bookings:', bookingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBookings();
    fetchLaundryRates();
  }, []);

  const fetchLaundryRates = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await axios.get("/api/laundry-rates/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLaundryRates(Array.isArray(response.data) ? response.data : response.data?.data || []);
    } catch (error) {
      console.error("Error fetching laundry rates:", error);
      setLaundryRates([]);
    }
  };





  // Function to save (add or update) an order via the API
  const handleSaveOrder = async (orderData) => {
    const token = getAuthToken();
    console.log('Token:', token ? 'exists' : 'missing');
    
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const loadingToast = toast.loading('Saving order...');
    try {
      if (editingOrder) {
        // Update existing order
        const response = await axios.put(
          `/api/laundry/${editingOrder._id}`,
          orderData,
          { headers: { Authorization: `Bearer ${String(token)}` } }
        );
        const updatedOrder = response.data;
        setOrders(orders.map(order => 
          order._id === updatedOrder._id ? updatedOrder : order
        ));
        toast.success('Order updated successfully!', { id: loadingToast });
      } else {
        // Create new order using axios
        console.log('=== API REQUEST DEBUG ===');
        console.log('Endpoint:', '/api/laundry/order');
        console.log('Headers:', { Authorization: `Bearer ${token}` });
        console.log('Request Body:', JSON.stringify(orderData, null, 2));
        console.log('Items count:', orderData.items?.length);
        console.log('Valid items:', orderData.items?.filter(item => item.itemName && item.quantity));
        
        const response = await axios.post('/api/laundry/order', orderData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('=== API RESPONSE DEBUG ===');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        const newOrder = response.data;
        setOrders([...orders, newOrder]);
        toast.success('Order created successfully!', { id: loadingToast });
      }
      setShowOrderForm(false);
      setEditingOrder(null);
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error saving order:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      console.error("Error message:", error.message);
      console.error("Request config:", error.config);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.response?.statusText || 
                          error.message || 
                          'Unknown error occurred';
      
      toast.error(`Error saving order: ${errorMessage}`, { id: loadingToast });
    }
  };

  const handleDeleteOrder = async (id) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    if (window.confirm("Are you sure you want to delete this order?")) {
      const loadingToast = toast.loading('Deleting order...');
      try {
        await axios.delete(`/api/laundry/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(orders.filter(order => order._id !== id));
        toast.success('Order deleted successfully!', { id: loadingToast });
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error(`Error deleting order: ${error.response?.data?.message || error.message}`, { id: loadingToast });
      }
    }
  };

  const handleCancelOrder = async (id) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    if (window.confirm("Are you sure you want to cancel this order?")) {
      const loadingToast = toast.loading('Cancelling order...');
      try {
        await axios.patch(`/api/laundry/cancel/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchOrders();
        toast.success('Order cancelled successfully!', { id: loadingToast });
      } catch (error) {
        console.error("Error cancelling order:", error);
        toast.error(`Error cancelling order: ${error.response?.data?.message || error.message}`, { id: loadingToast });
      }
    }
  };

  // Mark order as returned
  const handleReturnOrder = async (id) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    if (window.confirm("Are you sure you want to mark this order as returned?")) {
      const loadingToast = toast.loading('Marking order as returned...');
      try {
        await axios.patch(`/api/laundry/return/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchOrders();
        toast.success('Order marked as returned successfully!', { id: loadingToast });
      } catch (error) {
        console.error("Error marking order as returned:", error);
        toast.error(`Error marking order as returned: ${error.response?.data?.message || error.message}`, { id: loadingToast });
      }
    }
  };

  // Report loss
  const handleReportLoss = async (id, lossNote) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const loadingToast = toast.loading('Reporting loss...');
    try {
      await axios.post(`/api/laundry/loss/${id}`, { lossNote }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      toast.success('Loss reported successfully!', { id: loadingToast });
    } catch (error) {
      console.error("Error reporting loss:", error);
      toast.error(`Error reporting loss: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };



  // Add items to existing order
  const handleAddItems = async (orderId, items) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const loadingToast = toast.loading('Adding items to order...');
    try {
      await axios.post(`/api/laundry/add-items/${orderId}`, { items }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      toast.success('Items added to order!', { id: loadingToast });
    } catch (error) {
      console.error("Error adding items:", error);
      toast.error(`Error adding items: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };

  // Update item status using PATCH
  const handleUpdateItemStatus = async (orderId, itemId, status) => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const loadingToast = toast.loading('Updating item status...');
    try {
      await axios.patch(`/api/laundry/item/${orderId}/${itemId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
      toast.success('Item status updated!', { id: loadingToast });
    } catch (error) {
      console.error("Error updating item status:", error);
      setItemStatusUpdateAvailable(false);
      toast.error(`Error updating item status: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };

  // Fetch orders with better error handling
  const fetchOrders = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    try {
      const response = await axios.get("/api/laundry/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Raw API Response:', response.data);
      
      let ordersData = [];
      if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response.data?.orders && Array.isArray(response.data.orders)) {
        ordersData = response.data.orders;
      } else if (response.data?.laundry && Array.isArray(response.data.laundry)) {
        ordersData = response.data.laundry;
      }
      
      console.log('Processed Orders Data:', ordersData);
      console.table(ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      console.error("Error response:", error.response?.data);
      setOrders([]);
      toast.error('Failed to fetch orders');
    }
  };

  // Function to open the add order form
  const handleAddOrder = () => {
    setShowAddForm(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowOrderForm(true);
  };

  // Search by room or GRC
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchOrders();
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const loadingToast = toast.loading('Searching...');
    try {
      const response = await axios.get(`/api/laundry/by-grc-or-room?roomNumber=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const searchResults = Array.isArray(response.data) 
        ? response.data 
        : response.data?.laundry || [];
      
      setOrders(searchResults);
      toast.success(`Found ${searchResults.length} orders`, { id: loadingToast });
    } catch (error) {
      console.error("Error searching orders:", error);
      toast.error(`Search failed: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };

  // Filter by date range
  const handleDateFilter = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const loadingToast = toast.loading('Filtering by date...');
    try {
      const response = await axios.get(`/api/laundry/filter-by-date?startDate=${startDate}&endDate=${endDate}&dateField=pickupTime`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const searchResults = Array.isArray(response.data) 
        ? response.data 
        : response.data?.laundry || [];
      
      setOrders(searchResults);
      toast.success(`Found ${searchResults.length} orders`, { id: loadingToast });
    } catch (error) {
      console.error("Error filtering by date:", error);
      toast.error(`Date filter failed: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      if (filterStatus !== "All" && order.laundryStatus !== filterStatus) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));



  const getStatusBadge = (status) => {
    const baseClass = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case "pending":
        return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>
          <Clock size={12} className="mr-1" /> Pending
        </span>;
      case "in_progress":
        return <span className={`${baseClass} bg-blue-100 text-blue-800`}>
          <Clock size={12} className="mr-1" /> In Progress
        </span>;
      case "completed":
        return <span className={`${baseClass} bg-green-100 text-green-800`}>
          <CheckCircle size={12} className="mr-1" /> Completed
        </span>;
      case "partially_delivered":
        return <span className={`${baseClass} bg-purple-100 text-purple-800`}>
          <Truck size={12} className="mr-1" /> Partial Delivery
        </span>;
      case "cancelled":
        return <span className={`${baseClass} bg-red-100 text-red-800`}>
          <X size={12} className="mr-1" /> Cancelled
        </span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>
          Unknown
        </span>;
    }
  };

  const getItemStatusBadge = (status) => {
    const baseClass = "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium";
    
    switch (status) {
      case "pending":
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>Pending</span>;
      case "picked_up":
        return <span className={`${baseClass} bg-blue-100 text-blue-800`}>Picked Up</span>;
      case "ready":
        return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Ready</span>;
      case "delivered":
        return <span className={`${baseClass} bg-green-100 text-green-800`}>Delivered</span>;
      case "cancelled":
        return <span className={`${baseClass} bg-red-100 text-red-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClass} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  const getBookingDetails = (bookingId) => {
    console.log('Looking for booking:', bookingId);
    console.log('Available bookings:', bookings.length);
    const booking = bookings.find(b => b._id === bookingId);
    console.log('Found booking:', booking);
    return booking || null;
  };

  return (
    <div className="min-h-screen bg-background font-sans text-text p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-border">
        <h1 className="text-3xl font-extrabold text-text mb-4 sm:mb-0">
          Laundry Order Management
        </h1>
        <button
          onClick={handleAddOrder}
          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full shadow-lg text-white bg-primary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-105"
        >
          <Plus size={18} className="mr-1 sm:mr-2" /> 
          <span className="hidden sm:inline">Add New Order</span>
          <span className="sm:hidden">Add Order</span>
        </button>
      </header>

      <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-border">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center w-full sm:w-auto">
            <Filter size={20} className="text-text mr-2" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full sm:w-auto px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm text-text"
            >
              <option value="All">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="picked_up">Picked Up</option>
              <option value="ready">Ready</option>
              <option value="partially_delivered">Partial Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="returned">Returned</option>
              <option value="cancelled">Cancelled</option>
              <option value="lost">Lost</option>
              <option value="damaged">Damaged</option>
            </select>
          </div>
        </div>

        {/* Search Section */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-2">
            <div className="relative flex-1 lg:flex-none">
              <input
                type="text"
                placeholder="Search by Room Number or GRC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="block w-full lg:w-64 px-4 py-2 pl-10 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm text-text"
              />
              <User
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text"
              />
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleSearch}
                className="flex-1 lg:flex-none px-4 py-2 bg-primary text-white rounded-md hover:bg-hover transition-colors text-sm"
              >
                Search
              </button>
              
              <button
                onClick={() => {
                  setSearchQuery('');
                  fetchOrders();
                }}
                className="flex-1 lg:flex-none px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Date Filter */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm text-text"
            />
            <span className="text-sm text-text">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm text-text"
            />
            
            <div className="flex space-x-2">
              <button
                onClick={handleDateFilter}
                className="flex-1 lg:flex-none px-4 py-2 bg-primary text-white rounded-md hover:bg-hover transition-colors text-sm"
              >
                Filter by Date
              </button>
              
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  fetchOrders();
                }}
                className="flex-1 lg:flex-none px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
              >
                Clear Dates
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-text">
            No orders found matching your criteria.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-accent">
                  <tr>
                    <th className="w-1/7 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="w-1/7 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Guest / Room
                    </th>
                    <th className="w-1/7 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Items
                    </th>
                    <th className="w-1/7 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-1/7 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="w-1/7 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="w-1/7 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-accent">
                    <td className="px-3 py-4">
                      <div className="text-xs text-text">
                        {order._id?.toString().slice(-6)}
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      {(() => {
                        const booking = getBookingDetails(order.bookingId);
                        return (
                          <>
                            <div className="text-sm font-medium text-text">
                              {booking?.name || order.requestedByName || 'N/A'}
                            </div>
                            <div className="text-xs text-text">
                              GRC: {booking?.grcNo || order.grcNo || 'N/A'}
                            </div>
                            <div className="text-xs text-text">
                              Room: {booking?.roomNumber || order.roomNumber || 'N/A'}
                            </div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-4 text-sm text-text max-w-xs">
                      <div className="space-y-1">
                        {order.items?.map((item, index) => (
                          <div key={index} className="text-xs">
                            <div className="font-medium">
                              {item.quantity}x {item.itemName}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-green-600">${item.calculatedAmount}</span>
                              <select
                                value={item.status || 'pending'}
                                onChange={(e) => handleUpdateItemStatus(order._id, item._id, e.target.value)}
                                disabled={!itemStatusUpdateAvailable}
                                className={`text-xs border border-gray-300 rounded px-1 py-0.5 ${
                                  !itemStatusUpdateAvailable ? 'bg-gray-100 cursor-not-allowed' : ''
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="picked_up">Picked Up</option>
                                <option value="ready">Ready</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                            {item.deliveredQuantity > 0 && (
                              <div className="text-xs text-blue-600">Delivered: {item.deliveredQuantity}</div>
                            )}
                            {item.damageReported && (
                              <div className="text-xs text-red-600">Damage Reported</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      {getStatusBadge(order.laundryStatus)}
                      {order.isUrgent && (
                        <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle size={10} className="mr-1" /> Urgent
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-text">
                      <div className="font-medium">${order.totalAmount?.toFixed(2)}</div>
                      <div className="text-xs">
                        {order.billStatus === "paid" ? (
                          <span className="text-green-600">Paid <Check size={10} className="inline" /></span>
                        ) : order.billStatus === "waived" ? (
                          <span className="text-purple-600">Waived</span>
                        ) : (
                          <span className="text-red-600">Unpaid</span>
                        )}
                      </div>
                      {!order.isBillable && (
                        <div className="text-xs text-gray-500">Non-billable</div>
                      )}
                      {order.isComplimentary && (
                        <div className="text-xs text-blue-600">Complimentary</div>
                      )}
                    </td>

                    <td className="px-3 py-4 text-xs text-text">
                      <div className="space-y-1">
                        <div><strong>Created:</strong> {new Date(order.createdAt).toLocaleDateString()}</div>
                        <div><strong>Updated:</strong> {new Date(order.updatedAt).toLocaleDateString()}</div>
                        {order.scheduledPickupTime && (
                          <div><strong>Pickup:</strong> {new Date(order.scheduledPickupTime).toLocaleDateString()}</div>
                        )}
                        {order.scheduledDeliveryTime && (
                          <div><strong>Delivery:</strong> {new Date(order.scheduledDeliveryTime).toLocaleDateString()}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleReturnOrder(order._id)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                        >
                          Return
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            const lossNote = prompt('Enter loss note:');
                            if (lossNote) handleReportLoss(order._id, lossNote);
                          }}
                          className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                        >
                          Loss
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-accent p-4 rounded-lg border border-border">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-text">{order.requestedByName}</h3>
                    <p className="text-sm text-text">Room {order.roomNumber}</p>
                    {order.grcNo && <p className="text-xs text-text">GRC: {order.grcNo}</p>}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.laundryStatus)}
                    {order.isUrgent && (
                      <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle size={10} className="mr-1" /> Urgent
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Items */}
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-text mb-2">Items:</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-text">
                          <span className="font-medium">{item.quantity}x</span> {item.itemName}

                        </span>
                        <select
                          value={item.status || 'pending'}
                          onChange={(e) => handleUpdateItemStatus(order._id, item._id, e.target.value)}
                          disabled={!itemStatusUpdateAvailable}
                          className={`text-xs border border-gray-300 rounded px-1 py-0.5 ${
                            !itemStatusUpdateAvailable ? 'bg-gray-100 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="picked_up">Picked Up</option>
                          <option value="ready">Ready</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Amount & Status */}
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="font-medium text-text">${order.totalAmount?.toFixed(2)}</div>
                    <div className="text-xs">
                      {order.billStatus === "paid" ? (
                        <span className="text-green-600">Paid <Check size={10} className="inline" /></span>
                      ) : order.billStatus === "waived" ? (
                        <span className="text-purple-600">Waived</span>
                      ) : (
                        <span className="text-red-600">Unpaid</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-xs text-text">
                    {order.isCancelled && <div className="text-red-600">Cancelled</div>}
                    {order.isReturned && <div className="text-green-600">Returned</div>}
                    {order.damageReported && <div className="text-red-600">Damage Reported</div>}
                    {order.isLost && <div className="text-orange-600">Item Lost</div>}
                  </div>
                </div>
                
                {/* Schedule Info */}
                {(order.scheduledPickupTime || order.scheduledDeliveryTime) && (
                  <div className="mb-3 text-xs text-text">
                    {order.scheduledPickupTime && (
                      <div><span className="font-medium">Pickup:</span> {new Date(order.scheduledPickupTime).toLocaleString()}</div>
                    )}
                    {order.scheduledDeliveryTime && (
                      <div><span className="font-medium">Delivery:</span> {new Date(order.scheduledDeliveryTime).toLocaleString()}</div>
                    )}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-3 border-t border-border">
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleReturnOrder(order._id)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                  >
                    Return
                  </button>
                  <button
                    onClick={() => handleCancelOrder(order._id)}
                    className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      const lossNote = prompt('Enter loss note:');
                      if (lossNote) handleReportLoss(order._id, lossNote);
                    }}
                    className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
                  >
                    Loss
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order._id)}
                    className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </div>

      {showOrderForm && (
        <LaundryEditForm
          order={editingOrder}
          onSave={handleSaveOrder}
          onClose={() => setShowOrderForm(false)}
          laundryRates={laundryRates}
          bookings={bookings}
        />
      )}
      
      {showAddForm && (
        <AddOrderForm
          onSave={() => {
            fetchOrders(); // Refresh table data
            setShowAddForm(false);
          }}
          onClose={() => setShowAddForm(false)}
        />
      )}
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </div>
  );
};

export default App;