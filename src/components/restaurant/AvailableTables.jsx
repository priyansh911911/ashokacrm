import { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import { Search, Users, MapPin, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';

const AvailableTables = () => {
  const { axios } = useAppContext();
  const [tables, setTables] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      setTables(tablesData.filter(table => table.status === 'available' && table.isActive));
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

  const searchTables = async (query) => {
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
      const filteredTables = tablesData.filter(table => 
        table.status === 'available' && 
        table.isActive &&
        (table.tableNumber.toLowerCase().includes(query.toLowerCase()) ||
         table.location.toLowerCase().includes(query.toLowerCase()))
      );
      setTables(filteredTables);
    } catch (error) {
      console.error('Error searching tables:', error);
      if (error.response?.status === 401 || error.response?.data?.message === 'Invalid token') {
        localStorage.removeItem('token');
        showToast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
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

  const handleSearch = (e) => {
    e.preventDefault();
    searchTables(searchQuery);
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case 'restaurant': return '🍽️';
      case 'bar': return '🍸';
      case 'terrace': return '🌿';
      case 'private_dining': return '🏠';
      default: return '📍';
    }
  };

  const groupTablesByLocation = () => {
    const grouped = {};
    tables.forEach(table => {
      const location = table.location || 'restaurant';
      if (!grouped[location]) grouped[location] = [];
      grouped[location].push(table);
    });
    return grouped;
  };

  const tablesByLocation = groupTablesByLocation();

  return (
    <div 
      className="min-h-screen p-4 sm:p-10 font-sans" 
      style={{backgroundColor: 'var(--color-background)'}}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 pb-5 border-b gap-4" style={{borderColor: 'var(--color-border)'}}>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wider flex items-center" style={{color: 'var(--color-text)'}}>
          <CheckCircle size={24} className="sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3" style={{color: 'var(--color-primary)'}} /> 
          <span className="hidden sm:inline">AVAILABLE TABLES</span>
          <span className="sm:hidden">TABLES</span>
        </h1>
        <button 
          onClick={fetchTables}
          className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors shadow-md"
          style={{backgroundColor: 'var(--color-primary)', color: 'white'}}
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 border mb-6 sm:mb-8" style={{borderColor: 'var(--color-border)'}}>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by table number or location..."
              className="w-full pl-10 pr-4 py-3 border-2 rounded-lg bg-white text-gray-700 focus:outline-none transition-colors"
              style={{borderColor: 'var(--color-border)', focusBorderColor: 'var(--color-primary)'}}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap shadow-md"
            style={{backgroundColor: 'var(--color-primary)', color: 'white'}}
          >
            Search Tables
          </button>
        </form>
      </div>

      {/* Tables Display */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 border" style={{borderColor: 'var(--color-border)'}}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-xl sm:text-2xl font-light tracking-wider" style={{color: 'var(--color-text)'}}>
            Available Tables ({tables.length})
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              Available
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: 'var(--color-primary)'}}></div>
            <p className="text-gray-500">Loading tables...</p>
          </div>
        ) : Object.keys(tablesByLocation).length > 0 ? (
          Object.keys(tablesByLocation).map(location => {
            const locationTables = tablesByLocation[location];
            return (
              <div key={location} className="mb-6 sm:mb-8 pb-4 border-b border-gray-200 last:border-b-0">
                <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-5 flex items-center text-gray-700 gap-2">
                  <span className="text-2xl">{getLocationIcon(location)}</span>
                  <span className="tracking-wide" style={{color: 'var(--color-text)'}}>
                    {location.replace('_', ' ').toUpperCase()} ({locationTables.length})
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {locationTables.map((table) => (
                    <div
                      key={table._id}
                      className="bg-green-50 hover:bg-green-100 rounded-lg shadow-md border-t-2 border-green-500 transition-all duration-300 cursor-pointer hover:shadow-lg min-h-[160px]"
                    >
                      <div className="p-4 flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-extrabold text-2xl" style={{color: 'var(--color-text)'}}>
                            Table {table.tableNumber}
                          </div>
                          <CheckCircle size={20} className="text-green-600" />
                        </div>
                        
                        <div className="flex-1 space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users size={16} className="mr-2" />
                            <span>{table.capacity} guests</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin size={16} className="mr-2" />
                            <span className="capitalize">{table.location.replace('_', ' ')}</span>
                          </div>
                          <div className="text-xs font-semibold uppercase tracking-wider text-green-700">
                            AVAILABLE
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateTableStatus(table._id, 'reserved')}
                            className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <Clock size={14} />
                            Reserve
                          </button>
                          <button
                            onClick={() => updateTableStatus(table._id, 'occupied')}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <Users size={14} />
                            Occupy
                          </button>
                          <button
                            onClick={() => updateTableStatus(table._id, 'maintenance')}
                            className="w-full bg-gray-500 text-white px-3 py-2 rounded text-xs font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-1 mt-1"
                          >
                            <AlertTriangle size={14} />
                            Maintenance
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-500">No available tables found</p>
            <p className="text-sm text-gray-400">All tables are currently occupied or under maintenance</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTables;