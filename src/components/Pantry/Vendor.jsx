import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import { Plus, Edit, Trash2, BarChart3, X } from 'lucide-react';

const Vendor = () => {
  const { axios } = useAppContext();
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [showVendorAnalytics, setShowVendorAnalytics] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);

  const [vendorFormData, setVendorFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    GSTin: '',
    UpiID: '',
    scannerImg: '',
    isActive: true
  });

  useEffect(() => {
    fetchVendors();
    fetchOrders();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/vendor/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const vendorsData = Array.isArray(response.data) ? response.data : (response.data.vendors || []);
      setVendors(vendorsData);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      showToast.error('Failed to fetch vendors');
      setVendors([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get('/api/pantry/orders', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const ordersData = data.orders || data.data || data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleVendorChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVendorFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setVendorFormData(prev => ({
          ...prev,
          scannerImg: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (editingVendor) {
        await axios.put(`/api/vendor/update/${editingVendor._id}`, vendorFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast.success('Vendor updated successfully!');
      } else {
        await axios.post('/api/vendor/add', vendorFormData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast.success('Vendor added successfully!');
      }
      resetVendorForm();
      fetchVendors();
    } catch (err) {
      showToast.error(editingVendor ? 'Failed to update vendor' : 'Failed to add vendor');
    } finally {
      setLoading(false);
    }
  };

  const resetVendorForm = () => {
    setVendorFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      GSTin: '',
      UpiID: '',
      scannerImg: '',
      isActive: true
    });
    setSelectedImage(null);
    setEditingVendor(null);
    setShowVendorForm(false);
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setVendorFormData({
      name: vendor.name || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      GSTin: vendor.GSTin || '',
      UpiID: vendor.UpiID || '',
      scannerImg: vendor.scannerImg || '',
      isActive: vendor.isActive !== undefined ? vendor.isActive : true
    });
    setShowVendorForm(true);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/vendor/delete/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.success('Vendor deleted successfully!');
      fetchVendors();
    } catch (err) {
      showToast.error('Failed to delete vendor');
    }
  };

  const getVendorAnalytics = () => {
    const analytics = {};
    
    orders.forEach(order => {
      if (order.vendorId && order.totalAmount) {
        const vendorId = typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId;
        const vendor = vendors.find(v => v._id === vendorId);
        const vendorName = vendor?.name || 'Unknown Vendor';
        
        if (!analytics[vendorId]) {
          analytics[vendorId] = {
            name: vendorName,
            totalOrders: 0,
            totalAmount: 0,
            avgAmount: 0,
            lastOrderDate: null,
            orders: []
          };
        }
        
        analytics[vendorId].totalOrders++;
        analytics[vendorId].totalAmount += order.totalAmount;
        analytics[vendorId].orders.push({
          date: order.createdAt || order.orderDate,
          amount: order.totalAmount,
          orderNumber: order.orderNumber
        });
        
        if (!analytics[vendorId].lastOrderDate || new Date(order.createdAt) > new Date(analytics[vendorId].lastOrderDate)) {
          analytics[vendorId].lastOrderDate = order.createdAt;
        }
      }
    });
    
    // Calculate averages
    Object.keys(analytics).forEach(vendorId => {
      analytics[vendorId].avgAmount = analytics[vendorId].totalAmount / analytics[vendorId].totalOrders;
      analytics[vendorId].orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    
    return Object.values(analytics).sort((a, b) => b.totalAmount - a.totalAmount);
  };

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">Vendor Management</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowVendorAnalytics(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Vendor Analytics
          </button>
          <button
            onClick={() => setShowVendorForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base flex items-center gap-2"
          >
            <Plus size={16} />
            Add Vendor
          </button>
        </div>
      </div>

      {/* Vendors List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPI ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QR Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : vendors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No vendors found</td>
                </tr>
              ) : (
                vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.GSTin || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.UpiID || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vendor.scannerImg ? (
                        <img src={vendor.scannerImg} alt="QR Code" className="w-8 h-8 object-cover rounded" />
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        vendor.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditVendor(vendor)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteVendor(vendor._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      {showVendorForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xs sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingVendor ? 'Edit Vendor' : 'Add New Vendor'}</h2>
                <button onClick={resetVendorForm} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleVendorSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      name="name"
                      value={vendorFormData.name}
                      onChange={handleVendorChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      name="phone"
                      value={vendorFormData.phone}
                      onChange={handleVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={vendorFormData.email}
                      onChange={handleVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input
                      name="GSTin"
                      value={vendorFormData.GSTin}
                      onChange={handleVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input
                      name="UpiID"
                      value={vendorFormData.UpiID}
                      onChange={handleVendorChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scanner QR Code</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {vendorFormData.scannerImg && (
                      <div className="mt-2">
                        <img 
                          src={vendorFormData.scannerImg} 
                          alt="Scanner QR Code" 
                          className="w-20 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={vendorFormData.address}
                    onChange={handleVendorChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    name="isActive"
                    type="checkbox"
                    checked={vendorFormData.isActive}
                    onChange={handleVendorChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetVendorForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (editingVendor ? 'Updating...' : 'Adding...') : (editingVendor ? 'Update Vendor' : 'Add Vendor')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Analytics Modal */}
      {showVendorAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Vendor Price Analytics</h2>
                <button
                  onClick={() => setShowVendorAnalytics(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                {getVendorAnalytics().map((vendor, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                        <p className="text-sm text-gray-600">
                          Last Order: {vendor.lastOrderDate ? new Date(vendor.lastOrderDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">₹{vendor.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Total Revenue</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white rounded p-3 text-center">
                        <p className="text-xl font-semibold text-blue-600">{vendor.totalOrders}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center">
                        <p className="text-xl font-semibold text-orange-600">₹{vendor.avgAmount.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                      </div>
                      <div className="bg-white rounded p-3 text-center">
                        <p className="text-xl font-semibold text-purple-600">
                          {vendor.orders.length > 0 ? `₹${vendor.orders[0].amount}` : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">Latest Order</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recent Orders:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {vendor.orders.slice(0, 5).map((order, orderIndex) => (
                          <div key={orderIndex} className="flex justify-between items-center bg-white rounded p-2 text-sm">
                            <span className="text-gray-600">
                              {order.orderNumber} - {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="font-medium text-green-600">₹{order.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getVendorAnalytics().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No vendor analytics data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;