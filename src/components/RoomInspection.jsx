import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';

const RoomInspection = () => {
  const { axios } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedBooking, setSelectedBooking] = useState('');
  const [inspectionType, setInspectionType] = useState('checkout');
  const [checklist, setChecklist] = useState([]);

  useEffect(() => {
    fetchRooms();
    fetchBookings();
    fetchInspections();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/rooms/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(Array.isArray(response.data) ? response.data : response.data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try multiple possible endpoints
      const endpoints = [
        '/api/housekeeping/room-inspections',
        '/api/inspections/all',
        '/api/inspections',
        '/api/room-inspections'
      ];
      
      let inspectionsData = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
          inspectionsData = Array.isArray(response.data) ? response.data : response.data.inspections || [];
          break;
        } catch (err) {
          console.log(`Failed endpoint ${endpoint}:`, err.response?.status);
        }
      }
      
      // Add local inspections if any
      const localInspections = JSON.parse(localStorage.getItem('localInspections') || '[]');
      inspectionsData = [...inspectionsData, ...localInspections];
      
      setInspections(inspectionsData);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      // Load only local inspections if API fails
      const localInspections = JSON.parse(localStorage.getItem('localInspections') || '[]');
      setInspections(localInspections);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomChecklist = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/rooms/checklist/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const checklistData = Array.isArray(response.data) ? response.data : response.data.checklist || [];
      setChecklist(checklistData.map(item => ({
        item: item.name || item.item || item.itemName,
        quantity: item.quantity || 1,
        status: 'ok',
        remarks: item.remarks || item.description || '',
        costPerUnit: item.costPerUnit || item.cost || 0
      })));
    } catch (error) {
      console.error('Error fetching room checklist:', error);
      // Don't set default items - let user add manually
      setChecklist([]);
    }
  };

  const addChecklistItem = () => {
    setChecklist([...checklist, {
      item: '',
      quantity: 1,
      status: 'ok',
      remarks: '',
      costPerUnit: 0
    }]);
  };

  const updateChecklistItem = (index, field, value) => {
    const updated = [...checklist];
    updated[index][field] = value;
    setChecklist(updated);
  };

  const removeChecklistItem = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const calculateTotalCharges = () => {
    return checklist.reduce((total, item) => {
      if (item.status === 'missing' || item.status === 'damaged') {
        return total + (item.quantity * (item.costPerUnit || 0));
      }
      return total;
    }, 0);
  };

  const submitInspection = async () => {
    if (!selectedRoom) {
      alert('Please select a room');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const inspectionData = {
        roomId: selectedRoom,
        bookingId: selectedBooking || null,
        inspectedBy: (userId && userId !== 'undefined') ? userId : '507f1f77bcf86cd799439011',
        inspectionType,
        checklist: checklist.filter(item => item.item.trim() !== ''),
        totalCharges: calculateTotalCharges(),
        status: 'completed',
        inspectionDate: new Date().toISOString()
      };

      console.log('Submitting inspection data:', inspectionData);

      await axios.post('/api/housekeeping/room-inspection', inspectionData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      alert('Room inspection completed successfully!');
      setSelectedRoom('');
      setSelectedBooking('');
      setChecklist([]);
      setShowForm(false);
      fetchInspections();
    } catch (error) {
      console.error('Error submitting inspection:', error);
      console.error('Error details:', error.response?.data);
      alert('Error submitting inspection: ' + (error.response?.data?.message || error.message));
    }
  };

  const InspectionForm = () => (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Add Room Inspection</h2>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 20%)'}}>Room</label>
          <select
            value={selectedRoom}
            onChange={(e) => {
              setSelectedRoom(e.target.value);
              if (e.target.value) {
                fetchRoomChecklist(e.target.value);
              }
            }}
            className="p-3 rounded-lg w-full focus:outline-none focus:ring-2"
            style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                Room {room.roomNumber || room.room_number}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 20%)'}}>Booking</label>
          <select
            value={selectedBooking}
            onChange={(e) => setSelectedBooking(e.target.value)}
            className="p-3 rounded-lg w-full focus:outline-none focus:ring-2"
            style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
          >
            <option value="">Select Booking</option>
            {bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>
                {booking.name} - Room {booking.roomNumber} - ₹{booking.rate || 0}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 20%)'}}>Inspection Type</label>
          <select
            value={inspectionType}
            onChange={(e) => setInspectionType(e.target.value)}
            className="p-3 rounded-lg w-full focus:outline-none focus:ring-2"
            style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
          >
            <option value="checkout">Checkout</option>
            <option value="maintenance">Maintenance</option>
            <option value="regular">Regular</option>
            <option value="deep-clean">Deep Clean</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-3">
          <h3 className="text-base sm:text-lg font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Checklist Items</h3>
          <button
            onClick={addChecklistItem}
            className="text-white px-3 sm:px-4 py-2 rounded transition-colors text-sm sm:text-base w-full sm:w-auto"
            style={{backgroundColor: 'hsl(45, 43%, 58%)'}} 
            onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
          >
            Add Item
          </button>
        </div>
        
        {/* Column Headers - only show when there are items */}
        {checklist.length > 0 && (
          <div className="hidden lg:grid lg:grid-cols-6 gap-3 mb-2 px-3">
            <label className="text-xs font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Item Name</label>
            <label className="text-xs font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Quantity</label>
            <label className="text-xs font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Status</label>
            <label className="text-xs font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Cost/Unit</label>
            <label className="text-xs font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Remarks</label>
            <label className="text-xs font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Action</label>
          </div>
        )}
        
        {checklist.map((item, index) => (
          <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-3 p-3 rounded" style={{border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'hsl(45, 100%, 98%)'}}>
            <div className="lg:hidden">
              <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Item Name</label>
            </div>
            <input
              type="text"
              placeholder="Item name"
              value={item.item}
              onChange={(e) => updateChecklistItem(index, 'item', e.target.value)}
              className="p-2 rounded focus:outline-none focus:ring-2"
              style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
            />
            <div className="lg:hidden">
              <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Quantity</label>
            </div>
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateChecklistItem(index, 'quantity', parseInt(e.target.value))}
              className="p-2 rounded focus:outline-none focus:ring-2"
              style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
            />
            <div className="lg:hidden">
              <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Status</label>
            </div>
            <select
              value={item.status}
              onChange={(e) => updateChecklistItem(index, 'status', e.target.value)}
              className="p-2 rounded focus:outline-none focus:ring-2"
              style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
            >
              <option value="ok">OK</option>
              <option value="missing">Missing</option>
              <option value="damaged">Damaged</option>
            </select>
            <div className="lg:hidden">
              <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Cost per Unit</label>
            </div>
            <input
              type="number"
              placeholder="Cost per unit"
              value={item.costPerUnit}
              onChange={(e) => updateChecklistItem(index, 'costPerUnit', parseFloat(e.target.value))}
              className="p-2 rounded focus:outline-none focus:ring-2"
              style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
            />
            <div className="lg:hidden">
              <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Remarks</label>
            </div>
            <input
              type="text"
              placeholder="Remarks"
              value={item.remarks}
              onChange={(e) => updateChecklistItem(index, 'remarks', e.target.value)}
              className="p-2 rounded focus:outline-none focus:ring-2"
              style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
            />
            <button
              onClick={() => removeChecklistItem(index)}
              className="p-2 rounded text-red-600 hover:text-red-800 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="text-right">
          <span className="text-lg font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
            Total Charges: ₹{calculateTotalCharges()}
          </span>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowForm(false)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={submitInspection}
          className="text-white px-4 py-2 rounded transition-colors"
          style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
        >
          Submit Inspection
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>Room Inspection</h1>
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-4 py-2 rounded transition-colors flex items-center"
            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
          >
            <Plus size={16} className="mr-2" /> Add Inspection
          </button>
        </div>
        
        {showForm && <InspectionForm />}

        {/* Inspections Table */}
        <div className="bg-white rounded-lg shadow" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
          <div className="p-4 border-b" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
            <h2 className="text-lg font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Room Inspections</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{backgroundColor: 'hsl(45, 100%, 98%)'}}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Room No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Booking</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Inspection Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Inspector</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Total Charges</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : inspections.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No inspections found</td>
                  </tr>
                ) : (
                  inspections.map(inspection => {
                    const room = rooms.find(r => r._id === inspection.roomId);
                    const booking = bookings.find(b => b._id === inspection.bookingId);
                    return (
                      <tr key={inspection._id} className="border-t" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                        <td className="px-4 py-3 text-sm font-medium">{room?.roomNumber || room?.room_number || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          {booking ? (
                            <div>
                              <div className="font-medium">{booking.name}</div>
                              <div className="text-xs text-gray-500">GRC: {booking.grcNo}</div>
                            </div>
                          ) : 'No Booking'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded text-xs font-medium" style={{
                            backgroundColor: inspection.inspectionType === 'checkout' ? 'hsl(0, 100%, 95%)' :
                                           inspection.inspectionType === 'maintenance' ? 'hsl(45, 100%, 95%)' :
                                           inspection.inspectionType === 'regular' ? 'hsl(120, 100%, 95%)' : 'hsl(240, 100%, 95%)',
                            color: inspection.inspectionType === 'checkout' ? 'hsl(0, 100%, 30%)' :
                                   inspection.inspectionType === 'maintenance' ? 'hsl(45, 100%, 30%)' :
                                   inspection.inspectionType === 'regular' ? 'hsl(120, 100%, 30%)' : 'hsl(240, 100%, 30%)'
                          }}>
                            {inspection.inspectionType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{inspection.inspectedBy?.name || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">
                          {inspection.createdAt ? new Date(inspection.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            inspection.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {inspection.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{color: inspection.totalCharges > 0 ? 'hsl(0, 100%, 40%)' : 'hsl(120, 100%, 40%)'}}>
                          ₹{inspection.totalCharges || 0}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors">
                              <Edit size={16} />
                            </button>
                            <button className="text-red-600 hover:text-red-800 p-1 rounded transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomInspection;