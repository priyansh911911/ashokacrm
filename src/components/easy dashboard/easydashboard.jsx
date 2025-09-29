import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

import {
  Home,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Clock,
  Plus,
  Eye
} from 'lucide-react';

const EasyDashboard = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cabBookings, setCabBookings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookings, setShowBookings] = useState(false);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState(null);


  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch data with individual error handling
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
      
      const reservationsRes = await axios.get('/api/reservations/all', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error('Reservations API error (expected if not implemented):', err.response?.status);
        return { data: [] };
      });
      
      const cabBookingsRes = await axios.get('/api/cab/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error('Cab bookings API error:', err);
        return { data: { bookings: [] } };
      });
      
      const reservationDetailsRes = await axios.get('/api/reservations', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(err => {
        console.error('Reservation details API error:', err);
        return { data: { reservations: [] } };
      });
      
      setRooms(Array.isArray(roomsRes.data) ? roomsRes.data : []);
      const allBookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : bookingsRes.data.bookings || [];
      const reservationsFromAPI = Array.isArray(reservationDetailsRes.data.reservations) ? reservationDetailsRes.data.reservations : [];
      
      // Convert reservations to booking format for unified handling
      const convertedReservations = reservationsFromAPI.map(reservation => ({
        ...reservation,
        name: reservation.guestName,
        roomNumber: reservation.roomAssigned && Array.isArray(reservation.roomAssigned) ? 
          reservation.roomAssigned.map(room => typeof room === 'object' ? room.room_number : room).join(',') :
          reservation.roomAssigned?.room_number || null
      }));
      
      // Combine bookings and converted reservations
      const combinedBookings = [...allBookings, ...convertedReservations];
      console.log('Fetched - Rooms:', roomsRes.data?.length || 0);
      console.log('Fetched - Bookings:', allBookings.length);
      console.log('Fetched - Reservations:', reservationsFromAPI.length);
      console.log('Converted reservations:', convertedReservations);
      console.log('Combined bookings:', combinedBookings);
      setBookings(combinedBookings);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      
      const cabBookingsData = Array.isArray(cabBookingsRes.data.bookings) ? cabBookingsRes.data.bookings : [];
      setCabBookings(cabBookingsData);
      console.log('Fetched - Cab Bookings:', cabBookingsData.length);
      
      const reservationsData = Array.isArray(reservationDetailsRes.data.reservations) ? reservationDetailsRes.data.reservations : [];
      setReservations(reservationsData);
      console.log('Fetched - Reservations:', reservationsData.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoomStats = () => {
    const total = rooms.length;
    const available = rooms.filter(room => room.status === 'available').length;
    const booked = rooms.filter(room => room.status === 'booked').length;
    const maintenance = rooms.filter(room => room.status === 'maintenance').length;
    
    return { total, available, booked, maintenance };
  };

  const getTodayBookings = () => {
    const today = new Date().toDateString();
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkInDate).toDateString();
      const checkOut = new Date(booking.checkOutDate).toDateString();
      return checkIn === today || checkOut === today;
    });
  };

  const roomStats = getRoomStats();
  const todayBookings = getTodayBookings();
  const checkIns = todayBookings.filter(b => new Date(b.checkInDate).toDateString() === new Date().toDateString());
  const checkOuts = todayBookings.filter(b => new Date(b.checkOutDate).toDateString() === new Date().toDateString());

  const getRoomBooking = (roomNumber) => {
    return bookings.find(booking => {
      const isValidStatus = booking.status === 'Confirmed' || booking.status === 'Booked' || booking.status === 'Reserved';
      
      // Check for regular bookings (now includes converted reservations with roomNumber)
      if (booking.roomNumber === roomNumber || booking.roomNumber === roomNumber.toString()) {
        return isValidStatus;
      }
      
      // Check for original reservation bookings with roomAssigned
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

  const getCabBookingForGuest = (guestName, roomNumber) => {
    return cabBookings.find(cabBooking => 
      (cabBooking.guestName === guestName || cabBooking.roomNumber === roomNumber) &&
      (cabBooking.status === 'confirmed' || cabBooking.status === 'pending' || cabBooking.status === 'on_route')
    );
  };

  const getReservationForGuest = (guestName, grcNo) => {
    return reservations.find(reservation => 
      (reservation.guestName === guestName || reservation.grcNo === grcNo) &&
      (reservation.status === 'Confirmed' || reservation.status === 'Tentative')
    );
  };

  const getRoomStatus = (room) => {
    const booking = getRoomBooking(room.room_number);
    if (booking) {
      return 'booked';
    }
    return room.status === 'maintenance' ? 'maintenance' : 'available';
  };



  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">
          EASY DASHBOARD
        </h1>
      </div>







      {/* Room Cards Grid */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">All Rooms</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {rooms.map((room) => {
            const booking = getRoomBooking(room.room_number);
            const currentStatus = getRoomStatus(room);
            return (
              <div
                key={room._id}
                className="bg-primary/50 border border-gray-200 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedRoomNumber(room.room_number);
                  setShowBookings(true);
                }}
              >
                {/* Image Section */}
                <div className="h-24 bg-gray-200 relative overflow-hidden">
                  {room.images && room.images.length > 0 && room.images[0].startsWith("data:image/") ? (
                    <img
                      src={room.images[0]}
                      alt={room.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Home size={20} className="text-gray-400" />
                    </div>
                  )}
                  
                  <div className="absolute top-1 left-1 right-1 flex justify-between">
                    <div className="flex flex-col gap-1">
                      <span className={`px-1 py-0.5 text-xs rounded ${
                        currentStatus === 'available' ? 'bg-green-100 text-green-800' :
                        currentStatus === 'booked' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Unknown'}
                      </span>
                      {booking && (booking.isVip || booking.vip || booking.isVIP || booking.VIP) && (
                        <span className="px-1 py-0.5 text-xs rounded bg-purple-100 text-purple-800 font-bold">
                          VIP
                        </span>
                      )}
                    </div>
                    <span className="px-1 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                      {(() => {
                        const category = categories.find(cat => 
                          cat._id === (room.category?._id || room.category || room.categoryId)
                        );
                        return category?.name || 'Standard';
                      })()}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-3">
                  <div className="text-center">
                    <h3 className="text-sm font-semibold text-dark mb-1">
                      Room {room.room_number}
                    </h3>
                    <div className="text-xs text-dark/70 mb-1">
                      {room.type || 'Standard'} • ₹{room.price}/night
                    </div>
                    
                    {currentStatus === 'booked' && booking && (
                      <div className="bg-red-50 p-1 rounded text-xs">
                        <div className="font-semibold text-red-800 truncate">{booking.name}</div>
                      </div>
                    )}
                    
                    {currentStatus === 'available' && (
                      <div className="mt-1">
                        <button 
                          className="w-full bg-green-500 text-white text-xs py-1 rounded hover:bg-green-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/bookingform');
                          }}
                        >
                          Book Now
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {rooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rooms found
          </div>
        )}
      </div>



      {/* Bookings Container - Show only when clicked */}
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
                
                // Check for regular bookings
                let isSelectedRoom = booking.roomNumber === selectedRoomNumber || booking.roomNumber === selectedRoomNumber?.toString();
                
                // Check for reservation bookings with roomAssigned
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
                  
                  {/* Cab Booking Details */}
                  {(() => {
                    const cabBooking = getCabBookingForGuest(booking.name, booking.roomNumber);
                    if (cabBooking) {
                      return (
                        <div className="mt-3 pt-3 border-t border-blue-200 bg-blue-50 p-3 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-blue-600 text-sm font-semibold">🚗 Cab Service</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              cabBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              cabBooking.status === 'on_route' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {cabBooking.status.charAt(0).toUpperCase() + cabBooking.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">From:</span>
                              <span className="font-medium ml-1">{cabBooking.pickupLocation}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">To:</span>
                              <span className="font-medium ml-1">{cabBooking.destination}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Pickup Time:</span>
                              <span className="font-medium ml-1">{new Date(cabBooking.pickupTime).toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Cab Type:</span>
                              <span className="font-medium ml-1 capitalize">{cabBooking.cabType}</span>
                            </div>
                            {cabBooking.driverName && (
                              <div>
                                <span className="text-gray-600">Driver:</span>
                                <span className="font-medium ml-1">{cabBooking.driverName}</span>
                              </div>
                            )}
                            {cabBooking.driverContact && (
                              <div>
                                <span className="text-gray-600">Contact:</span>
                                <span className="font-medium ml-1">{cabBooking.driverContact}</span>
                              </div>
                            )}
                            {cabBooking.vehicleNumber && (
                              <div>
                                <span className="text-gray-600">Vehicle:</span>
                                <span className="font-medium ml-1">{cabBooking.vehicleNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Vehicle Details for Reservations */}
                  {booking.vehicleDetails && (booking.vehicleDetails.vehicleNumber || booking.vehicleDetails.driverName) && (
                    <div className="mt-3 pt-3 border-t border-green-200 bg-green-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-600 text-sm font-semibold">🚗 Vehicle Details</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {booking.vehicleDetails.vehicleNumber && (
                          <div>
                            <span className="text-gray-600">Vehicle Number:</span>
                            <span className="font-medium ml-1">{booking.vehicleDetails.vehicleNumber}</span>
                          </div>
                        )}
                        {booking.vehicleDetails.vehicleType && (
                          <div>
                            <span className="text-gray-600">Vehicle Type:</span>
                            <span className="font-medium ml-1">{booking.vehicleDetails.vehicleType}</span>
                          </div>
                        )}
                        {booking.vehicleDetails.vehicleModel && (
                          <div>
                            <span className="text-gray-600">Vehicle Model:</span>
                            <span className="font-medium ml-1">{booking.vehicleDetails.vehicleModel}</span>
                          </div>
                        )}
                        {booking.vehicleDetails.driverName && (
                          <div>
                            <span className="text-gray-600">Driver Name:</span>
                            <span className="font-medium ml-1">{booking.vehicleDetails.driverName}</span>
                          </div>
                        )}
                        {booking.vehicleDetails.driverMobile && (
                          <div>
                            <span className="text-gray-600">Driver Mobile:</span>
                            <span className="font-medium ml-1">{booking.vehicleDetails.driverMobile}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Reservation Details */}
                  {(booking.reservationType || booking.planPackage || booking.purposeOfVisit) && (
                    <div className="mt-3 pt-3 border-t border-purple-200 bg-purple-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-purple-600 text-sm font-semibold">🏨 Reservation Info</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {booking.reservationType && (
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <span className="font-medium ml-1">{booking.reservationType}</span>
                          </div>
                        )}
                        {booking.planPackage && (
                          <div>
                            <span className="text-gray-600">Package:</span>
                            <span className="font-medium ml-1">{booking.planPackage}</span>
                          </div>
                        )}
                        {booking.purposeOfVisit && (
                          <div>
                            <span className="text-gray-600">Purpose:</span>
                            <span className="font-medium ml-1">{booking.purposeOfVisit}</span>
                          </div>
                        )}
                        {booking.arrivalFrom && (
                          <div>
                            <span className="text-gray-600">Arrival From:</span>
                            <span className="font-medium ml-1">{booking.arrivalFrom}</span>
                          </div>
                        )}
                        {booking.specialRequests && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Special Requests:</span>
                            <span className="font-medium ml-1">{booking.specialRequests}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
              }
              
              {bookings.filter(booking => {
                const checkOutDate = new Date(booking.checkOutDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isCurrentBooking = checkOutDate >= today;
                
                // Check for regular bookings
                let isSelectedRoom = booking.roomNumber === selectedRoomNumber || booking.roomNumber === selectedRoomNumber?.toString();
                
                // Check for reservation bookings with roomAssigned
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