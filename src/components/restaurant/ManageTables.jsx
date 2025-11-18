import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import Pagination from '../common/Pagination';
import { useSocket } from '../../context/SocketContext';

const ManageTables = () => {
  const { axios } = useAppContext();
  const { socket } = useSocket();
  const [tables, setTables] = useState([]);
  const [newTable, setNewTable] = useState({
    tableNumber: '',
    capacity: 1,
    location: 'dining',
    status: 'available',
    isActive: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  useEffect(() => {
    fetchTables();
    
    if (socket) {
      socket.on('table-status-updated', (data) => {
        setTables(prev => prev.map(table => 
          table._id === data.tableId 
            ? { ...table, status: data.status }
            : table
        ));
      });

      socket.on('table-created', (data) => {
        setTables(prev => [...prev, data.table]);
      });

      socket.on('table-updated', (data) => {
        setTables(prev => prev.map(table => 
          table._id === data.table._id 
            ? data.table
            : table
        ));
      });
    }

    return () => {
      if (socket) {
        socket.off('table-status-updated');
        socket.off('table-created');
        socket.off('table-updated');
      }
    };
  }, [socket]);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTable(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Auto-format table number based on location
      const tableData = {
        ...newTable,
        tableNumber: newTable.location === 'rooftop' && !newTable.tableNumber.startsWith('T') 
          ? `T${newTable.tableNumber}` 
          : newTable.tableNumber
      };
      
      console.log('Sending table data:', tableData);
      await axios.post('/api/restaurant/tables', tableData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Table created successfully!');
      setNewTable({
        tableNumber: '',
        capacity: 1,
        location: 'dining',
        status: 'available',
        isActive: true,
      });
      fetchTables(); // Refresh the tables list
    } catch (error) {
      console.error('Error creating table:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || 'Failed to create table!';
      alert(errorMessage);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/restaurant/tables/${id}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // WebSocket will handle the update
    } catch (error) {
      console.error('Error updating table status:', error);
      alert('Failed to update table status!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-400';
      case 'occupied':
        return 'bg-red-100 text-red-800 border-red-400';
      case 'reserved':
        return 'bg-blue-100 text-blue-800 border-blue-400';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-background font-inter p-2 sm:p-4 md:p-8">
      <div className="container mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-text mb-6 text-center">Manage Tables</h1>

        {/* Form to add a new table */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">Add a New Table</h2>
          <form onSubmit={handleAddTable} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label htmlFor="tableNumber" className="block text-sm font-medium text-text">
                Table Number {newTable.location === 'rooftop' && <span className="text-xs text-gray-500">(T prefix will be added automatically)</span>}
              </label>
              <input
                type="text"
                name="tableNumber"
                id="tableNumber"
                value={newTable.tableNumber}
                onChange={handleInputChange}
                required
                placeholder={newTable.location === 'rooftop' ? '101 (will become T101)' : '1'}
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 transition duration-200 ease-in-out hover:border-hover"
              />
            </div>
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-text">Capacity</label>
              <input
                type="number"
                name="capacity"
                id="capacity"
                value={newTable.capacity}
                onChange={handleInputChange}
                required
                min="1"
                max="4"
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 transition duration-200 ease-in-out hover:border-hover"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-text">Location</label>
              <select
                name="location"
                id="location"
                value={newTable.location}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 transition duration-200 ease-in-out hover:border-hover"
              >
                <option value="dining">Dining</option>
                <option value="rooftop">Rooftop</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-text">Initial Status</label>
              <select
                name="status"
                id="status"
                value={newTable.status}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-border shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 transition duration-200 ease-in-out hover:border-hover"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={newTable.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary rounded-md border-border focus:ring-primary"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-text">Is Active</label>
            </div>
            <div className="col-span-1 sm:col-span-2 md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-text bg-primary hover:bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200 ease-in-out"
              >
                Add Table
              </button>
            </div>
          </form>
        </div>

        {/* Grid to display tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {tables.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(table => (
            <div key={table._id || table.id} className={`bg-white p-4 sm:p-6 rounded-2xl shadow-lg border-b-4 ${getStatusColor(table.status)} transition duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1`}>
              <h3 className="text-xl font-bold mb-2">{`Table ${table.tableNumber}`}</h3>
              <p className="text-sm text-gray-600">Capacity: <span className="font-semibold">{table.capacity}</span></p>
              <p className="text-sm text-gray-600">Location: <span className="font-semibold capitalize">{table.location.replace('_', ' ')}</span></p>
              <p className="text-sm text-gray-600">Status: <span className="font-semibold capitalize">{table.status}</span></p>
              <p className="text-sm text-gray-600">Active: <span className="font-semibold">{table.isActive ? 'Yes' : 'No'}</span></p>

              {/* Status Update Buttons */}
              <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
                {['available', 'occupied', 'reserved', 'maintenance'].map(statusOption => (
                  <button
                    key={statusOption}
                    onClick={() => handleStatusUpdate(table._id || table.id, statusOption)}
                    disabled={table.status === statusOption}
                    className={`
                      px-3 py-1 text-xs font-medium rounded-full
                      ${table.status === statusOption
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-primary text-text hover:bg-hover transition duration-150'
                      }
                    `}
                  >
                    Set to {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(tables.length / itemsPerPage)}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={tables.length}
        />
      </div>
    </div>
  );
};

export default ManageTables;
