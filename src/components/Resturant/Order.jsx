import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import { useSocket } from '../../context/SocketContext';

const Order = () => {
  const { axios } = useAppContext();
  const { socket } = useSocket();
  const [menuItems, setMenuItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [itemToNote, setItemToNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInHouse, setIsInHouse] = useState(false);
  const [orderData, setOrderData] = useState({
    staffName: '',
    staffId: '',
    phoneNumber: '',
    tableNo: '',
    bookingId: '',
    grcNo: '',
    roomNumber: '',
    guestName: '',
    guestPhone: '',
    items: [],
    amount: 0
  });
  


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch items (usually works without auth)
      try {
        const itemsRes = await axios.get('/api/items/all');
        const itemsData = Array.isArray(itemsRes.data) ? itemsRes.data : (itemsRes.data.items || []);
        setMenuItems(itemsData);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
      
      // Fetch bookings
      try {
        const bookingsRes = await axios.get('/api/bookings/all');
        const bookingsData = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.bookings || []);
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
      
      // Fetch staff with fallback
      try {
        const token = localStorage.getItem('token');
        const staffRes = await axios.get('/api/staff/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const staffData = Array.isArray(staffRes.data) ? staffRes.data : (staffRes.data.staff || []);
        
        // Format staff data to ensure consistent structure
        const formattedStaff = staffData.map(member => ({
          _id: member._id,
          name: member.userId?.username || member.username || member.name || 'Staff Member',
          username: member.userId?.username || member.username || member.name || 'Staff Member',
          department: Array.isArray(member.department) 
            ? member.department.map(dept => dept.name).join(', ') 
            : (member.department?.name || member.department || 'General'),
          restaurantRole: 'staff'
        }));
        
        setStaff(formattedStaff);
        console.log('Staff loaded:', formattedStaff);
      } catch (error) {
        console.error('Error fetching staff:', error);
        // Set fallback staff data
        setStaff([
          { _id: 'staff1', name: 'Staff Member 1', username: 'Staff Member 1', department: 'General', restaurantRole: 'staff' },
          { _id: 'staff2', name: 'Staff Member 2', username: 'Staff Member 2', department: 'General', restaurantRole: 'staff' }
        ]);
      }
      
      // Fetch tables with fallback
      try {
        const token = localStorage.getItem('token');
        const tablesRes = await axios.get('/api/restaurant/tables', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const tablesData = Array.isArray(tablesRes.data) ? tablesRes.data : (tablesRes.data.tables || []);
        
        // Format tables data to ensure consistent structure
        const formattedTables = tablesData.map(table => ({
          _id: table._id,
          tableNumber: table.tableNumber || table.number || table.table_number,
          status: table.status || 'available'
        }));
        
        setTables(formattedTables);
        console.log('Tables loaded:', formattedTables);
      } catch (error) {
        console.error('Error fetching tables:', error);
        // Set fallback tables data
        setTables([
          { _id: 'table1', tableNumber: '1', status: 'available' },
          { _id: 'table2', tableNumber: '2', status: 'available' },
          { _id: 'table3', tableNumber: '3', status: 'available' },
          { _id: 'table4', tableNumber: '4', status: 'available' },
          { _id: 'table5', tableNumber: '5', status: 'available' }
        ]);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Function to add an item to the cart or increment its quantity
  const handleAddToCart = (item) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i._id === item._id);
      if (existingItem) {
        // If item exists, update its quantity
        return prevItems.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        // If item is new, add it to the cart
        return [...prevItems, { ...item, quantity: 1, note: '' }];
      }
    });
  };

  // Function to remove an item from the cart
  const handleRemoveItem = (itemId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
  };

  // Function to update the quantity of an item in the cart
  const handleQuantityChange = (itemId, change) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === itemId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
      )
    );
  };

  // Function to open the note modal for a specific item
  const openNoteModal = (item) => {
    setItemToNote(item);
    setIsNoteOpen(true);
  };

  // Function to save a note for the current item and close the modal
  const handleSaveNote = (note) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === itemToNote._id ? { ...item, note: note } : item
      )
    );
    setIsNoteOpen(false);
    setItemToNote(null);
  };

  // Function to clear all items from the cart
  const handleClearCart = () => {
    setCartItems([]);
  };

  // Calculate total amount
  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      const price = item.Price || item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Function to place order
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      showToast.error('Please add items to cart first!');
      return;
    }
    
    if (!orderData.staffId || !orderData.tableNo) {
      showToast.error('Please fill in all required fields (Staff, Table)!');
      return;
    }
    
    if (isInHouse) {
      if (!orderData.bookingId) {
        showToast.error('Please select a booking for in-house order!');
        return;
      }
    } else {
      if (!orderData.phoneNumber.trim()) {
        showToast.error('Please enter phone number for regular order!');
        return;
      }
    }
    
    try {
      const token = localStorage.getItem('token');
      const orderItems = cartItems.map(item => ({
        itemId: item._id,
        quantity: item.quantity,
        note: item.note || ''
      }));
      
      const finalOrderData = {
        staffName: orderData.staffName,
        phoneNumber: orderData.phoneNumber,
        tableNo: orderData.tableNo,
        items: orderItems.map(item => {
          const cartItem = cartItems.find(ci => ci._id === item.itemId);
          return {
            itemId: item.itemId,
            quantity: item.quantity,
            price: cartItem?.Price || cartItem?.price || 0
          };
        }),
        notes: cartItems.map(item => item.note).filter(note => note).join(', ') || '',
        amount: getTotalAmount(),
        discount: 0,
        isMembership: false,
        isLoyalty: false,
        ...(isInHouse && {
          bookingId: orderData.bookingId,
          grcNo: orderData.grcNo,
          roomNumber: orderData.roomNumber,
          guestName: orderData.guestName,
          guestPhone: orderData.guestPhone
        })
      };
      
      console.log('Sending order data:', finalOrderData);
      
      const orderResponse = await axios.post('/api/restaurant-orders/create', finalOrderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // WebSocket notification is handled by backend
      

      
      showToast.success('🎉 Order placed successfully!');
      setCartItems([]);
      setOrderData({ staffName: '', staffId: '', phoneNumber: '', tableNo: '', bookingId: '', grcNo: '', roomNumber: '', guestName: '', guestPhone: '', items: [], amount: 0 });
      setIsInHouse(false);
      setIsCartOpen(false);
      
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      
      // Check if it's a status validation error and try without status field
      if (error.response?.data?.error?.includes('status') && error.response?.data?.error?.includes('enum')) {
        try {
          // Retry without any status-related fields
          const retryData = { ...finalOrderData };
          delete retryData.status;
          
          const retryResponse = await axios.post('/api/restaurant-orders/create', retryData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // WebSocket notification is handled by backend
          

          
          showToast.success('🎉 Order placed successfully!');
          setCartItems([]);
          setOrderData({ staffName: '', staffId: '', phoneNumber: '', tableNo: '', bookingId: '', grcNo: '', roomNumber: '', guestName: '', guestPhone: '', items: [], amount: 0 });
          setIsInHouse(false);
          setIsCartOpen(false);
          return;
        } catch (retryError) {
          console.error('Retry failed:', retryError);
        }
      }
      
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to place order!';
      showToast.error(errorMsg);
    }
  };

  // Filter menu items based on the search query
  const filteredMenu = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 bg-gradient-to-br from-[#f7f5ef] to-[#c3ad6b]/30">
      {/* Staff Notification */}
      {false && (
        <div className="fixed top-4 left-4 z-50 bg-[#c3ad6b] text-white p-4 rounded-lg shadow-lg animate-pulse max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="font-bold flex items-center">
                👨‍💼 Order Assigned!
              </h4>
              <p className="text-sm mt-1">
                Staff: {staffNotification.staffName}
              </p>
              <p className="text-xs opacity-90">
                Table {staffNotification.tableNo} - {staffNotification.itemCount} items
              </p>
              <p className="text-xs opacity-90">
                Order: {staffNotification.orderId?.slice(-6)}
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

      <div className="w-full bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-[#c3ad6b]/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            <label className="font-bold text-lg text-[#b39b5a]">Order Type:</label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="orderType"
                  checked={!isInHouse}
                  onChange={() => setIsInHouse(false)}
                  className="w-5 h-5 text-[#c3ad6b] focus:ring-[#c3ad6b] focus:ring-2"
                />
                <span className="text-base font-medium text-gray-700">Regular</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="orderType"
                  checked={isInHouse}
                  onChange={() => setIsInHouse(true)}
                  className="w-5 h-5 text-[#c3ad6b] focus:ring-[#c3ad6b] focus:ring-2"
                />
                <span className="text-base font-medium text-gray-700">In-House</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          <div className="flex flex-col space-y-3">
            <label htmlFor="table-number" className="font-bold text-[#b39b5a]">Table Number</label>
            <select 
              id="table-number" 
              value={orderData.tableNo}
              onChange={(e) => setOrderData({...orderData, tableNo: e.target.value})}
              className="w-full rounded-xl p-4 border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 bg-white/80 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">Select Table</option>
              {tables.map(table => (
                <option key={table._id} value={table.tableNumber}>
                  Table {table.tableNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-3">
            <label htmlFor="staff" className="font-bold text-[#b39b5a]">Staff</label>
            <select 
              id="staff" 
              value={orderData.staffId}
              onChange={(e) => {
                const selectedStaff = staff.find(s => s._id === e.target.value);
                setOrderData({...orderData, staffId: e.target.value, staffName: selectedStaff?.name || selectedStaff?.username || ''});
              }}
              className="w-full rounded-xl p-4 border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 bg-white/80 backdrop-blur-sm transition-all duration-200"
            >
              <option value="">Select Staff</option>
              {staff.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name || member.username || 'Unknown Staff'}
                </option>
              ))}
            </select>
          </div>
          {isInHouse ? (
            <div className="flex flex-col space-y-3">
              <label htmlFor="booking" className="font-bold text-[#b39b5a]">Booking</label>
              <select 
                id="booking" 
                value={orderData.bookingId}
                onChange={(e) => {
                  const selectedBooking = bookings.find(b => b._id === e.target.value);
                  if (selectedBooking) {
                    setOrderData({
                      ...orderData,
                      bookingId: e.target.value,
                      grcNo: selectedBooking.grcNo || '',
                      roomNumber: selectedBooking.roomNumber || '',
                      guestName: selectedBooking.name || '',
                      guestPhone: selectedBooking.mobileNo || '',
                      phoneNumber: selectedBooking.mobileNo || ''
                    });
                  }
                }}
                className="w-full rounded-xl p-4 border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 bg-white/80 backdrop-blur-sm transition-all duration-200"
              >
                <option value="">Select Booking ({bookings.length} available)</option>
                {bookings.map(booking => (
                  <option key={booking._id} value={booking._id}>
                    {booking.grcNo || 'No GRC'} - {booking.name || 'No Name'} (Room {booking.roomNumber || 'No Room'})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <label htmlFor="phone" className="font-bold text-[#b39b5a]">Phone</label>
              <input
                id="phone"
                type="tel"
                value={orderData.phoneNumber}
                onChange={(e) => setOrderData({...orderData, phoneNumber: e.target.value})}
                className="w-full rounded-xl p-4 border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-gray-700 bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Phone Number"
              />
            </div>
          )}
        </div>
        
        {isInHouse && orderData.bookingId && (
          <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-[#f7f5ef] to-[#c3ad6b]/20 border border-[#c3ad6b]/30">
            <h3 className="font-bold mb-4 text-lg text-[#b39b5a]">Guest Information:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[#b39b5a]">GRC:</span>
                <span className="text-gray-700">{orderData.grcNo}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[#b39b5a]">Room:</span>
                <span className="text-gray-700">{orderData.roomNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[#b39b5a]">Guest:</span>
                <span className="text-gray-700">{orderData.guestName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-[#b39b5a]">Phone:</span>
                <span className="text-gray-700">{orderData.guestPhone}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-6">
          <div className="relative">
            <button
              className="p-4 rounded-full shadow-xl bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white transition-all duration-300 transform hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#c3ad6b]/30"
              onClick={() => setIsCartOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.298.503 1.298H19.5a1 1 0 00.993-.883l.988-7.893z" />
              </svg>
            </button>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#b39b5a] to-[#c3ad6b] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Search bar section */}
      <div className="w-full bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-[#c3ad6b]/30">
        <label htmlFor="search-menu" className="block font-bold mb-4 text-lg text-[#b39b5a]">Search Menu</label>
        <div className="relative">
          <input
            id="search-menu"
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl pl-12 pr-4 py-4 border-2 border-[#c3ad6b]/30 focus:border-[#c3ad6b] focus:ring-2 focus:ring-[#c3ad6b]/20 text-gray-700 bg-white/80 backdrop-blur-sm transition-all duration-200 text-base"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-[#c3ad6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Menu grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {filteredMenu.map(item => (
          <div key={item._id} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-[#c3ad6b]/30 hover:border-[#c3ad6b] hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <h3 className="text-xl font-bold truncate text-[#b39b5a] mb-2">{item.name}</h3>
            <p className="text-sm mb-4 text-[#c3ad6b] font-medium">{item.category}</p>
            <p className="mb-4 font-bold text-lg text-gray-800">₹{(item.Price || item.price || 0).toFixed(2)}</p>

            {cartItems.some(i => i._id === item._id) ? (
              // If item is in cart, show the quantity controls
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <button
                    className="bg-border text-text w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-secondary transition-colors text-sm sm:text-base"
                    onClick={() => handleQuantityChange(item._id, -1)}
                  >
                    -
                  </button>
                  <span className="font-bold text-text text-sm sm:text-base min-w-[20px] text-center">
                    {cartItems.find(i => i._id === item._id)?.quantity}
                  </span>
                  <button
                    className="bg-primary text-background w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-hover transition-colors text-sm sm:text-base"
                    onClick={() => handleQuantityChange(item._id, 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-primary hover:text-hover transition-colors duration-200 text-xs sm:text-sm px-2 py-1 rounded"
                  onClick={() => handleRemoveItem(item._id)}
                >
                  Remove
                </button>
              </div>
            ) : (
              // If item is not in cart, show the "Add to Order" button
              <button
                className="w-full bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white py-3 rounded-xl font-bold hover:from-[#b39b5a] hover:to-[#c3ad6b] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                onClick={() => handleAddToCart(item)}
              >
                Add to Order
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-background bg-opacity-95 backdrop-blur-md rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg p-4 sm:p-6 relative border border-border max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-text mb-4 sm:mb-6">Your Cart</h2>
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-primary hover:text-hover transition-colors duration-200"
              onClick={() => setIsCartOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 sm:max-h-60 overflow-y-auto">
              {cartItems.map(item => (
                <div key={item._id} className="bg-accent rounded-lg p-3">
                  <div className="text-center">
                    <h3 className="font-semibold text-text text-xs sm:text-sm truncate">{item.name}</h3>
                    <p className="text-xs text-primary">{item.category}</p>
                    <p className="text-xs text-text">₹{(item.Price || item.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <button
                      className="bg-border text-text w-5 h-5 rounded-full flex items-center justify-center hover:bg-secondary transition-colors text-xs"
                      onClick={() => handleQuantityChange(item._id, -1)}
                    >
                      -
                    </button>
                    <span className="font-bold text-text text-sm w-6 text-center">{item.quantity}</span>
                    <button
                      className="bg-border text-text w-5 h-5 rounded-full flex items-center justify-center hover:bg-secondary transition-colors text-xs"
                      onClick={() => handleQuantityChange(item._id, 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-center space-x-1">
                    <input type="checkbox" id={`chargeable-${item._id}`} className="rounded text-primary focus:ring-2 focus:ring-primary" />
                    <label htmlFor={`chargeable-${item._id}`} className="text-xs text-text">Non-Chargeable</label>
                  </div>
                  {item.note && (
                    <p className="text-xs text-gray-500 italic mt-1 text-center truncate">Note: {item.note}</p>
                  )}
                </div>
              ))}
            </div>

            {cartItems.length > 0 && (
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="font-bold text-base sm:text-lg">Total: ₹{getTotalAmount().toFixed(2)}</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    className="w-full py-2 px-3 sm:px-4 rounded-md text-text bg-border font-semibold hover:bg-accent transition-colors duration-200 text-sm sm:text-base"
                    onClick={handleClearCart}
                  >
                    Clear All
                  </button>
                  <button
                    className="w-full py-2 px-3 sm:px-4 rounded-md text-text bg-secondary font-semibold hover:bg-accent transition-colors duration-200 text-sm sm:text-base"
                    onClick={() => openNoteModal(cartItems[0])}
                  >
                    Add Note
                  </button>
                  <button
                    className="w-full py-2 px-3 sm:px-4 rounded-md text-background bg-primary font-semibold hover:bg-hover transition-colors duration-200 text-sm sm:text-base"
                    onClick={handlePlaceOrder}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteOpen && itemToNote && (
        <div className="fixed inset-0 bg-text/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm p-4 sm:p-6 relative">
            <h2 className="text-lg sm:text-xl font-bold text-center text-text mb-3 sm:mb-4">Add Your Note</h2>
            <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
              {['Half', 'Dry', 'Gravy', 'Full'].map(option => (
                <button
                  key={option}
                  className="px-2 sm:px-4 py-1 sm:py-2 rounded-full border border-border text-text text-xs sm:text-sm hover:bg-accent transition-colors duration-200"
                >
                  {option}
                </button>
              ))}
            </div>
            <textarea
              className="w-full h-20 sm:h-24 p-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary text-text text-sm bg-background"
              placeholder="Write your notes here..."
              defaultValue={itemToNote.note}
              id="note-text-area"
            />
            <div className="mt-4 sm:mt-6 flex justify-end">
              <button
                className="py-2 px-4 sm:px-6 rounded-md text-text bg-border font-semibold hover:bg-accent transition-colors duration-200 text-sm sm:text-base"
                onClick={() => handleSaveNote(document.getElementById('note-text-area').value)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
