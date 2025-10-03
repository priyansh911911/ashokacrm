
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const EasyDashboard = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookings, setShowBookings] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const roomsRes = await axios.get('/api/rooms/all', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error('Rooms API error:', err);
        return { data: [] };
      });
      
      const bookingsRes = await axios.get('/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error('Bookings API error:', err);
        return { data: [] };
      });
      
      const categoriesRes = await axios.get('/api/categories/all', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error('Categories API error:', err);
        return { data: [] };
      });
      
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
      const allBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];
      setBookings(allBookings);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomBooking = (roomNumber) => {
    return bookings.find(booking => {
      const isValidStatus = booking.status === 'Confirmed' || booking.status === 'Booked' || booking.status === 'Reserved';
      
      if (booking.roomNumber === roomNumber || booking.roomNumber === roomNumber.toString()) {
        return isValidStatus;
      }
      
      if (booking.roomAssigned) {
        if (Array.isArray(booking.roomAssigned)) {
          return booking.roomAssigned.some(room => 
            (typeof room === 'object' ? room.room_number : room) === roomNumber ||
            (typeof room === 'object' ? room.room_number : room) === roomNumber.toString()
          ) && isValidStatus;
        } else if (typeof booking.roomAssigned === 'object' && booking.roomAssigned.room_number) {
          return (booking.roomAssigned.room_number === roomNumber || booking.roomAssigned.room_number === roomNumber.toString()) && isValidStatus;
        }
      }
      
      return false;
    });
  };

  const getRoomStatus = (room) => {
    const booking = getRoomBooking(room.room_number);
    if (booking) {
      return 'booked';
    }
    return room.status === 'maintenance' ? 'maintenance' : 'available';
  };

  const getRoomStats = () => {
    const total = rooms.length;
    let available = 0;
    let booked = 0;
    let maintenance = 0;
    
    rooms.forEach(room => {
      const currentStatus = getRoomStatus(room);
      if (currentStatus === 'available') available++;
      else if (currentStatus === 'booked') booked++;
      else if (currentStatus === 'maintenance') maintenance++;
    });
    
    return { total, available, booked, maintenance };
  };

  const getFloorFromRoomNumber = (roomNumber) => {
    const roomNum = parseInt(roomNumber);
    if (roomNum >= 100 && roomNum < 200) return 1;
    if (roomNum >= 200 && roomNum < 300) return 2;
    if (roomNum >= 300 && roomNum < 400) return 3;
    if (roomNum >= 400 && roomNum < 500) return 4;
    if (roomNum >= 500 && roomNum < 600) return 5;
    return 0;
  };

  const getRoomsByFloor = () => {
    const roomsByFloor = {};
    rooms.forEach(room => {
      const floor = getFloorFromRoomNumber(room.room_number);
      if (!roomsByFloor[floor]) roomsByFloor[floor] = [];
      roomsByFloor[floor].push(room);
    });
    
    Object.keys(roomsByFloor).forEach(floor => {
      roomsByFloor[floor].sort((a, b) => parseInt(a.room_number) - parseInt(b.room_number));
    });
    
    return roomsByFloor;
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const roomStats = getRoomStats();

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">
          EASY DASHBOARD
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{roomStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-3xl font-bold text-green-600">{roomStats.booked}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-3xl font-bold text-red-600">{roomStats.available}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-3xl font-bold text-pink-600">{roomStats.maintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floor-wise Room Display */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Rooms by Floor</h2>
        </div>
        
        {Object.keys(getRoomsByFloor()).sort((a, b) => parseInt(a) - parseInt(b)).map(floor => {
          const floorRooms = getRoomsByFloor()[floor];
          return (
            <div key={floor} className="mb-6">
              <h3 className="text-md font-semibold text-gray-700 mb-3">
                {floor === '0' ? 'Ground Floor' : `${floor}${floor === '1' ? 'st' : floor === '2' ? 'nd' : floor === '3' ? 'rd' : 'th'} Floor`}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {floorRooms.map((room) => {
                  const booking = getRoomBooking(room.room_number);
                  const currentStatus = getRoomStatus(room);
                  return (
                    <div
                      key={room._id}
                      className={`${
                        currentStatus === 'booked' ? 'bg-green-500' :
                        currentStatus === 'maintenance' ? 'bg-pink-300' :
                        'bg-red-500'
                      } rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer`}
                      onClick={() => {
                        setSelectedRoomNumber(room.room_number);
                        setShowBookings(true);
                      }}
                    >
                      {/* Status Block */}
                      <div className="h-20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-white font-bold text-sm mb-1">
                            {currentStatus === 'booked' ? 'OCCUPIED' :
                             currentStatus === 'maintenance' ? 'MAINTENANCE' :
                             'AVAILABLE'}
                          </div>
                          {booking && (booking.isVip || booking.vip || booking.isVIP || booking.VIP) && (
                            <span className="px-1 py-0.5 text-xs rounded bg-purple-600 text-white font-bold">
                              VIP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-2">
                        <div className="text-center">
                          <h3 className="text-xs font-semibold text-white mb-1">
                            Room {room.room_number}
                          </h3>
                          
                          {currentStatus === 'booked' && booking && (
                            <div className="bg-white/20 p-1 rounded text-xs">
                              <div className="font-semibold text-white truncate">{booking.name}</div>
                            </div>
                          )}
                          
                          {currentStatus === 'available' && (
                            <div className="mt-1">
                              <button 
                                className="w-full bg-white text-red-500 text-xs py-1 rounded hover:bg-gray-100 transition-colors font-semibold"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/bookingform');
                                }}
                              >
                                Book
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {rooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rooms found
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showBookings && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Room {selectedRoomNumber} - Booking Details
            </h2>
            <button
              onClick={() => {
                setShowBookings(false);
                setSelectedRoomNumber(null);
              }}
              className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded bg-white border"
            >
              Hide
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            <div className="grid gap-3 p-4">
              {bookings.filter(booking => {
                const checkOutDate = new Date(booking.checkOutDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isCurrentBooking = checkOutDate >= today;
                
                let isSelectedRoom = booking.roomNumber === selectedRoomNumber || booking.roomNumber === selectedRoomNumber?.toString();
                
                if (!isSelectedRoom && booking.roomAssigned) {
                  if (Array.isArray(booking.roomAssigned)) {
                    isSelectedRoom = booking.roomAssigned.some(room => 
                      (typeof room === 'object' ? room.room_number : room) === selectedRoomNumber ||
                      (typeof room === 'object' ? room.room_number : room) === selectedRoomNumber?.toString()
                    );
                  } else if (typeof booking.roomAssigned === 'object' && booking.roomAssigned.room_number) {
                    isSelectedRoom = booking.roomAssigned.room_number === selectedRoomNumber || booking.roomAssigned.room_number === selectedRoomNumber?.toString();
                  }
                }
                
                return isCurrentBooking && isSelectedRoom;
              }).map((booking) => (
                <div key={booking._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800 text-lg">{booking.name}</h3>
                        {(booking.isVip || booking.vip || booking.isVIP || booking.VIP) && (
                          <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 font-bold">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">GRC: {booking.grcNo}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium">
                          {booking.roomNumber || 
                           (booking.roomAssigned && Array.isArray(booking.roomAssigned) ? 
                             booking.roomAssigned.map(room => typeof room === 'object' ? room.room_number : room).join(', ') :
                             booking.roomAssigned?.room_number || 'N/A')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-medium">{booking.mobileNo || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adults:</span>
                        <span className="font-medium">{booking.noOfAdults || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Children:</span>
                        <span className="font-medium">{booking.noOfChildren || 0}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Days:</span>
                        <span className="font-medium">{booking.days || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rate:</span>
                        <span className="font-medium text-green-600">₹{booking.rate || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  {booking.remark && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-600 text-sm">Remarks:</span>
                      <p className="text-sm text-gray-800 mt-1">{booking.remark}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {bookings.filter(booking => {
                const checkOutDate = new Date(booking.checkOutDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isCurrentBooking = checkOutDate >= today;
                
                let isSelectedRoom = booking.roomNumber === selectedRoomNumber || booking.roomNumber === selectedRoomNumber?.toString();
                
                if (!isSelectedRoom && booking.roomAssigned) {
                  if (Array.isArray(booking.roomAssigned)) {
                    isSelectedRoom = booking.roomAssigned.some(room => 
                      (typeof room === 'object' ? room.room_number : room) === selectedRoomNumber ||
                      (typeof room === 'object' ? room.room_number : room) === selectedRoomNumber?.toString()
                    );
                  } else if (typeof booking.roomAssigned === 'object' && booking.roomAssigned.room_number) {
                    isSelectedRoom = booking.roomAssigned.room_number === selectedRoomNumber || booking.roomAssigned.room_number === selectedRoomNumber?.toString();
                  }
                }
                
                return isCurrentBooking && isSelectedRoom;
              }).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No current booking found for Room {selectedRoomNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EasyDashboard;