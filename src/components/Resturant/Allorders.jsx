import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import Pagination from '../common/Pagination';

const AllBookings = ({ setActiveTab }) => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [transferForm, setTransferForm] = useState({ orderId: '', newTable: '' });
  const [addItemsForm, setAddItemsForm] = useState({ orderId: '', itemId: '' });
  const [tables, setTables] = useState([]);
  const [items, setItems] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [couponForm, setCouponForm] = useState({ orderId: '', couponCode: '', isLoyalty: false, membership: '' });
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ orderId: '', amount: '', method: 'cash' });
  const [bills, setBills] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [userRole, setUserRole] = useState(null);
  const [userRestaurantRole, setUserRestaurantRole] = useState(null);

  useEffect(() => {
    fetchUserRole();
    fetchBookings();
    fetchTables();
    fetchItems();
    fetchCoupons();
    fetchBills();
    
    // Auto-refresh bookings every 30 seconds to sync with KOT updates
    const interval = setInterval(fetchBookings, 30000);
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/restaurant-orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/restaurant/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tablesData = Array.isArray(response.data) ? response.data : (response.data.tables || []);
      setTables(tablesData);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/items/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/coupons/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched coupons:', response.data);
      
      // Handle different response structures
      let couponsData = [];
      if (Array.isArray(response.data)) {
        couponsData = response.data;
      } else if (response.data.coupon) {
        couponsData = [response.data.coupon];
      } else if (response.data.coupons) {
        couponsData = response.data.coupons;
      }
      
      setCoupons(couponsData);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
    }
  };

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bills/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBills(response.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
    }
  };

  const applyCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/coupons/apply', {
        orderId: couponForm.orderId,
        couponCode: couponForm.couponCode,
        isLoyalty: couponForm.isLoyalty,
        membership: couponForm.membership
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.success('Coupon applied successfully!');
      setCouponForm({ orderId: '', couponCode: '', isLoyalty: false, membership: '' });
      fetchBookings();
    } catch (error) {
      console.error('Error applying coupon:', error);
      showToast.error('Failed to apply coupon');
    }
  };

  const searchBookings = async (query) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/search/field', {
        headers: { Authorization: `Bearer ${token}` },
        params: { model: 'restaurant-orders', field: 'customerName', value: query }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Error searching bookings:', error);
    }
  };

  const viewDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/restaurant-orders/details/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.info('Order details loaded');
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const processPayment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Create bill
      const billResponse = await axios.post('/api/bills/create', {
        orderId: paymentForm.orderId,
        discount: 0,
        tax: 0,
        paymentMethod: paymentForm.method
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Process payment
      await axios.patch(`/api/bills/${billResponse.data._id}/payment`, {
        paidAmount: parseFloat(paymentForm.amount),
        paymentMethod: paymentForm.method
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update order status to paid
      await axios.patch(`/api/restaurant-orders/${paymentForm.orderId}/status`, {
        status: 'paid'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      showToast.success('Payment processed successfully!');
      setPaymentForm({ orderId: '', amount: '', method: 'cash' });
      await fetchBills();
      await fetchBookings();
      
      // Generate invoice automatically
      // generateInvoice(paymentForm.orderId);
    } catch (error) {
      console.error('Error processing payment:', error);
      showToast.error('Failed to process payment');
    }
  };

  const generateInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch order details for invoice
      const response = await axios.get(`/api/restaurant-orders/details/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const orderData = response.data;
      
      // Transform restaurant order data to match invoice format
      const invoiceData = {
        clientDetails: {
          name: orderData.customerName || 'Guest',
          address: orderData.address || 'N/A',
          city: orderData.city || 'N/A',
          company: orderData.company || 'N/A',
          mobileNo: orderData.phoneNumber || 'N/A',
          gstin: orderData.gstin || 'N/A'
        },
        invoiceDetails: {
          billNo: `REST-${orderId.slice(-6)}`,
          billDate: new Date().toLocaleDateString(),
          grcNo: `GRC-${orderId.slice(-6)}`,
          roomNo: `Table ${orderData.tableNo || 'N/A'}`,
          roomType: 'Restaurant',
          pax: orderData.pax || 1,
          adult: orderData.adult || 1,
          checkInDate: new Date().toLocaleDateString(),
          checkOutDate: new Date().toLocaleDateString()
        },
        items: orderData.items?.map((item, index) => ({
          date: new Date().toLocaleDateString(),
          particulars: typeof item === 'string' ? item : (item.name || item.itemName || 'Unknown Item'),
          pax: 1,
          declaredRate: typeof item === 'object' ? (item.price || item.Price || 0) : 0,
          hsn: '996331',
          rate: 12,
          cgstRate: typeof item === 'object' ? ((item.price || item.Price || 0) * 0.06) : 0,
          sgstRate: typeof item === 'object' ? ((item.price || item.Price || 0) * 0.06) : 0,
          amount: typeof item === 'object' ? (item.price || item.Price || 0) : 0
        })) || [],
        taxes: [{
          taxableAmount: orderData.amount || orderData.advancePayment || 0,
          cgst: (orderData.amount || orderData.advancePayment || 0) * 0.06,
          sgst: (orderData.amount || orderData.advancePayment || 0) * 0.06,
          amount: orderData.amount || orderData.advancePayment || 0
        }],
        payment: {
          taxableAmount: orderData.amount || orderData.advancePayment || 0,
          cgst: (orderData.amount || orderData.advancePayment || 0) * 0.06,
          sgst: (orderData.amount || orderData.advancePayment || 0) * 0.06,
          total: (orderData.amount || orderData.advancePayment || 0) * 1.12
        },
        otherCharges: [
          {
            particulars: 'Service Charge',
            amount: 0
          }
        ]
      };
      
      // Navigate to Invoice component with data
      navigate('/invoice', {
        state: {
          bookingData: orderData,
          checkoutId: orderId
        }
      });
      
      showToast.success('Generating invoice...');
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      showToast.error('Failed to generate invoice');
    }
  };



  const transferTable = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/restaurant-orders/${transferForm.orderId}/transfer-table`, {
        newTableNo: transferForm.newTable,
        reason: 'Customer request'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.success('Table transferred successfully!');
      setTransferForm({ orderId: '', newTable: '' });
      fetchBookings();
    } catch (error) {
      console.error('Error transferring table:', error);
      showToast.error('Failed to transfer table');
    }
  };

  const addItems = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const selectedItem = items.find(item => item._id === addItemsForm.itemId);
      if (!selectedItem) {
        showToast.error('Please select a valid item');
        return;
      }
      
      const currentOrder = bookings.find(b => b._id === addItemsForm.orderId);
      
      await axios.post('/api/items/add', {
        orderId: addItemsForm.orderId,
        name: selectedItem.name,
        category: selectedItem.category,
        Price: selectedItem.Price
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Send notification to kitchen staff
      try {
        await axios.post('/api/notifications/create', {
          title: 'New Item Added',
          message: `${selectedItem.name} added to Table ${currentOrder?.tableNo || 'N/A'} - Order ${addItemsForm.orderId.slice(-6)}`,
          type: 'kitchen',
          priority: 'normal',
          department: 'kitchen'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (notifError) {
        console.error('Notification failed:', notifError);
      }
      
      // Update local state immediately
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === addItemsForm.orderId 
            ? { ...booking, items: [...(booking.items || []), selectedItem] }
            : booking
        )
      );
      
      showToast.success('Item added successfully!');
      setAddItemsForm({ orderId: '', itemId: '' });
    } catch (error) {
      console.error('Error adding items:', error);
      showToast.error('Failed to add items');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchBookings(searchQuery);
    } else {
      fetchBookings();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'served': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'served',
      'served': 'completed'
    };
    return statusFlow[currentStatus];
  };

  const getStatusNotification = (status) => {
    const notifications = {
      'pending': '📋 Order received - Kitchen assignment needed',
      'preparing': '👨‍🍳 Kitchen preparing order - Monitor cooking progress',
      'ready': '🔔 Order ready - Notify server for pickup',
      'served': '✅ Order served - Check customer satisfaction',
      'completed': '🎉 Order completed - Process payment',
      'cancelled': '❌ Order cancelled - Notify customer'
    };
    return notifications[status] || 'Status updated';
  };

  const updateOrderStatusWithNotification = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/restaurant-orders/${bookingId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const notification = getStatusNotification(newStatus);
      showToast.success(`Status Updated! ${notification}`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating status:', error);
      showToast.error('Failed to update status');
    }
  };

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  const canCompleteOrder = () => {
    return userRole === 'restaurant' && userRestaurantRole === 'cashier';
  };

  const updateOrderStatusWithRoleCheck = async (bookingId, newStatus) => {
    // Check if trying to mark as completed
    if (newStatus === 'completed' && !canCompleteOrder()) {
      showToast.error('Only cashiers can mark orders as completed!');
      return;
    }
    
    // Proceed with normal status update
    await updateOrderStatusWithNotification(bookingId, newStatus);
  };

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-text">All Bookings</h2>
        </div>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings..."
              className="flex-1 p-2 border border-border rounded bg-white text-text focus:border-primary focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="bg-primary text-text px-4 py-2 rounded hover:bg-hover transition-colors whitespace-nowrap text-sm"
            >
              Search
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-text text-sm sm:text-base">Transfer Table</h3>
            <form onSubmit={transferTable} className="flex flex-col gap-2">
              <select
                value={transferForm.orderId}
                onChange={(e) => setTransferForm({...transferForm, orderId: e.target.value})}
                className="p-2 border border-border rounded text-sm"
                style={{ appearance: 'menulist', WebkitAppearance: 'menulist' }}
                required
              >
                <option value="">Select Order</option>
                {bookings.map(booking => (
                  <option key={booking._id} value={booking._id}>
                    Order {booking._id.slice(-6)} - Table {booking.tableNo}
                  </option>
                ))}
              </select>
              {transferForm.orderId && (
                <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                  {(() => {
                    const selectedBooking = bookings.find(b => b._id === transferForm.orderId);
                    return selectedBooking ? (
                      <div>
                        <div className="font-semibold">Current: Table {selectedBooking.tableNo}</div>
                        <div className="text-xs mt-1">
                          Items: {selectedBooking.items?.length || 0} | Amount: ${selectedBooking.amount || 0} | Status: {selectedBooking.status || 'N/A'}
                        </div>
                        {selectedBooking.items && selectedBooking.items.length > 0 && (
                          <div className="text-xs mt-1 text-gray-600">
                            Items: {selectedBooking.items.map(item => {
                              if (typeof item === 'string') return item;
                              return item.name || item.itemName || 'Unknown Item';
                            }).join(', ')}
                          </div>
                        )}
                      </div>
                    ) : null;
                  })()
                  }
                </div>
              )}
              <div className="flex gap-2">
                <select
                  value={transferForm.newTable}
                  onChange={(e) => setTransferForm({...transferForm, newTable: e.target.value})}
                  className="flex-1 p-2 border border-border rounded text-sm"
                  style={{ appearance: 'menulist', WebkitAppearance: 'menulist' }}
                  required
                >
                  <option value="">Select New Table</option>
                  {tables.map(table => (
                    <option key={table._id} value={table.tableNumber}>
                      Table {table.tableNumber}
                    </option>
                  ))}
                </select>
                <button type="submit" className="bg-secondary text-text px-4 py-2 rounded hover:bg-hover text-sm whitespace-nowrap">
                  Transfer
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-text text-sm sm:text-base">Add Items</h3>
            <form onSubmit={addItems} className="flex flex-col gap-2">
              {addItemsForm.orderId && (
                <div className="p-2 bg-gray-100 rounded text-sm text-gray-700">
                  {(() => {
                    const selectedBooking = bookings.find(b => b._id === addItemsForm.orderId);
                    return selectedBooking ? (
                      <div>
                        <div className="font-semibold">Order {addItemsForm.orderId.slice(-6)} - Table {selectedBooking.tableNo}</div>
                        <div className="text-xs mt-1">
                          Current Items: {selectedBooking.items?.length || 0} items | Amount: ${selectedBooking.amount || 0}
                        </div>
                        {selectedBooking.items && selectedBooking.items.length > 0 && (
                          <div className="text-xs mt-1 text-gray-600">
                            Items: {selectedBooking.items.map(item => {
                              if (typeof item === 'string') return item;
                              return item.name || item.itemName || 'Unknown Item';
                            }).join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>Selected: Order {addItemsForm.orderId.slice(-6)}</div>
                    );
                  })()
                  }
                </div>
              )}
              <select
                value={addItemsForm.itemId}
                onChange={(e) => setAddItemsForm({...addItemsForm, itemId: e.target.value})}
                className="p-2 border border-border rounded text-sm"
                style={{ appearance: 'menulist', WebkitAppearance: 'menulist' }}
                required
              >
                <option value="">Select Item</option>
                {items.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name} - {item.category} - ${item.Price}
                  </option>
                ))}
              </select>
              <button 
                type="submit" 
                className="bg-secondary text-text px-4 py-2 rounded hover:bg-hover text-sm"
                disabled={!addItemsForm.orderId}
              >
                Add Item
              </button>
            </form>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-text text-sm sm:text-base">Apply Coupon</h3>
            <form onSubmit={applyCoupon} className="flex flex-col gap-2">
              <select
                value={couponForm.orderId}
                onChange={(e) => setCouponForm({...couponForm, orderId: e.target.value})}
                className="p-2 border border-border rounded text-sm"
                style={{ appearance: 'menulist', WebkitAppearance: 'menulist' }}
                required
              >
                <option value="">Select Order</option>
                {bookings.map(booking => (
                  <option key={booking._id} value={booking._id}>
                    Order {booking._id.slice(-6)} - Table {booking.tableNo}
                  </option>
                ))}
              </select>
              <select
                value={couponForm.couponCode}
                onChange={(e) => setCouponForm({...couponForm, couponCode: e.target.value})}
                className="p-2 border border-border rounded text-sm"
                style={{ appearance: 'menulist', WebkitAppearance: 'menulist' }}
                required
              >
                <option value="">Select Coupon ({coupons.length} available)</option>
                {coupons.length > 0 ? coupons.map(coupon => (
                  <option key={coupon._id || coupon.id} value={coupon.code || coupon.couponCode}>
                    {coupon.code || coupon.couponCode || 'No Code'} - {coupon.discount || coupon.discountPercent || 0}% off
                  </option>
                )) : (
                  <option disabled>No coupons available</option>
                )}
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isLoyalty"
                  checked={couponForm.isLoyalty}
                  onChange={(e) => setCouponForm({...couponForm, isLoyalty: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="isLoyalty" className="text-sm">Loyalty Member</label>
              </div>
              <input
                type="text"
                placeholder="Membership ID (optional)"
                value={couponForm.membership}
                onChange={(e) => setCouponForm({...couponForm, membership: e.target.value})}
                className="p-2 border border-border rounded text-sm"
              />
              <button type="submit" className="bg-accent text-text px-4 py-2 rounded hover:bg-hover text-sm">
                Apply Coupon
              </button>
            </form>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-3 text-text text-sm sm:text-base">Process Payment</h3>
            <form onSubmit={processPayment} className="flex flex-col gap-2">
              <select
                value={paymentForm.orderId}
                onChange={(e) => {
                  const selectedBooking = bookings.find(b => b._id === e.target.value);
                  const amount = selectedBooking ? (selectedBooking.amount || selectedBooking.advancePayment || 0) : '';
                  setPaymentForm({...paymentForm, orderId: e.target.value, amount: amount.toString()});
                }}
                className="p-2 border border-border rounded text-sm"
                style={{ appearance: 'menulist', WebkitAppearance: 'menulist' }}
                required
              >
                <option value="">Select Order</option>
                {bookings.filter(b => {
                  const bill = bills.find(bill => bill.orderId === b._id);
                  return (!bill || bill.paymentStatus !== 'paid');
                }).map(booking => (
                  <option key={booking._id} value={booking._id}>
                    {booking._id.slice(-6)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Payment Amount"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                className="p-2 border border-border rounded text-sm"
                required
              />
              <select
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({...paymentForm, method: e.target.value})}
                className="p-2 border border-border rounded text-sm"
                style={{ appearance: 'menulist', WebkitAppearance: 'menulist' }}
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
              </select>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm">
                Process Payment
              </button>
            </form>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-2 sm:px-4 py-3 text-left text-text font-semibold text-xs sm:text-sm">Order ID</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-text font-semibold text-xs sm:text-sm">Staff</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-text font-semibold text-xs sm:text-sm">Phone</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-text font-semibold text-xs sm:text-sm">Table</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-text font-semibold text-xs sm:text-sm">Items</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-text font-semibold text-xs sm:text-sm">Advance Payment</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-text font-semibold text-xs sm:text-sm">Status</th>
                  <th className="px-2 sm:px-4 py-3 text-left text-text font-semibold text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking, index) => (
                  <tr key={booking._id} className={index % 2 === 0 ? 'bg-background' : 'bg-white'}>
                    <td className="px-2 sm:px-4 py-3 text-text text-xs sm:text-sm font-mono">
                      <div className="font-semibold">{booking._id.slice(-6)}</div>
                      <div className="text-xs text-gray-500">{booking.customerName || 'Guest'}</div>
                    </td>
                    <td className="px-2 sm:px-4 py-3 text-text text-xs sm:text-sm">{booking.staffName || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-3 text-text text-xs sm:text-sm">{booking.phoneNumber || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-3 text-text text-xs sm:text-sm">{booking.tableNo || 'N/A'}</td>
                    <td className="px-2 sm:px-4 py-3 text-text text-xs sm:text-sm">{booking.items?.length || 0} items</td>
                    <td className="px-2 sm:px-4 py-3 text-text text-xs sm:text-sm">₹{booking.advancePayment || 0}</td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(booking.status || 'pending')}`}>
                          {booking.status || 'pending'}
                        </span>
                        {getNextStatus(booking.status) && booking.status !== 'completed' && booking.status !== 'cancelled' && (
                          getNextStatus(booking.status) === 'completed' ? (
                            canCompleteOrder() ? (
                              <button
                                onClick={() => updateOrderStatusWithRoleCheck(booking._id, getNextStatus(booking.status))}
                                className="bg-primary text-white px-2 py-1 rounded text-xs hover:bg-hover transition-colors"
                              >
                                → {getNextStatus(booking.status)}
                              </button>
                            ) : (
                              <button
                                disabled
                                className="bg-gray-300 text-gray-500 px-2 py-1 rounded text-xs cursor-not-allowed"
                                title="Only cashiers can complete orders"
                              >
                                → {getNextStatus(booking.status)}
                              </button>
                            )
                          ) : (
                            <button
                              onClick={() => updateOrderStatusWithNotification(booking._id, getNextStatus(booking.status))}
                              className="bg-primary text-white px-2 py-1 rounded text-xs hover:bg-hover transition-colors"
                            >
                              → {getNextStatus(booking.status)}
                            </button>
                          )
                        )}
                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            onClick={() => updateOrderStatusWithNotification(booking._id, 'cancelled')}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-3">
                      <div className="flex flex-col sm:flex-row gap-1">
                        <button
                          onClick={() => viewDetails(booking._id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 whitespace-nowrap"
                        >
                          View
                        </button>
                        {booking.status === 'completed' ? (
                          <button
                            onClick={() => setPaymentForm({...paymentForm, orderId: booking._id, amount: (booking.amount || booking.advancePayment || 0).toString()})}
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600 whitespace-nowrap"
                          >
                            Pay Now
                          </button>
                        ) : booking.status === 'paid' ? (
                          <button
                            onClick={() => generateInvoice(booking._id)}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 whitespace-nowrap"
                          >
                            Invoice
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setAddItemsForm({orderId: booking._id, itemId: ''})}
                              className="bg-purple-500 text-white px-2 py-1 rounded text-xs hover:bg-purple-600 whitespace-nowrap"
                            >
                              Add Items
                            </button>
                            <button
                              onClick={() => setTransferForm({...transferForm, orderId: booking._id})}
                              className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600 whitespace-nowrap"
                            >
                              Transfer
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {paginatedBookings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No bookings found.
            </div>
          )}
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={bookings.length}
        />
      </div>
    </div>
  );
};

export default AllBookings;