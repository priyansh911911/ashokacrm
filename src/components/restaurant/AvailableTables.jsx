import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import { Users, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AvailableTables = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [selectedOrderForItems, setSelectedOrderForItems] = useState(null);
  const [addItemsForm, setAddItemsForm] = useState({ orderId: '', itemId: '' });
  const [items, setItems] = useState([]);
  const [tableAmounts, setTableAmounts] = useState({});
  const [tableStartTimes, setTableStartTimes] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [roomServiceOrders, setRoomServiceOrders] = useState([]);
  const [bookedRooms, setBookedRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [categories, setCategories] = useState([]);


  useEffect(() => {
    fetchTables();
    fetchItems();
    fetchTableAmounts();
    fetchRoomServiceOrders();
    fetchBookedRooms();
    fetchAllRooms();
    fetchCategories();
    
    // Update timer every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast.error('Please login again');
        return;
      }
      const response = await axios.get('/api/restaurant/tables', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tablesData = Array.isArray(response.data) ? response.data : (response.data.tables || []);
      setTables(tablesData.filter(table => table.isActive));
    } catch (error) {
      console.error('Error fetching tables:', error);
      if (error.response?.status === 401 || error.response?.data?.message === 'Invalid token') {
        localStorage.removeItem('token');
        showToast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    } finally {
      setIsLoading(false);
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

  const fetchTableAmounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/restaurant-orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const amounts = {};
      const startTimes = {};
      
      response.data.forEach(order => {
        if (order.tableNo && order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'paid') {
          if (!amounts[order.tableNo]) {
            amounts[order.tableNo] = 0;
            // Use the earliest order time as start time for the table
            startTimes[order.tableNo] = new Date(order.createdAt);
          } else {
            // Keep the earliest start time
            const orderTime = new Date(order.createdAt);
            if (orderTime < startTimes[order.tableNo]) {
              startTimes[order.tableNo] = orderTime;
            }
          }
          
          // Calculate amount from items
          let orderAmount = 0;
          if (order.allKotItems) {
            orderAmount = order.allKotItems.reduce((sum, item) => {
              const itemPrice = item.price || item.Price || 0;
              const itemQuantity = item.quantity || 1;
              return sum + (itemPrice * itemQuantity);
            }, 0);
          } else if (order.items) {
            orderAmount = order.items.reduce((sum, item) => {
              const itemPrice = item.price || item.Price || 0;
              const itemQuantity = item.quantity || 1;
              return sum + (itemPrice * itemQuantity);
            }, 0);
          }
          
          amounts[order.tableNo] += orderAmount;
        }
      });
      
      setTableAmounts(amounts);
      setTableStartTimes(startTimes);
    } catch (error) {
      console.error('Error fetching table amounts:', error);
    }
  };

  const fetchRoomServiceOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('/api/room-service/orders?status=pending&status=confirmed&status=preparing&status=ready', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setRoomServiceOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching room service orders:', error);
    }
  };

  const fetchBookedRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bookedRooms = response.data.filter(booking => 
        (booking.status === 'Confirmed' || booking.status === 'Booked' || booking.status === 'CheckedIn') && booking.isActive
      );
      
      setBookedRooms(bookedRooms);
    } catch (error) {
      console.error('Error fetching booked rooms:', error);
    }
  };

  const fetchAllRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('/api/rooms/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAllRooms(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching all rooms:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('/api/categories/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
      
      await axios.post('/api/items/add', {
        orderId: addItemsForm.orderId,
        name: selectedItem.name,
        category: selectedItem.category,
        Price: selectedItem.Price
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Create/Update KOT for the new item
      try {
        await axios.post('/api/kot/create', {
          orderId: addItemsForm.orderId,
          tableNo: selectedOrderForItems?.tableNo,
          items: [{
            itemId: selectedItem._id,
            itemName: selectedItem.name,
            quantity: 1,
            price: selectedItem.Price
          }]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('KOT updated for new item');
      } catch (kotError) {
        console.error('KOT update failed:', kotError);
      }
      
      showToast.success('Item added successfully!');
      setAddItemsForm({ orderId: '', itemId: '' });
      setShowAddItemsModal(false);
      setSelectedOrderForItems(null);
      fetchTables(); // Refresh tables to update any status changes
      fetchTableAmounts(); // Refresh table amounts
    } catch (error) {
      console.error('Error adding items:', error);
      showToast.error('Failed to add items');
    }
  };



  const getTableStyle = (status) => {
    switch (status) {
      case 'available':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-800'
        };
      case 'occupied':
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-900',
          text: 'text-white'
        };
      case 'reserved':
        return {
          bg: 'bg-orange-400',
          border: 'border-orange-500',
          text: 'text-white'
        };
      case 'maintenance':
        return {
          bg: 'bg-red-400',
          border: 'border-red-500',
          text: 'text-white'
        };
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-800'
        };
    }
  };

  const handleTableClick = async (table) => {
    if (table.status === 'available') {
      navigate('/resturant/order-table', { 
        state: { 
          tableNumber: table.tableNumber,
          tableId: table._id,
          capacity: table.capacity || 4
        }
      });
    } else if (table.status === 'occupied') {
      // Find existing order for this table and open add items modal
      await handleAddItemsForTable(table.tableNumber);
    }
  };

  const handleRoomServiceClick = (room, booking = null) => {
    try {
      // Check if room is available (no booking)
      if (!booking) {
        showToast.error('Room not booked - No guest assigned');
        return;
      }
      
      // Create room data with booking info like easy dashboard does
      const roomWithBooking = { ...room, booking };
      
      // Store in localStorage like easy dashboard
      localStorage.setItem('selectedRoomService', JSON.stringify(roomWithBooking));
      
      // Navigate to room service
      navigate('/room-service');
    } catch (error) {
      console.error('Error navigating to room service:', error);
      showToast.error('Failed to load room service');
    }
  };

  const getRoomBooking = (roomNumber) => {
    return bookedRooms.find(booking => {
      const roomMatch = booking.roomNumber === roomNumber || 
                       booking.roomNumber === roomNumber.toString() ||
                       booking.room_number === roomNumber ||
                       booking.room_number === roomNumber.toString();
      return roomMatch;
    });
  };

  const getRoomStatus = (room) => {
    if (room.status === 'booked') return 'booked';
    if (room.status === 'maintenance') return 'maintenance';
    
    const booking = getRoomBooking(room.room_number);
    if (booking) return 'booked';
    
    return 'available';
  };

  const getRoomCategory = (room) => {
    const categoryId = typeof room.category === 'object' ? room.category._id : room.category;
    const category = categories.find(cat => cat._id === categoryId);
    
    if (typeof room.category === 'object' && room.category.name) {
      return room.category.name;
    }
    return category ? category.name : 'Unknown Category';
  };

  const handleAddItemsForTable = async (tableNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/restaurant-orders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Find all active orders for this table
      const activeOrders = response.data.filter(order => 
        order.tableNo === tableNumber && 
        order.status !== 'completed' && 
        order.status !== 'cancelled' &&
        order.status !== 'paid'
      );
      
      if (activeOrders.length > 0) {
        // Use the first order as the primary order
        const primaryOrder = activeOrders[0];
        
        // Combine all items from all orders
        const allItems = [];
        activeOrders.forEach(order => {
          if (order.allKotItems) {
            allItems.push(...order.allKotItems);
          } else if (order.items) {
            allItems.push(...order.items);
          }
        });
        
        // Count unique KOTs from item KOT numbers
        const uniqueKots = new Set();
        allItems.forEach(item => {
          if (item.kotNumber) {
            uniqueKots.add(item.kotNumber);
          }
        });
        
        // Calculate total amount by summing item prices
        const totalAmount = allItems.reduce((sum, item) => {
          const itemPrice = item.price || item.Price || 0;
          const itemQuantity = item.quantity || 1;
          return sum + (itemPrice * itemQuantity);
        }, 0);
        
        // Create enhanced order object with combined data
        const enhancedOrder = {
          ...primaryOrder,
          totalAmount: totalAmount,
          amount: totalAmount,
          allKotItems: allItems,
          items: allItems,
          kotCount: uniqueKots.size || 1
        };
        
        setSelectedOrderForItems(enhancedOrder);
        setAddItemsForm({orderId: primaryOrder._id, itemId: ''});
        setShowAddItemsModal(true);
      } else {
        showToast.error('No active order found for this table');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast.error('Failed to load table orders');
    }
  };

  const formatElapsedTime = (startTime) => {
    if (!startTime) return '00:00:00';
    
    const elapsed = Math.floor((currentTime - startTime) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const TableComponent = ({ table }) => {
    const style = getTableStyle(table.status);
    const isAvailable = table.status === 'available';
    const isOccupied = table.status === 'occupied';
    const isClickable = isAvailable || isOccupied;
    const capacity = table.capacity || 4;
    const startTime = tableStartTimes[table.tableNumber];
    const elapsedTime = formatElapsedTime(startTime);
    
    const renderChairs = () => {
      const chairs = [];
      const chairClass = "absolute w-6 h-8 bg-gray-600 rounded";
      
      if (capacity === 1) {
        chairs.push(<div key="top" className={`${chairClass} -top-3 left-1/2 transform -translate-x-1/2`}></div>);
      } else if (capacity === 2) {
        chairs.push(<div key="top" className={`${chairClass} -top-3 left-1/2 transform -translate-x-1/2`}></div>);
        chairs.push(<div key="bottom" className={`${chairClass} -bottom-3 left-1/2 transform -translate-x-1/2`}></div>);
      } else if (capacity === 3) {
        chairs.push(<div key="top" className={`${chairClass} -top-3 left-1/2 transform -translate-x-1/2`}></div>);
        chairs.push(<div key="left" className={`${chairClass} -left-3 top-1/2 transform -translate-y-1/2`}></div>);
        chairs.push(<div key="right" className={`${chairClass} -right-3 top-1/2 transform -translate-y-1/2`}></div>);
      } else if (capacity === 4) {
        chairs.push(<div key="top" className={`${chairClass} -top-3 left-1/2 transform -translate-x-1/2`}></div>);
        chairs.push(<div key="bottom" className={`${chairClass} -bottom-3 left-1/2 transform -translate-x-1/2`}></div>);
        chairs.push(<div key="left" className={`${chairClass} -left-3 top-1/2 transform -translate-y-1/2`}></div>);
        chairs.push(<div key="right" className={`${chairClass} -right-3 top-1/2 transform -translate-y-1/2`}></div>);
      } else if (capacity === 6) {
        chairs.push(<div key="top-left" className={`${chairClass} -top-3 left-1/4 transform -translate-x-1/2`}></div>);
        chairs.push(<div key="top-right" className={`${chairClass} -top-3 right-1/4 transform translate-x-1/2`}></div>);
        chairs.push(<div key="bottom-left" className={`${chairClass} -bottom-3 left-1/4 transform -translate-x-1/2`}></div>);
        chairs.push(<div key="bottom-right" className={`${chairClass} -bottom-3 right-1/4 transform translate-x-1/2`}></div>);
        chairs.push(<div key="left" className={`${chairClass} -left-3 top-1/2 transform -translate-y-1/2`}></div>);
        chairs.push(<div key="right" className={`${chairClass} -right-3 top-1/2 transform -translate-y-1/2`}></div>);
      } else if (capacity >= 8) {
        chairs.push(<div key="top-1" className={`${chairClass} -top-3 left-1/4 transform -translate-x-1/2`}></div>);
        chairs.push(<div key="top-2" className={`${chairClass} -top-3 right-1/4 transform translate-x-1/2`}></div>);
        chairs.push(<div key="bottom-1" className={`${chairClass} -bottom-3 left-1/4 transform -translate-x-1/2`}></div>);
        chairs.push(<div key="bottom-2" className={`${chairClass} -bottom-3 right-1/4 transform translate-x-1/2`}></div>);
        chairs.push(<div key="left-1" className={`${chairClass} -left-3 top-1/3 transform -translate-y-1/2`}></div>);
        chairs.push(<div key="left-2" className={`${chairClass} -left-3 bottom-1/3 transform translate-y-1/2`}></div>);
        chairs.push(<div key="right-1" className={`${chairClass} -right-3 top-1/3 transform -translate-y-1/2`}></div>);
        chairs.push(<div key="right-2" className={`${chairClass} -right-3 bottom-1/3 transform translate-y-1/2`}></div>);
      }
      
      return chairs;
    };
    
    return (
      <div className="relative">
        {/* Table representation */}
        <div 
          className={`
            ${style.bg} ${style.border} ${style.text}
            border-2 rounded-lg p-4 min-h-[120px] flex flex-col items-center justify-center
            transition-all duration-200 hover:shadow-lg
            ${isClickable ? 'cursor-pointer' : 'cursor-default'}
            ${isAvailable ? 'hover:bg-green-50 hover:border-green-300' : ''}
            ${isOccupied ? 'hover:bg-gray-700 hover:border-gray-600' : ''}
          `}
          onClick={() => handleTableClick(table)}
        >
          {/* Table number */}
          <div className="font-bold text-lg mb-2">
            {table.tableNumber}
          </div>
          

          

          
          {/* Add items indicator, amount and timer for occupied tables */}
          {isOccupied && (
            <>
              <div className="text-sm font-semibold text-white mb-1">
                ₹{tableAmounts[table.tableNumber] || 0}
              </div>
              <div className="text-xs text-gray-300 mb-1 font-mono">
                {elapsedTime}
              </div>
              <div className="text-xs text-gray-300 text-center">
                Click to add items
              </div>
            </>
          )}
          
          {table.status === 'reserved' && (
            <div className="text-xs bg-white text-gray-800 px-2 py-1 rounded">
              In Progress
            </div>
          )}
        </div>
        
        {/* Dynamic chair representations based on capacity */}
        {renderChairs()}
      </div>
    );
  };

  const RoomServiceComponent = ({ order }) => {
    const getStatusStyle = (status) => {
      switch (status) {
        case 'pending':
          return {
            bg: 'bg-yellow-100',
            border: 'border-yellow-300',
            text: 'text-yellow-800'
          };
        case 'confirmed':
        case 'preparing':
          return {
            bg: 'bg-blue-100',
            border: 'border-blue-300',
            text: 'text-blue-800'
          };
        case 'ready':
          return {
            bg: 'bg-green-100',
            border: 'border-green-300',
            text: 'text-green-800'
          };
        default:
          return {
            bg: 'bg-gray-100',
            border: 'border-gray-300',
            text: 'text-gray-800'
          };
      }
    };

    const style = getStatusStyle(order.status);
    const elapsedTime = formatElapsedTime(new Date(order.createdAt));
    
    return (
      <div className="relative">
        <div 
          className={`
            ${style.bg} ${style.border} ${style.text}
            border-2 rounded-lg p-4 min-h-[120px] flex flex-col items-center justify-center
            transition-all duration-200 hover:shadow-lg cursor-pointer
            hover:bg-purple-50 hover:border-purple-300
          `}
          onClick={() => handleRoomServiceClick(order.roomNumber)}
        >
          <div className="font-bold text-lg mb-2">
            R{order.roomNumber}
          </div>
          <div className="text-sm font-semibold mb-1">
            ₹{order.totalAmount}
          </div>
          <div className="text-xs mb-1 font-mono">
            {elapsedTime}
          </div>
          <div className="text-xs text-center capitalize">
            {order.status}
          </div>
          <div className="text-xs text-center mt-1">
            {order.items?.length || 0} items
          </div>
        </div>
      </div>
    );
  };

  const RoomCardComponent = ({ room }) => {
    const currentStatus = getRoomStatus(room);
    const booking = getRoomBooking(room.room_number);
    const isAvailable = currentStatus === 'available';
    const isBooked = currentStatus === 'booked';
    
    const statusMap = {
      'available': { 
        bg: 'bg-green-50 hover:bg-green-100', 
        text: 'text-green-700', 
        accent: 'border-green-500', 
        label: 'AVAILABLE'
      },
      'booked': { 
        bg: 'bg-red-200 hover:bg-red-300', 
        text: 'text-red-900', 
        accent: 'border-red-700', 
        label: 'OCCUPIED'
      },
      'maintenance': { 
        bg: 'bg-yellow-100 hover:bg-yellow-200', 
        text: 'text-yellow-800', 
        accent: 'border-yellow-600', 
        label: 'MAINTENANCE'
      }
    };
    
    const statusProps = statusMap[currentStatus] || statusMap.available;
    
    return (
      <div className="relative">
        <div 
          className={`
            ${statusProps.bg}
            rounded-lg shadow-md border-t-2 ${statusProps.accent} 
            transition-all duration-300 cursor-pointer hover:shadow-lg
            min-h-[120px] p-3 flex flex-col items-center justify-center
          `}
          onClick={() => handleRoomServiceClick(room, booking)}
        >
          <div className={`font-extrabold text-2xl mb-1 ${statusProps.text}`}>
            {room.room_number}
          </div>
          
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500 text-center">
            {statusProps.label}
          </div>
          
          <div className="text-xs text-gray-400 italic mb-2 text-center">
            {getRoomCategory(room)}
          </div>
          
          {isBooked && booking && (
            <div className="text-xs text-center w-full text-gray-600">
              <span className="font-medium block truncate">
                Guest: {booking.name || 'Unknown'}
              </span>
            </div>
          )}
          
          {isAvailable && (
            <div className="text-xs text-center text-gray-500">
              Click for Room Service
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Table View</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded"></div>
              <span>Not Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span>Reserved</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => {
            fetchTables();
            fetchRoomServiceOrders();
            fetchBookedRooms();
            fetchAllRooms();
            fetchCategories();
          }}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>



      {/* Tables layout */}
      <div className="bg-white rounded-lg shadow p-8 min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Dining Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-500 pb-2">Dining Area</h2>
              <div className="grid grid-cols-3 gap-20 auto-rows-max max-w-6xl mx-auto">
                {tables
                  .filter(table => table.location === 'dining')
                  .map((table) => (
                    <TableComponent key={table._id} table={table} />
                  ))}
              </div>
              {tables.filter(table => table.location === 'dining').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No dining tables found</p>
                </div>
              )}
            </div>
            
            {/* Rooftop Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-orange-500 pb-2">Rooftop Area</h2>
              <div className="grid grid-cols-3 gap-20 auto-rows-max max-w-6xl mx-auto">
                {tables
                  .filter(table => table.location === 'rooftop')
                  .map((table) => (
                    <TableComponent key={table._id} table={table} />
                  ))}
              </div>
              {tables.filter(table => table.location === 'rooftop').length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No rooftop tables found</p>
                </div>
              )}
            </div>
            
            {/* Room Service Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-purple-500 pb-2">Room Service</h2>
              
              {/* Active Room Service Orders */}
              {roomServiceOrders.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Active Orders</h3>
                  <div className="grid grid-cols-3 gap-20 auto-rows-max max-w-6xl mx-auto">
                    {roomServiceOrders.map((order) => (
                      <RoomServiceComponent key={order._id} order={order} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* All Rooms */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  All Rooms ({allRooms.length})
                </h3>
                <div className="grid grid-cols-3 gap-20 auto-rows-max max-w-6xl mx-auto">
                  {allRooms.map((room) => (
                    <RoomCardComponent key={room._id} room={room} />
                  ))}
                </div>
                {allRooms.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No rooms found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Items Modal */}
      {showAddItemsModal && selectedOrderForItems && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-[#c3ad6b]/30">
            {/* Header */}
            <div className="p-6 border-b border-[#c3ad6b]/20">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-[#b39b5a]">Add Items to Order</h3>
                <button
                  onClick={() => {
                    setShowAddItemsModal(false);
                    setSelectedOrderForItems(null);
                    setAddItemsForm({orderId: '', itemId: ''});
                  }}
                  className="text-gray-500 hover:text-gray-700 text-3xl transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            {/* Current Order Info */}
            <div className="p-6 bg-gradient-to-r from-[#f7f5ef] to-[#c3ad6b]/10 border-b border-[#c3ad6b]/20">
              <h4 className="text-lg font-bold text-[#b39b5a] mb-4">Current Order Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#b39b5a]">Order ID:</span>
                  <span className="text-gray-700 font-mono">{selectedOrderForItems._id?.slice(-6)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#b39b5a]">Table:</span>
                  <span className="text-gray-700">{selectedOrderForItems.tableNo}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#b39b5a]">Items:</span>
                  <span className="text-gray-700">{selectedOrderForItems.allKotItems?.length || selectedOrderForItems.items?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#b39b5a]">Total Amount:</span>
                  <span className="text-gray-700 font-bold">₹{selectedOrderForItems.totalAmount || selectedOrderForItems.amount || selectedOrderForItems.advancePayment || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#b39b5a]">KOTs:</span>
                  <span className="text-gray-700">{selectedOrderForItems.kotCount || 1}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[#b39b5a]">Status:</span>
                  <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-800">{selectedOrderForItems.status || 'pending'}</span>
                </div>
              </div>
              
              {/* Current Items List */}
              {(selectedOrderForItems.allKotItems || selectedOrderForItems.items) && (selectedOrderForItems.allKotItems || selectedOrderForItems.items).length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold text-[#b39b5a] mb-2">Current Items:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {(selectedOrderForItems.allKotItems || selectedOrderForItems.items).map((item, index) => {
                      let itemName = 'Unknown Item';
                      if (typeof item === 'string') {
                        itemName = item;
                      } else if (item.itemId) {
                        const foundItem = items.find(i => i._id === item.itemId);
                        itemName = foundItem ? foundItem.name : (item.name || item.itemName || 'Unknown Item');
                      } else {
                        itemName = item.name || item.itemName || 'Unknown Item';
                      }
                      return (
                        <div key={index} className="flex items-center gap-2 text-xs bg-white/50 rounded-lg p-2">
                          <span className="bg-[#c3ad6b] text-white px-2 py-1 rounded text-xs font-bold">K{item.kotNumber || 1}</span>
                          <span className="text-gray-700">{itemName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Menu Items Grid */}
            <div className="p-6">
              <h4 className="text-lg font-bold text-[#b39b5a] mb-4">Select Items to Add</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {items.map(item => (
                  <div key={item._id} className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border-2 border-[#c3ad6b]/20 hover:border-[#c3ad6b] hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    <h5 className="text-lg font-bold text-[#b39b5a] mb-1 truncate">{item.name}</h5>
                    <p className="text-sm text-[#c3ad6b] font-medium mb-2">{item.category}</p>
                    <p className="text-lg font-bold text-gray-800 mb-3">₹{(item.Price || item.price || 0).toFixed(2)}</p>
                    <button
                      onClick={() => {
                        setAddItemsForm({...addItemsForm, itemId: item._id});
                        // Auto-submit when item is selected
                        const form = document.getElementById('add-items-form');
                        if (form) {
                          setTimeout(() => form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })), 100);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white py-2 rounded-lg font-bold hover:from-[#b39b5a] hover:to-[#c3ad6b] transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg text-sm"
                    >
                      Add to Order
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Hidden Form for Submission */}
            <form 
              id="add-items-form"
              onSubmit={addItems} 
              className="hidden"
            >
              <input type="hidden" value={addItemsForm.itemId} />
            </form>
            
            {/* Footer */}
            <div className="p-6 border-t border-[#c3ad6b]/20 bg-gradient-to-r from-[#f7f5ef] to-[#c3ad6b]/10">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddItemsModal(false);
                    setSelectedOrderForItems(null);
                    setAddItemsForm({orderId: '', itemId: ''});
                  }}
                  className="px-6 py-3 bg-gray-500 text-white rounded-xl font-bold hover:bg-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableTables;
