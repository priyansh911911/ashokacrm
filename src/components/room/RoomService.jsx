import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus } from 'lucide-react';

const RoomService = () => {
  const navigate = useNavigate();
  const [roomData, setRoomData] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [newItem, setNewItem] = useState({
    itemName: '',
    quantity: 1,
    unitPrice: 0,
    category: '',
    specialInstructions: ''
  });
  const [showOrderForm, setShowOrderForm] = useState(false);

  const hardcodedItems = [
    // Restaurant/Food Services
    { name: 'Tea', price: 25, category: 'Restaurant' },
    { name: 'Coffee', price: 30, category: 'Restaurant' },
    { name: 'Sandwich', price: 80, category: 'Restaurant' },
    { name: 'Biryani', price: 180, category: 'Restaurant' },
    { name: 'Dal Rice', price: 100, category: 'Restaurant' },
    { name: 'Mineral Water', price: 20, category: 'Restaurant' },
    // Laundry Services
    { name: 'Shirt Washing', price: 50, category: 'Laundry' },
    { name: 'Trouser Washing', price: 60, category: 'Laundry' },
    { name: 'Dry Cleaning', price: 150, category: 'Laundry' },
    { name: 'Bed Sheet Washing', price: 80, category: 'Laundry' },
    // Cab/Transport Services
    { name: 'Local Cab Booking', price: 200, category: 'Transport' },
    { name: 'Airport Transfer', price: 500, category: 'Transport' },
    { name: 'Outstation Cab', price: 1000, category: 'Transport' },
    // Housekeeping/Staff Services
    { name: 'Room Cleaning', price: 100, category: 'Housekeeping' },
    { name: 'Extra Towels', price: 30, category: 'Housekeeping' },
    { name: 'Maintenance Request', price: 0, category: 'Housekeeping' },
    // Pantry Services
    { name: 'Pantry Snacks', price: 40, category: 'Pantry' },
    { name: 'Pantry Beverages', price: 25, category: 'Pantry' },
    // General Services
    { name: 'Wake-up Call', price: 0, category: 'General' },
    { name: 'Extra Amenities', price: 50, category: 'General' }
  ];

  useEffect(() => {
    const storedRoomData = localStorage.getItem('selectedRoomService');
    if (storedRoomData) {
      setRoomData(JSON.parse(storedRoomData));
      localStorage.removeItem('selectedRoomService');
    } else {
      navigate('/easy-dashboard');
    }
  }, [navigate]);

  const addItem = () => {
    if (newItem.itemName && newItem.unitPrice > 0) {
      const totalPrice = newItem.quantity * newItem.unitPrice;
      setOrderItems([...orderItems, { ...newItem, totalPrice }]);
      setNewItem({ itemName: '', quantity: 1, unitPrice: 0, category: '', specialInstructions: '' });
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
      const { subtotal, tax, serviceCharge, totalAmount } = calculateTotals();
      const orderData = {
        roomNumber: roomData.room_number,
        guestName: roomData.booking?.name,
        grcNo: roomData.booking?.grcNo,
        bookingId: roomData.booking?._id,
        items: orderItems,
        subtotal,
        tax,
        serviceCharge,
        totalAmount
      };
      
      const response = await fetch('https://ashoka-backend.vercel.app/api/room-service/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const order = await response.json();
        await fetch(`https://ashoka-backend.vercel.app/api/room-service/order/${order._id}/kot`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        alert('KOT generated successfully!');
        setOrderItems([]);
        setShowOrderForm(false);
      }
    } catch (error) {
      console.error('Error creating KOT:', error);
    }
  };

  const handleSaleBill = async () => {
    try {
      const response = await fetch(`https://ashoka-backend.vercel.app/api/room-service/orders?roomNumber=${roomData.room_number}&kotGenerated=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const orders = await response.json();
        localStorage.setItem('roomServiceOrders', JSON.stringify(orders));
        navigate('/billing');
      }
    } catch (error) {
      console.error('Error fetching orders for bill:', error);
    }
  };

  const handleBillLookup = async () => {
    try {
      const response = await fetch(`https://ashoka-backend.vercel.app/api/room-service/orders?roomNumber=${roomData.room_number}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const orders = await response.json();
        localStorage.setItem('billLookupData', JSON.stringify({
          roomNumber: roomData.room_number,
          guestName: roomData.booking?.name,
          orders: orders
        }));
        navigate('/invoice');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm" style={{color: 'var(--color-text)'}}>KOT Ordered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-400 rounded"></div>
                <span className="text-sm" style={{color: 'var(--color-text)'}}>Exclusive Rooms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Details and Services */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Guest Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--color-text)'}}>Guest Details - Room {roomData.room_number}</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium" style={{color: 'var(--color-text)'}}>Room No.:</span>
                  <span style={{color: 'var(--color-text)'}}>{roomData.room_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{color: 'var(--color-text)'}}>GRC No.:</span>
                  <span style={{color: 'var(--color-text)'}}>{booking?.grcNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{color: 'var(--color-text)'}}>Name:</span>
                  <span style={{color: 'var(--color-text)'}}>{booking?.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{color: 'var(--color-text)'}}>PAX:</span>
                  <span style={{color: 'var(--color-text)'}}>{booking?.noOfAdults || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{color: 'var(--color-text)'}}>Mobile No.:</span>
                  <span style={{color: 'var(--color-text)'}}>{booking?.mobileNo || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{color: 'var(--color-text)'}}>Plan:</span>
                  <span style={{color: 'var(--color-text)'}}>{booking?.planPackage || 'CP STANDARD'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{color: 'var(--color-text)'}}>Company:</span>
                  <span style={{color: 'var(--color-text)'}}>{booking?.companyName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium" style={{color: 'var(--color-text)'}}>Remark:</span>
                  <span style={{color: 'var(--color-text)'}}>{booking?.remark || '-'}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--color-text)'}}>Room Services</h3>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleKOTEntry}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors"
                  style={{backgroundColor: 'var(--color-primary)', color: 'white'}}
                >
                  KOT Entry
                </button>
                <button 
                  onClick={handleSaleBill}
                  className="w-full px-4 py-3 rounded-lg font-medium transition-colors"
                  style={{backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)'}}
                >
                  Sale Bill
                </button>
                <button 
                  onClick={handleBillLookup}
                  className="w-full px-4 py-3 rounded-lg font-medium border transition-colors hover:bg-gray-50"
                  style={{borderColor: 'var(--color-border)', color: 'var(--color-text)'}}
                >
                  Bill Lookup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Order Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{color: 'var(--color-text)'}}>Add Items</h3>
            <button
              onClick={() => setShowOrderForm(!showOrderForm)}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{backgroundColor: 'var(--color-primary)', color: 'white'}}
            >
              {showOrderForm ? 'Hide Form' : 'Add Items'}
            </button>
          </div>

          {showOrderForm && (
            <div className="space-y-6">
              {['Restaurant', 'Laundry', 'Transport', 'Housekeeping', 'Pantry', 'General'].map(category => {
                const categoryItems = hardcodedItems.filter(item => item.category === category);
                return (
                  <div key={category} className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-3" style={{color: 'var(--color-text)'}}>{category} Services</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {categoryItems.map((item, index) => (
                        <div key={`${category}-${index}`} className="border rounded-lg p-3 hover:bg-gray-50">
                          <h5 className="font-medium" style={{color: 'var(--color-text)'}}>{item.name}</h5>
                          <p className="font-bold" style={{color: 'var(--color-primary)'}}>₹{item.price}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <input
                              type="number"
                              min="1"
                              defaultValue="1"
                              className="border rounded px-2 py-1 w-16 text-sm"
                              id={`qty-${category}-${index}`}
                            />
                            <button
                              onClick={() => {
                                const qty = parseInt(document.getElementById(`qty-${category}-${index}`).value) || 1;
                                const totalPrice = qty * item.price;
                                setOrderItems([...orderItems, {
                                  itemName: item.name,
                                  quantity: qty,
                                  unitPrice: item.price,
                                  totalPrice,
                                  category: item.category,
                                  specialInstructions: ''
                                }]);
                              }}
                              className="px-3 py-1 rounded text-sm font-medium transition-colors"
                              style={{backgroundColor: 'var(--color-primary)', color: 'white'}}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Order Items List */}
          {orderItems.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3" style={{color: 'var(--color-text)'}}>Order Items</h4>
              <div className="space-y-2">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{item.itemName}</span>
                      <span className="text-sm text-gray-600 ml-2">({item.category})</span>
                    </div>
                    <div className="text-sm">
                      {item.quantity} × ₹{item.unitPrice} = ₹{item.totalPrice}
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Order Summary */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="space-y-2 text-sm">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomService;