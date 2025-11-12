import React, { useState, useEffect } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const WastageTable = ({ onEdit }) => {
  const [wastageData, setWastageData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWastageData();
    fetchStats();
  }, []);

  const fetchWastageData = async () => {
    try {
      const response = await fetch('https://ashoka-api.shineinfosolutions.in/api/wastage');
      console.log('Get all wastage API response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Get all wastage API data:', data);
        // Handle different response structures
        const wastageArray = data.wastage || data.data || data || [];
        setWastageData(Array.isArray(wastageArray) ? wastageArray : []);
      } else {
        console.log('Get all wastage API failed with status:', response.status);
        setWastageData([]);
      }
    } catch (error) {
      console.error('Error fetching wastage data:', error);
      toast.error('Failed to fetch wastage data');
      setWastageData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('https://ashoka-api.shineinfosolutions.in/api/wastage/stats');
      console.log('Stats API response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Stats API data:', data);
        // Handle different response structures
        const statsData = data.stats || data.data || data || {};
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this wastage record?')) {
      try {
        const response = await fetch(`https://ashoka-api.shineinfosolutions.in/api/wastage/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          toast.success('Wastage record deleted successfully!');
          fetchWastageData();
          fetchStats();
        } else {
          toast.error('Failed to delete wastage record');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error deleting wastage record');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Records</h3>
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.totalRecords || 0}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Total Cost</h3>
            <p className="text-lg sm:text-2xl font-bold text-red-600">₹{stats.totalCost || 0}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">This Month</h3>
            <p className="text-lg sm:text-2xl font-bold text-orange-600">₹{stats.monthlyTotal || 0}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
            <h3 className="text-xs sm:text-sm font-medium text-gray-500">Today</h3>
            <p className="text-lg sm:text-2xl font-bold text-blue-600">₹{stats.dailyTotal || 0}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Wastage Records</h3>
        </div>
        
        {wastageData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No wastage records found
          </div>
        ) : (
          <>
            {/* Mobile Cards View */}
            <div className="block lg:hidden">
              {wastageData.map((item) => (
                <div key={item._id} className="border-b border-gray-200 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Department:</span>
                      <span className="ml-1 text-gray-900">{item.department}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Quantity:</span>
                      <span className="ml-1 text-gray-900">{item.quantity} {item.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cost:</span>
                      <span className="ml-1 font-medium text-gray-900">₹{item.estimatedCost}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Reason:</span>
                      <span className="ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {item.reason}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <span className="ml-1 text-gray-900">{new Date(item.date || item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-500">Reported by:</span>
                    <span className="ml-1 text-gray-900">{item.reportedBy}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wastageData.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.itemName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {item.reason}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{item.estimatedCost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.reportedBy}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(item.date || item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WastageTable;
