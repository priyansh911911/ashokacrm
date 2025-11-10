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
  Wrench,
  XCircle,
} from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast, { Toaster } from 'react-hot-toast';
import LaundryEditForm from './Editform';
import AddOrderForm from './AddOrderForm';
import DashboardLoader from '../DashboardLoader';
import LaundryInvoice from './LaundryInvoice';

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
  const [showRateForm, setShowRateForm] = useState(false);
  const [rateFormData, setRateFormData] = useState({
    category: 'gentlemen',
    serviceType: 'wash',
    itemName: '',
    rate: '',
    unit: 'piece'
  });
  const [editingOrder, setEditingOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterOrderType, setFilterOrderType] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [laundryRates, setLaundryRates] = useState([]);
  const [itemStatusUpdateAvailable, setItemStatusUpdateAvailable] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLossModal, setShowLossModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lossFormData, setLossFormData] = useState({
    selectedItems: [],
    lossNote: ''
  });
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [laundryVendors, setLaundryVendors] = useState([]);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnFormData, setReturnFormData] = useState({
    selectedItems: [],
    returnNote: '',
    itemQuantities: {}
  });

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
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchBookings(),
        fetchLaundryRates(),
        fetchLaundryVendors()
      ]);
      setIsLoading(false);
    };
    loadData();
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

  const fetchLaundryVendors = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await axios.get("/api/laundry-vendors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vendorsData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setLaundryVendors(vendorsData);
    } catch (error) {
      console.error("Error fetching laundry vendors:", error);
      setLaundryVendors([]);
    }
  };

  const fetchOrders = async () => {
    const token = getAuthToken();
    if (!token) return;
    
    try {
      const response = await axios.get("/api/laundry/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ordersData = Array.isArray(response.data) ? response.data : response.data?.data || [];
      console.log('Fetched orders with vendor data:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
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
      fetchOrders();
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

  // Open return modal
  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setShowReturnModal(true);
  };

  // Handle return items
  const handleReturnItems = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    if (returnFormData.selectedItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    const loadingToast = toast.loading('Processing return...');
    try {
      const itemsWithQuantities = returnFormData.selectedItems.map(itemId => ({
        itemId,
        returnQuantity: returnFormData.itemQuantities[itemId] || 1
      }));

      await axios.post('/api/laundry/return-items', {
        orderId: selectedOrder._id,
        selectedItems: itemsWithQuantities,
        returnNote: returnFormData.returnNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchOrders();
      toast.success(`${returnFormData.selectedItems.length} item(s) returned successfully!`, { id: loadingToast });
      setShowReturnModal(false);
      setReturnFormData({ selectedItems: [], returnNote: '', itemQuantities: {} });
    } catch (error) {
      console.error('Error returning items:', error);
      toast.error(`Error returning items: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };

  // Report loss
  const handleSaveRate = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const loadingToast = toast.loading('Adding laundry rate...');
    try {
      await axios.post('/api/laundry-rates/add', rateFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Laundry rate added successfully!', { id: loadingToast });
      setShowRateForm(false);
      setRateFormData({
        category: 'gentlemen',
        serviceType: 'wash',
        itemName: '',
        rate: '',
        unit: 'piece'
      });
      fetchLaundryRates();
    } catch (error) {
      console.error('Error adding laundry rate:', error);
      toast.error(`Error adding rate: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };

  const handleReportLoss = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    if (lossFormData.selectedItems.length === 0 || !lossFormData.lossNote) {
      toast.error('Please select at least one item and enter loss note');
      return;
    }

    const loadingToast = toast.loading('Reporting loss...');
    try {
      // Create loss report
      await axios.post('/api/laundry/loss-report', {
        orderId: selectedOrder._id,
        selectedItems: lossFormData.selectedItems,
        lossNote: lossFormData.lossNote
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchOrders();
      toast.success(`Loss reported for ${lossFormData.selectedItems.length} item(s) successfully!`, { id: loadingToast });
      setShowLossModal(false);
      setLossFormData({ selectedItems: [], lossNote: '' });
    } catch (error) {
      console.error('Error reporting loss:', error);
      toast.error(`Error reporting loss: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };

  const openLossModal = (order) => {
    setSelectedOrder(order);
    setShowLossModal(true);
  };

  const handleShowInvoice = (order) => {
    const vendor = laundryVendors.find(v => v._id === (typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId));
    setInvoiceData({
      order,
      vendor,
      invoiceNumber: `LAUNDRY-INV-${Date.now()}`,
      date: new Date().toLocaleDateString()
    });
    setShowInvoice(true);
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
      if (filterOrderType !== "All" && order.orderType !== filterOrderType) return false;
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
      case "picked_up":
        return <span className={`${baseClass} bg-blue-100 text-blue-800`}>
          <Truck size={12} className="mr-1" /> Picked Up
        </span>;
      case "ready":
        return <span className={`${baseClass} bg-orange-100 text-orange-800`}>
          <CheckCircle size={12} className="mr-1" /> Ready
        </span>;
      case "delivered":
        return <span className={`${baseClass} bg-green-100 text-green-800`}>
          <CheckCircle size={12} className="mr-1" /> Delivered
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

  if (isLoading) {
    return <DashboardLoader pageName="Laundry Orders" />;
  }

  return (
    <div className="min-h-screen bg-background font-sans text-text p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-border">
        <h1 className="text-3xl font-extrabold text-text mb-4 sm:mb-0">
          Laundry Order Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAddOrder}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full shadow-lg text-white bg-primary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={18} className="mr-1 sm:mr-2" /> 
            <span className="hidden sm:inline">Add New Order</span>
            <span className="sm:hidden">Add Order</span>
          </button>
          <button
            onClick={() => setShowRateForm(true)}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full shadow-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-105"
          >
            <Plus size={18} className="mr-1 sm:mr-2" /> 
            <span className="hidden sm:inline">Add Laundry Rate</span>
            <span className="sm:hidden">Add Rate</span>
          </button>
        </div>
      </header>

      <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-border">
        {/* Filter Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex items-center">
              <Filter size={20} className="text-text mr-2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm text-text"
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
            <div className="flex items-center">
              <select
                value={filterOrderType}
                onChange={(e) => setFilterOrderType(e.target.value)}
                className="block px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm text-text"
              >
                <option value="All">All Types</option>
                <option value="room_laundry">Room Laundry</option>
                <option value="hotel_laundry">Hotel Laundry</option>
              </select>
            </div>
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm text-text"
              />
              <span className="text-sm text-text text-center sm:text-left">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border border-border rounded-md shadow-sm focus:ring-primary focus:border-primary text-sm text-text"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleDateFilter}
                className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-md hover:bg-hover transition-colors text-sm"
              >
                Filter by Date
              </button>
              
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  fetchOrders();
                }}
                className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
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
                    <th className="w-1/8 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Sr No
                    </th>

                    <th className="w-1/8 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Order Info
                    </th>
                    <th className="w-1/8 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="w-1/8 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Items
                    </th>
                    <th className="w-1/8 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-1/8 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="w-1/8 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="w-1/8 px-3 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-border">
                {filteredOrders.map((order, index) => (
                  <tr key={order._id} className="hover:bg-accent">
                    <td className="px-3 py-4">
                      <div className="text-sm font-medium text-text">
                        {index + 1}
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <div className="text-xs font-medium text-text mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          order.orderType === 'hotel_laundry' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.orderType === 'hotel_laundry' ? 'Hotel Laundry' : 'Room Laundry'}
                        </span>
                      </div>
                      {order.orderType === 'room_laundry' && (() => {
                        const booking = getBookingDetails(order.bookingId);
                        return (
                          <>
                            <div className="text-sm font-medium text-text">
                              {booking?.name || order.requestedByName || ''}
                            </div>
                            {(booking?.grcNo || order.grcNo) && (
                              <div className="text-xs text-text">
                                GRC: {booking?.grcNo || order.grcNo}
                              </div>
                            )}
                            <div className="text-xs text-text">
                              Room: {booking?.roomNumber || order.roomNumber || ''}
                            </div>
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-4">
                      <div className="text-sm text-text">
                        {order.vendorId?.vendorName || 'No Vendor'}
                      </div>
                      {order.vendorId?.phoneNumber && (
                        <div className="text-xs text-text">
                          {order.vendorId.phoneNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm text-text max-w-xs">
                      <div className="space-y-1">
                        {order.items?.map((item, index) => (
                          <div key={index} className="text-xs">
                            <div className="font-medium">
                              {item.quantity}x {item.itemName}
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-green-600">₹{item.calculatedAmount}</span>
                              <div className="flex items-center gap-1">
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
                                {item.damageReported && (
                                  <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded flex items-center" title="Damage Reported">
                                    <AlertTriangle size={10} />
                                  </span>
                                )}
                              </div>
                            </div>
                            {item.deliveredQuantity > 0 && (
                              <div className="text-xs text-blue-600">Delivered: {item.deliveredQuantity}</div>
                            )}
                            {item.damageReported && (
                              <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                                <AlertTriangle size={10} /> Damage Reported
                              </div>
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
                      <div className="font-medium">₹{order.totalAmount?.toFixed(2)}</div>
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
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="flex-1 px-1 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleShowInvoice(order)}
                            className="flex-1 px-1 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                          >
                            Invoice
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openReturnModal(order)}
                            className="flex-1 px-1 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Return
                          </button>
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="flex-1 px-1 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                          >
                            Cancel
                          </button>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openLossModal(order)}
                            className="flex-1 px-1 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          >
                            Loss
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="flex-1 px-1 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                        {order.vendorId?.UpiID && (
                          <button
                            onClick={() => {
                              const upiUrl = `upi://pay?pa=${order.vendorId.UpiID}&pn=${encodeURIComponent(order.vendorId.vendorName)}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent(`Laundry Order ${order._id.slice(-6)}`)}`;;
                              window.open(upiUrl, '_blank');
                            }}
                            className="w-full px-1 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filteredOrders.map((order, index) => (
              <div key={order._id} className="bg-accent p-4 rounded-lg border border-border">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xs font-medium text-text mb-1">
                      Sr No: {index + 1}
                    </div>
                    <div className="mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        order.orderType === 'hotel_laundry' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {order.orderType === 'hotel_laundry' ? 'Hotel Laundry' : 'Room Laundry'}
                      </span>
                    </div>
                    {order.orderType === 'room_laundry' && (
                      <>
                        {order.requestedByName && <h3 className="font-medium text-text">{order.requestedByName}</h3>}
                        {order.roomNumber && <p className="text-sm text-text">Room {order.roomNumber}</p>}
                        {order.grcNo && <p className="text-xs text-text">GRC: {order.grcNo}</p>}
                      </>
                    )}
                    {order.vendorId && (
                      <div className="mt-1">
                        <p className="text-xs text-text">Vendor: {order.vendorId.vendorName}</p>
                      </div>
                    )}
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
                        <div className="flex items-center gap-2">
                          <span className="text-text">
                            <span className="font-medium">{item.quantity}x</span> {item.itemName}
                          </span>
                          {item.damageReported && (
                            <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded flex items-center" title="Damage Reported">
                              <AlertTriangle size={10} />
                            </span>
                          )}
                        </div>
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
                    <div className="font-medium text-text">₹{order.totalAmount?.toFixed(2)}</div>
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
                <div className="flex flex-col gap-1 pt-3 border-t border-border text-xs">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="flex-1 px-1 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleShowInvoice(order)}
                      className="flex-1 px-1 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                    >
                      Invoice
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openReturnModal(order)}
                      className="flex-1 px-1 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Return
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order._id)}
                      className="flex-1 px-1 py-1 bg-orange-100 text-orange-800 rounded hover:bg-orange-200"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openLossModal(order)}
                      className="flex-1 px-1 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                    >
                      Loss
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="flex-1 px-1 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                  {order.vendorId?.UpiID && (
                    <button
                      onClick={() => {
                        const upiUrl = `upi://pay?pa=${order.vendorId.UpiID}&pn=${encodeURIComponent(order.vendorId.vendorName)}&am=${order.totalAmount}&cu=INR&tn=${encodeURIComponent(`Laundry Order ${order._id.slice(-6)}`)}`;;
                        window.open(upiUrl, '_blank');
                      }}
                      className="w-full px-1 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                    >
                      Pay Now
                    </button>
                  )}
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

      {showRateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Laundry Rate</h2>
            <form onSubmit={handleSaveRate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={rateFormData.category}
                  onChange={(e) => setRateFormData({...rateFormData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="gentlemen">Gentlemen</option>
                  <option value="ladies">Ladies</option>
                  <option value="Hotel Laundry">Hotel Laundry</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                <select
                  value={rateFormData.serviceType}
                  onChange={(e) => setRateFormData({...rateFormData, serviceType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="wash">Wash</option>
                  <option value="dry_clean">Dry Clean</option>
                  <option value="press">Press</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={rateFormData.itemName}
                  onChange={(e) => setRateFormData({...rateFormData, itemName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate</label>
                <input
                  type="number"
                  value={rateFormData.rate}
                  onChange={(e) => setRateFormData({...rateFormData, rate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter rate"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={rateFormData.unit}
                  onChange={(e) => setRateFormData({...rateFormData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="piece">Piece</option>
                  <option value="pair">Pair</option>
                  <option value="set">Set</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Rate
                </button>
                <button
                  type="button"
                  onClick={() => setShowRateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loss Modal */}
      {showLossModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Report Item Loss</h2>
              <button
                onClick={() => {
                  setShowLossModal(false);
                  setLossFormData({ selectedItems: [], lossNote: '' });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Items</label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {selectedOrder.items?.map((item) => (
                    <label key={item._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lossFormData.selectedItems.includes(item._id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newSelectedItems = isChecked
                            ? [...lossFormData.selectedItems, item._id]
                            : lossFormData.selectedItems.filter(id => id !== item._id);
                          setLossFormData({...lossFormData, selectedItems: newSelectedItems});
                        }}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm">
                        {item.quantity}x {item.itemName} - ₹{item.calculatedAmount}
                      </span>
                    </label>
                  ))}
                </div>
                {lossFormData.selectedItems.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {lossFormData.selectedItems.length} item(s) selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loss Note</label>
                <textarea
                  value={lossFormData.lossNote}
                  onChange={(e) => setLossFormData({...lossFormData, lossNote: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows="3"
                  placeholder="Describe the reason for loss..."
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReportLoss}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Report Loss
                </button>
                <button
                  onClick={() => {
                    setShowLossModal(false);
                    setLossFormData({ selectedItems: [], lossNote: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Return Items</h2>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnFormData({ selectedItems: [], returnNote: '', itemQuantities: {} });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Items to Return</label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={returnFormData.selectedItems.includes(item._id)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          const newSelectedItems = isChecked
                            ? [...returnFormData.selectedItems, item._id]
                            : returnFormData.selectedItems.filter(id => id !== item._id);
                          const newQuantities = {...returnFormData.itemQuantities};
                          if (isChecked) {
                            newQuantities[item._id] = item.quantity;
                          } else {
                            delete newQuantities[item._id];
                          }
                          setReturnFormData({...returnFormData, selectedItems: newSelectedItems, itemQuantities: newQuantities});
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm">
                          {item.itemName} - ₹{item.calculatedAmount}
                        </span>
                        <div className="text-xs text-gray-500">Available: {item.quantity}</div>
                      </div>
                      {returnFormData.selectedItems.includes(item._id) && (
                        <input
                          type="number"
                          min="1"
                          max={item.quantity}
                          value={returnFormData.itemQuantities[item._id] || item.quantity}
                          onChange={(e) => {
                            const quantity = Math.min(Math.max(1, parseInt(e.target.value) || 1), item.quantity);
                            setReturnFormData({
                              ...returnFormData,
                              itemQuantities: {...returnFormData.itemQuantities, [item._id]: quantity}
                            });
                          }}
                          className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                          placeholder="Qty"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {returnFormData.selectedItems.length > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {returnFormData.selectedItems.length} item(s) selected
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Return Note</label>
                <textarea
                  value={returnFormData.returnNote}
                  onChange={(e) => setReturnFormData({...returnFormData, returnNote: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Reason for return (optional)..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleReturnItems}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  Return Items
                </button>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnFormData({ selectedItems: [], returnNote: '', itemQuantities: {} });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInvoice && invoiceData && (
        <LaundryInvoice
          invoiceData={invoiceData}
          onClose={() => setShowInvoice(false)}
          vendors={laundryVendors}
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
