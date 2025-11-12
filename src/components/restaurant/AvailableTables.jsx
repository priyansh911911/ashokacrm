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

  useEffect(() => {
    fetchTables();
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

  const updateTableStatus = async (tableId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast.error('Please login again');
        return;
      }
      await axios.patch(`/api/restaurant/tables/${tableId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTables();
      showToast.success('✅ Table status updated successfully!');
    } catch (error) {
      console.error('Error updating table status:', error);
      if (error.response?.status === 401 || error.response?.data?.message === 'Invalid token') {
        localStorage.removeItem('token');
        showToast.error('Session expired. Please login again.');
        window.location.href = '/login';
      } else {
        showToast.error('Failed to update table status');
      }
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

  const handleTableClick = (table) => {
    if (table.status === 'available') {
      navigate('/resturant/order-table', { 
        state: { 
          tableNumber: table.tableNumber,
          tableId: table._id,
          capacity: table.capacity || 4
        }
      });
    }
  };

  const TableComponent = ({ table }) => {
    const style = getTableStyle(table.status);
    const isAvailable = table.status === 'available';
    const capacity = table.capacity || 4;
    
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
            transition-all duration-200 cursor-pointer hover:shadow-lg
            ${isAvailable ? 'hover:bg-green-50 hover:border-green-300' : ''}
          `}
          onClick={() => handleTableClick(table)}
        >
          {/* Table number */}
          <div className="font-bold text-lg mb-2">
            {table.tableNumber}
          </div>
          
          {/* Capacity */}
          <div className="flex items-center text-sm mb-2">
            <Users size={14} className="mr-1" />
            {capacity}
          </div>
          
          {/* Status indicator */}
          {table.status === 'occupied' && (
            <div className="text-xs bg-white text-gray-800 px-2 py-1 rounded">
              17:00 PM
            </div>
          )}
          
          {table.status === 'reserved' && (
            <div className="text-xs bg-white text-gray-800 px-2 py-1 rounded">
              In Progress
            </div>
          )}
        </div>
        
        {/* Dynamic chair representations based on capacity */}
        {renderChairs()}
        
        {/* Action buttons for available tables */}
        {isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTableStatus(table._id, 'reserved');
                }}
                className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
              >
                Reserve
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateTableStatus(table._id, 'occupied');
                }}
                className="bg-gray-800 text-white px-2 py-1 rounded text-xs hover:bg-gray-900"
              >
                Occupy
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">Select Table</h1>
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
          onClick={fetchTables}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Floor tabs */}
      <div className="flex gap-2 mb-6">
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">1st Floor</button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">2nd Floor</button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">3rd Floor</button>
      </div>

      {/* Tables layout */}
      <div className="bg-white rounded-lg shadow p-8 min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="relative">
            {/* Grid layout for tables */}
            <div className="grid grid-cols-3 gap-20 auto-rows-max max-w-6xl mx-auto">
              {tables.map((table) => (
                <TableComponent key={table._id} table={table} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTables;
