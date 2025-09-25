import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

const RoomChecklist = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('https://ashoka-backend.vercel.app/api/rooms/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(Array.isArray(data) ? data : data.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchChecklist = async (roomId) => {
    if (!roomId) return;
    setLoading(true);
    try {
      const response = await fetch(`https://ashoka-backend.vercel.app/api/inventory/room/${roomId}/checklist`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.checklist && data.checklist.items) {
          setChecklist(data.checklist.items.map(item => ({
            inventoryId: item.inventoryId,
            itemName: item.itemName,
            isPresent: item.isPresent,
            notes: item.notes || ''
          })));
        } else {
          // Create default checklist items
          const defaultItems = [
            { inventoryId: null, itemName: 'Towels', isPresent: true, notes: '' },
            { inventoryId: null, itemName: 'Bed Sheets', isPresent: true, notes: '' },
            { inventoryId: null, itemName: 'Pillows', isPresent: true, notes: '' },
            { inventoryId: null, itemName: 'Soap', isPresent: true, notes: '' },
            { inventoryId: null, itemName: 'Shampoo', isPresent: true, notes: '' }
          ];
          setChecklist(defaultItems);
        }
      } else {
        // Create default checklist items
        const defaultItems = [
          { inventoryId: null, itemName: 'Towels', isPresent: true, notes: '' },
          { inventoryId: null, itemName: 'Bed Sheets', isPresent: true, notes: '' },
          { inventoryId: null, itemName: 'Pillows', isPresent: true, notes: '' },
          { inventoryId: null, itemName: 'Soap', isPresent: true, notes: '' },
          { inventoryId: null, itemName: 'Shampoo', isPresent: true, notes: '' }
        ];
        setChecklist(defaultItems);
      }
    } catch (error) {
      console.error('Error fetching checklist:', error);
      const defaultItems = [
        { inventoryId: null, itemName: 'Towels', isPresent: true, notes: '' },
        { inventoryId: null, itemName: 'Bed Sheets', isPresent: true, notes: '' },
        { inventoryId: null, itemName: 'Pillows', isPresent: true, notes: '' },
        { inventoryId: null, itemName: 'Soap', isPresent: true, notes: '' },
        { inventoryId: null, itemName: 'Shampoo', isPresent: true, notes: '' }
      ];
      setChecklist(defaultItems);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomChange = (roomId) => {
    setSelectedRoom(roomId);
    fetchChecklist(roomId);
  };

  const toggleChecklistItem = (index) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      isPresent: !updatedChecklist[index].isPresent
    };
    setChecklist(updatedChecklist);
  };

  const updateNotes = (index, notes) => {
    const updatedChecklist = [...checklist];
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      notes
    };
    setChecklist(updatedChecklist);
  };

  const saveChecklist = async () => {
    if (!selectedRoom) {
      toast.error('Please select a room first');
      return;
    }
    
    if (checklist.length === 0) {
      toast.error('No checklist items to save');
      return;
    }
    
    setLoading(true);

    try {
      const payload = {
        housekeepingTaskId: null, // This would come from housekeeping context
        items: checklist.map(item => ({
          inventoryId: item.inventoryId,
          itemName: item.itemName,
          isPresent: item.isPresent,
          notes: item.notes
        }))
      };

      const response = await fetch(`https://ashoka-backend.vercel.app/api/inventory/room/${selectedRoom}/checklist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success('Checklist saved successfully!');
      } else {
        const errorData = await response.json();
        toast.error(`Failed to save checklist: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving checklist:', error);
      toast.error('Error saving checklist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#1f2937] flex items-center gap-2">
          <CheckSquare className="text-green-600" size={24} />
          Room Inventory Checklist
        </h2>
        {selectedRoom && (
          <button
            onClick={saveChecklist}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <Save size={16} />
            Save Checklist
          </button>
        )}
      </div>

      {/* Room Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
        <select
          value={selectedRoom}
          onChange={(e) => handleRoomChange(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Choose a room</option>
          {rooms.map(room => (
            <option key={room._id} value={room._id}>
              Room {room.roomNumber} - {room.category?.name || room.roomType?.name || 'Standard'}
            </option>
          ))}
        </select>
      </div>

      {/* Checklist */}
      {selectedRoom && (
        <div>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-4">Inventory Items</h3>
              {checklist.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1"
                      onClick={() => toggleChecklistItem(index)}
                    >
                      {item.isPresent ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Square className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <p className={`font-medium ${item.isPresent ? 'text-green-700' : 'text-red-700'}`}>
                          {item.itemName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${item.isPresent ? 'text-green-600' : 'text-red-600'}`}>
                        {item.isPresent ? 'Present' : 'Missing'}
                      </p>
                    </div>
                  </div>
                  {!item.isPresent && (
                    <div className="mt-2">
                      <input
                        type="text"
                        placeholder="Add notes about missing item"
                        value={item.notes}
                        onChange={(e) => updateNotes(index, e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoomChecklist;