import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';

const RoomService = () => {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Restaurant');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);



  useEffect(() => {
    const storedRoomData = localStorage.getItem('selectedRoomService');
    if (storedRoomData) {
      const parsedData = JSON.parse(storedRoomData);
      setRoomData(parsedData);
      // Don't remove localStorage immediately to prevent redirect on re-render
    } else {
      // Only redirect if we haven't already set room data
      if (!roomData) {
        navigate('/easy-dashboard');
      }
    }
    fetchItems();
  }, [navigate]); // Remove roomData from dependency array to prevent infinite loop

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch restaurant items
      let restaurantItems = [];
      try {
        const res = await fetch('https://ashoka-api.shineinfosolutions.in/api/items/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          restaurantItems = await res.json();
        }
      } catch (err) {
        console.log('Restaurant API failed:', err);
      }
      
      // Fetch laundry items
      let laundryItems = [];
      try {
        const laundryRes = await fetch('https://ashoka-api.shineinfosolutions.in/api/laundry-rates/all', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (laundryRes.ok) {
          laundryItems = await laundryRes.json();
        }
      } catch (err) {
        console.log('Laundry API failed:', err);
      }
      
      const formattedItems = [
        ...(Array.isArray(restaurantItems) ? restaurantItems : []).map(item => ({
          ...item,
          category: 'Restaurant',
          name: item.name,
          price: item.Price || item.price || 0
        })),
        ...(Array.isArray(laundryItems) ? laundryItems : []).map(item => ({
          ...item,
          category: 'Laundry',
          name: item.itemName,
          price: item.rate || 0
        }))
      ];
      
      setAvailableItems(formattedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const addItemToOrder = (item, quantity = 1) => {
    const totalPrice = quantity * item.price;
    const existingItem = orderItems.find(oi => oi.itemId === item._id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(oi => 
        oi.itemId === item._id
          ? {...oi, quantity: oi.quantity + quantity, totalPrice: (oi.quantity + quantity) * oi.unitPrice}
          : oi
      ));
    } else {
      setOrderItems([...orderItems, {
        itemName: item.name,
        quantity,
        unitPrice: item.price,
        totalPrice,
        category: item.category,
        specialInstructions: '',
        itemId: item._id
      }]);
    }
  };

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.18;
    const serviceCharge = subtotal * 0.10;
    const totalAmount = subtotal + tax + serviceCharge;
    return { subtotal, tax, serviceCharge, totalAmount };
  };

  const handleKOTEntry = async () => {
    if (orderItems.length === 0) {
      alert('Please add items to create KOT');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const restaurantItems = orderItems.filter(item => item.category === 'Restaurant');
      
      // Create restaurant order for restaurant items (goes to chef dashboard)
      if (restaurantItems.length > 0) {
        const restaurantOrderData = {
          staffName: 'Room Service',
          phoneNumber: roomData.booking?.mobileNo || '',
          tableNo: `R${roomData.room_number.toString().replace(/\D/g, '').padStart(3, '0')}`,
          items: restaurantItems.map(item => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.unitPrice
          })),
          notes: `Room Service - ${roomData.booking?.name || 'Guest'}`,
          amount: restaurantItems.reduce((sum, item) => sum + item.totalPrice, 0),
          discount: 0,
          isMembership: false,
          isLoyalty: false,
          bookingId: roomData.booking?._id,
          grcNo: roomData.booking?.grcNo,
          roomNumber: roomData.room_number,
          guestName: roomData.booking?.name,
          guestPhone: roomData.booking?.mobileNo
        };
        
        await fetch('https://ashoka-api.shineinfosolutions.in/api/restaurant-orders/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(restaurantOrderData)
        });
      }
      
      alert('Order created successfully!');
      setOrderItems([]);
      setShowOrderForm(false);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order');
    }
  };

  const handleSaleBill = () => {
    navigate('/room-service-billing', { 
      state: { 
        grcNo: roomData.booking?.grcNo,
        roomNumber: roomData.room_number,
        guestName: roomData.booking?.name 
      }
    });
  };

  const handleBillLookup = () => {
    navigate('/bill-lookup', { 
      state: { 
        grcNo: roomData.booking?.grcNo,
        roomNumber: roomData.room_number,
        guestName: roomData.booking?.name 
      }
    });
  };

  if (!roomData) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const booking = roomData.booking;

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--color-background)'}}>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6" style={{borderColor: 'var(--color-border)'}}>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/easy-dashboard')}
              className="flex items-center hover:opacity-80 transition-opacity"
              style={{color: 'var(--color-primary)'}}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold" style={{color: 'var(--color-text)'}}>Room Service</h1>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleSaleBill}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)'}}
              >
                Sale Bill
              </button>
              <button 
                onClick={handleBillLookup}
                className="px-4 py-2 rounded-lg font-medium border transition-colors hover:bg-gray-50"
                style={{borderColor: 'var(--color-border)', color: 'var(--color-text)'}}
              >
                Bill Lookup
              </button>
            </div>
          </div>
          
          {/* Guest Details */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3" style={{color: 'var(--color-text)'}}>Guest Details - Room {roomData.room_number}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>Room No.: </span>
                <span style={{color: 'var(--color-text)'}}>{roomData.room_number}</span>
              </div>
              <div>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>GRC No.: </span>
                <span style={{color: 'var(--color-text)'}}>{booking?.grcNo || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>Name: </span>
                <span style={{color: 'var(--color-text)'}}>{booking?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>PAX: </span>
                <span style={{color: 'var(--color-text)'}}>{booking?.noOfAdults || 1}</span>
              </div>
              <div>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>Mobile No.: </span>
                <span style={{color: 'var(--color-text)'}}>{booking?.mobileNo || 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>Plan: </span>
                <span style={{color: 'var(--color-text)'}}>{booking?.planPackage || 'CP STANDARD'}</span>
              </div>
              <div>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>Company: </span>
                <span style={{color: 'var(--color-text)'}}>{booking?.companyName || '-'}</span>
              </div>
              <div>
                <span className="font-medium" style={{color: 'var(--color-text)'}}>Remark: </span>
                <span style={{color: 'var(--color-text)'}}>{booking?.remark || '-'}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Search Menu Section */}
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl p-6 sm:p-8 mb-8 border border-[#c3ad6b]/30">
          <label htmlFor="search-menu" className="block font-bold mb-4 text-lg text-[#b39b5a]">Search Menu</label>
          <div className="relative">
            <input
              id="search-menu"
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl pl-12 pr-4 py-4 border-2 border-[#c3ad6b]/30 focus:border-[#c3ad6b] focus:ring-2 focus:ring-[#c3ad6b]/20 text-gray-700 bg-white/80 backdrop-blur-sm transition-all duration-200 text-base"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-[#c3ad6b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="mt-4">
            <p className="text-sm text-[#c3ad6b] font-medium">Available items: {availableItems.length} | Restaurant: {availableItems.filter(i => i.category === 'Restaurant').length} | Laundry: {availableItems.filter(i => i.category === 'Laundry').length}</p>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setSelectedCategory('Restaurant')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              selectedCategory === 'Restaurant' 
                ? 'bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white shadow-xl' 
                : 'bg-white/90 backdrop-blur-sm border-2 border-[#c3ad6b]/30 text-[#b39b5a] hover:border-[#c3ad6b]'
            }`}
          >
            Restaurant
          </button>
          <button
            onClick={() => setSelectedCategory('Laundry')}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
              selectedCategory === 'Laundry' 
                ? 'bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white shadow-xl' 
                : 'bg-white/90 backdrop-blur-sm border-2 border-[#c3ad6b]/30 text-[#b39b5a] hover:border-[#c3ad6b]'
            }`}
          >
            Laundry
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {availableItems.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Loading items...
            </div>
          ) : availableItems
            .filter(item => 
              item.category === selectedCategory &&
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((item, index) => {
              const isInOrder = orderItems.some(orderItem => orderItem.itemId === item._id);
              const orderItem = orderItems.find(orderItem => orderItem.itemId === item._id);
              
              return (
                <div key={index} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border-2 border-[#c3ad6b]/30 hover:border-[#c3ad6b] hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <h3 className="text-xl font-bold truncate text-[#b39b5a] mb-2">{item.name}</h3>
                  <p className="text-sm mb-4 text-[#c3ad6b] font-medium">{item.category}</p>
                  <p className="mb-4 font-bold text-lg text-gray-800">₹{item.price.toFixed(2)}</p>

                  {isInOrder ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        <button
                          className="bg-gray-200 text-gray-700 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors text-sm sm:text-base"
                          onClick={() => {
                            const updatedItems = orderItems.map(oi => 
                              oi.itemId === item._id && oi.quantity > 1
                                ? {...oi, quantity: oi.quantity - 1, totalPrice: (oi.quantity - 1) * oi.unitPrice}
                                : oi
                            ).filter(oi => oi.quantity > 0);
                            setOrderItems(updatedItems);
                          }}
                        >
                          -
                        </button>
                        <span className="font-bold text-gray-800 text-sm sm:text-base min-w-[20px] text-center">
                          {orderItem?.quantity || 0}
                        </span>
                        <button
                          className="bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center hover:from-[#b39b5a] hover:to-[#c3ad6b] transition-all duration-300 text-sm sm:text-base"
                          onClick={() => {
                            const updatedItems = orderItems.map(oi => 
                              oi.itemId === item._id
                                ? {...oi, quantity: oi.quantity + 1, totalPrice: (oi.quantity + 1) * oi.unitPrice}
                                : oi
                            );
                            setOrderItems(updatedItems);
                          }}
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 text-xs sm:text-sm px-2 py-1 rounded"
                        onClick={() => setOrderItems(orderItems.filter(oi => oi.itemId !== item._id))}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      className="w-full bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white py-3 rounded-xl font-bold hover:from-[#b39b5a] hover:to-[#c3ad6b] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      onClick={() => addItemToOrder(item, 1)}
                    >
                      Add to Order
                    </button>
                  )}
                </div>
              );
            })
          }
          {availableItems.length > 0 && availableItems.filter(item => 
            item.category === selectedCategory &&
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              {searchQuery ? `No ${selectedCategory.toLowerCase()} items found for "${searchQuery}"` : `No ${selectedCategory.toLowerCase()} items available`}
            </div>
          )}


        </div>

        {/* Floating Cart Button */}
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative">
            <button
              className="p-4 rounded-full shadow-xl bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] text-white transition-all duration-300 transform hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#c3ad6b]/30"
              onClick={() => setIsCartOpen(!isCartOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.298.503 1.298H19.5a1 1 0 00.993-.883l.988-7.893z" />
              </svg>
            </button>
            {orderItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#b39b5a] to-[#c3ad6b] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-lg animate-pulse">
                {orderItems.length}
              </span>
            )}
          </div>
        </div>

        {/* Cart Modal */}
        {isCartOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Room Service Cart</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    onClick={() => setIsCartOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {orderItems.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.298.503 1.298H19.5a1 1 0 00.993-.883l.988-7.893z" />
                    </svg>
                    <p>Your cart is empty</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{item.itemName}</div>
                          <div className="text-xs text-gray-500">{item.category}</div>
                          <div className="text-xs text-[#c3ad6b]">₹{item.unitPrice.toFixed(2)} each</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="bg-gray-200 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors text-xs"
                            onClick={() => {
                              if (item.quantity > 1) {
                                setOrderItems(orderItems.map(oi => 
                                  oi.itemId === item.itemId
                                    ? {...oi, quantity: oi.quantity - 1, totalPrice: (oi.quantity - 1) * oi.unitPrice}
                                    : oi
                                ));
                              } else {
                                removeItem(index);
                              }
                            }}
                          >
                            -
                          </button>
                          <span className="font-bold text-gray-800 w-6 text-center">{item.quantity}</span>
                          <button
                            className="bg-[#c3ad6b] text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#b39b5a] transition-colors text-xs"
                            onClick={() => {
                              setOrderItems(orderItems.map(oi => 
                                oi.itemId === item.itemId
                                  ? {...oi, quantity: oi.quantity + 1, totalPrice: (oi.quantity + 1) * oi.unitPrice}
                                  : oi
                              ));
                            }}
                          >
                            +
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 text-lg font-bold ml-2"
                            onClick={() => removeItem(index)}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {orderItems.length > 0 && (
                <div className="border-t p-4">
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{calculateTotals().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%):</span>
                      <span>₹{calculateTotals().tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Charge (10%):</span>
                      <span>₹{calculateTotals().serviceCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₹{calculateTotals().totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <button
                      className="w-full py-2 px-4 rounded-md text-gray-700 bg-gray-200 font-semibold hover:bg-gray-300 transition-colors duration-200 text-sm"
                      onClick={() => setOrderItems([])}
                    >
                      Clear All
                    </button>
                    <button
                      className="w-full py-3 px-4 rounded-md text-white bg-gradient-to-r from-[#c3ad6b] to-[#b39b5a] font-semibold hover:from-[#b39b5a] hover:to-[#c3ad6b] transition-all duration-200 text-sm"
                      onClick={() => {
                        handleKOTEntry();
                        setIsCartOpen(false);
                      }}
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomService;
