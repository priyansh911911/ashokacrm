import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import DashboardLoader from './DashboardLoader';

const RoomInspection = () => {
  const { axios } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedBooking, setSelectedBooking] = useState('');
  const [inspectionType, setInspectionType] = useState('checkout');
  const [checklist, setChecklist] = useState([]);
  const [editingInspection, setEditingInspection] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const [roomsRes, inspectionsRes] = await Promise.all([
          axios.get('/api/rooms/all', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/housekeeping/roominspections', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        setRooms(roomsRes.data);
        const inspectionsData = Array.isArray(inspectionsRes.data) ? inspectionsRes.data : inspectionsRes.data.inspections || [];
        setInspections(inspectionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchBookings = useCallback(async () => {
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
  }, [axios]);

  const fetchInspections = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/housekeeping/roominspections', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const inspectionsData = Array.isArray(response.data) ? response.data : response.data.inspections || [];
      setInspections(inspectionsData);
    } catch (error) {
      console.error('Error fetching inspections:', error);
      setInspections([]);
    }
  }, [axios]);

  const fetchRoomChecklist = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/housekeeping/checklist/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const checklistData = Array.isArray(response.data) ? response.data : response.data.checklist || [];
      setChecklist(checklistData.map(item => ({
        inventoryId: item.inventoryId || null,
        item: item.name || item.item || item.itemName,
        quantity: item.quantity || 1,
        status: 'ok',
        remarks: item.remarks || item.description || '',
        costPerUnit: item.costPerUnit || item.cost || 0
      })));
    } catch (error) {
      console.error('Error fetching room checklist:', error);
      setChecklist([]);
    }
  };

  const addChecklistItem = () => {
    setChecklist([...checklist, {
      inventoryId: null,
      item: '',
      quantity: 1,
      status: 'ok',
      remarks: '',
      costPerUnit: 0
    }]);
  };

  const updateChecklistItem = (index, field, value) => {
    setChecklist(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeChecklistItem = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  const calculateTotalCharges = () => {
    return checklist.reduce((total, item) => {
      if (item.status === 'missing' || item.status === 'damaged' || item.status === 'used') {
        return total + (item.quantity * (item.costPerUnit || 0));
      }
      return total;
    }, 0);
  };

  const editInspection = (inspection) => {
    setEditingInspection(inspection);
    setSelectedRoom(inspection.roomId?._id || inspection.roomId);
    setSelectedBooking(inspection.bookingId?._id || inspection.bookingId || '');
    setInspectionType(inspection.inspectionType);
    setChecklist(inspection.checklist || []);
    setShowForm(true);
  };

  const deleteInspection = async (inspectionId) => {
    if (!window.confirm('Are you sure you want to delete this inspection?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/room-inspections/${inspectionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Room inspection deleted successfully!');
      fetchInspections();
    } catch (error) {
      console.error('Error deleting inspection:', error);
      alert('Error deleting inspection: ' + (error.response?.data?.message || error.message));
    }
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
        cleaningType: inspectionType,
        checklist: checklist.filter(item => item.item.trim() !== ''),
        totalCharges: calculateTotalCharges(),
        status: 'completed',
        completedAt: new Date().toISOString()
      };

      if (editingInspection) {
        await axios.put(`/api/housekeeping/roominspections/${editingInspection._id}`, inspectionData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        alert('Room inspection updated successfully!');
      } else {
        await axios.post('/api/housekeeping/roominspection', inspectionData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        alert('Room inspection completed successfully!');
      }
      
      setSelectedRoom('');
      setSelectedBooking('');
      setChecklist([]);
      setEditingInspection(null);
      setShowForm(false);
      fetchInspections();
    } catch (error) {
      console.error('Error submitting inspection:', error);
      alert('Error submitting inspection: ' + (error.response?.data?.message || error.message));
    }
  };

  const InspectionForm = () => (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>{editingInspection ? 'Edit' : 'Add'} Room Inspection</h2>
        <button onClick={() => {
          setShowForm(false);
          setEditingInspection(null);
          setSelectedRoom('');
          setSelectedBooking('');
          setChecklist([]);
        }} className="text-gray-500 hover:text-gray-700">
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
              if (e.target.value && showForm) {
                fetchRoomChecklist(e.target.value);
              }
            }}
            className="p-3 rounded-lg w-full focus:outline-none focus:ring-2"
            style={{border: '1px solid hsl(45, 100%, 85%)'}}
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
            style={{border: '1px solid hsl(45, 100%, 85%)'}}
          >
            <option value="">Select Booking</option>
            {bookings.map((booking) => (
              <option key={booking._id} value={booking._id}>
                {typeof booking.name === 'object' ? booking.name?.name || 'Unknown' : booking.name} - Room {booking.roomNumber} - ₹{booking.rate || 0}
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
            style={{border: '1px solid hsl(45, 100%, 85%)'}}
          >
            <option value="checkout">Checkout</option>
            <option value="maintenance">Maintenance</option>
            <option value="regular">Regular</option>
            <option value="deep-clean">Deep Clean</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Checklist Items</h3>
          <button
            onClick={addChecklistItem}
            className="text-white px-4 py-2 rounded transition-colors"
            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
          >
            Add Item
          </button>
        </div>
        
        <div className="space-y-3">
          {checklist.map((item, index) => (
            <div key={index} className="grid grid-cols-6 gap-3 p-3 rounded" style={{border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'hsl(45, 100%, 98%)'}}>
              <div>
                <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Item Name</label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={item.item || ''}
                  onChange={(e) => updateChecklistItem(index, 'item', e.target.value)}
                  className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                  style={{border: '1px solid hsl(45, 100%, 85%)'}}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Quantity</label>
                <input
                  type="number"
                  placeholder="1"
                  value={item.quantity || 1}
                  onChange={(e) => updateChecklistItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                  style={{border: '1px solid hsl(45, 100%, 85%)'}}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Status</label>
                <select
                  value={item.status}
                  onChange={(e) => updateChecklistItem(index, 'status', e.target.value)}
                  className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                  style={{border: '1px solid hsl(45, 100%, 85%)'}}
                >
                  <option value="ok">OK</option>
                  <option value="missing">Missing</option>
                  <option value="damaged">Damaged</option>
                  <option value="used">Used</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Cost/Unit</label>
                <input
                  type="number"
                  placeholder="0"
                  value={item.costPerUnit || 0}
                  onChange={(e) => updateChecklistItem(index, 'costPerUnit', parseFloat(e.target.value) || 0)}
                  className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                  style={{border: '1px solid hsl(45, 100%, 85%)'}}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Remarks</label>
                <input
                  type="text"
                  placeholder="Add remarks"
                  value={item.remarks || ''}
                  onChange={(e) => updateChecklistItem(index, 'remarks', e.target.value)}
                  className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                  style={{border: '1px solid hsl(45, 100%, 85%)'}}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{color: 'hsl(45, 100%, 30%)'}}>Action</label>
                <button
                  onClick={() => removeChecklistItem(index)}
                  className="w-full p-2 rounded text-red-600 hover:text-red-800 transition-colors border"
                  style={{border: '1px solid #fecaca'}}
                >
                  <Trash2 size={16} className="mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
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
        >
          {editingInspection ? 'Update' : 'Submit'} Inspection
        </button>
      </div>
    </div>
  );

  if (isInitialLoading) {
    return <DashboardLoader pageName="Room Inspection" />;
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>Room Inspection</h1>
          <button
            onClick={() => setShowForm(true)}
            className="text-white px-4 py-2 rounded transition-colors flex items-center"
            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
          >
            <Plus size={16} className="mr-2" /> Add Inspection
          </button>
        </div>
        
        {showForm && <InspectionForm />}

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
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Total Charges</th>
                  <th className="px-4 py-3 text-left text-sm font-medium" style={{color: 'hsl(45, 100%, 20%)'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : inspections.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">No inspections found</td>
                  </tr>
                ) : (
                  inspections.map(inspection => {
                    const room = rooms.find(r => r._id === (inspection.roomId?._id || inspection.roomId));
                    const booking = bookings.find(b => b._id === (inspection.bookingId?._id || inspection.bookingId));
                    
                    return (
                      <tr key={inspection._id} className="border-t" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                        <td className="px-4 py-3 text-sm font-medium">
                          {(() => {
                            // Try to find room from rooms array first
                            if (room) {
                              return `Room ${room.roomNumber || room.room_number || room.number || 'Unknown'}`;
                            }
                            // If inspection has populated roomId object
                            if (inspection.roomId && typeof inspection.roomId === 'object') {
                              return `Room ${inspection.roomId.roomNumber || inspection.roomId.room_number || inspection.roomId.number || 'Unknown'}`;
                            }
                            // If roomId is just a string, try to find in rooms array
                            if (typeof inspection.roomId === 'string') {
                              const foundRoom = rooms.find(r => r._id === inspection.roomId);
                              if (foundRoom) {
                                return `Room ${foundRoom.roomNumber || foundRoom.room_number || foundRoom.number || 'Unknown'}`;
                              }
                            }
                            return 'N/A';
                          })()} 
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {booking ? (
                            <div>
                              <div className="font-medium">{typeof booking.name === 'object' ? booking.name?.name || 'Unknown' : booking.name}</div>
                              <div className="text-xs text-gray-500">GRC: {booking.grcNo}</div>
                            </div>
                          ) : inspection.bookingId?.name ? (
                            <div>
                              <div className="font-medium">{typeof inspection.bookingId.name === 'object' ? inspection.bookingId.name?.name || 'Unknown' : inspection.bookingId.name}</div>
                              <div className="text-xs text-gray-500">GRC: {inspection.bookingId.grcNo}</div>
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
                            <button 
                              onClick={() => editInspection(inspection)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => deleteInspection(inspection._id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                            >
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
