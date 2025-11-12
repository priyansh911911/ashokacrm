import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const LaundryRates = () => {
  const { axios } = useAppContext();
  const [rates, setRates] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    serviceType: '',
    itemName: '',
    rate: '',
    unit: 'piece',
    vendorId: '',
    isActive: true
  });

  const categories = ['gentlemen', 'ladies', 'Hotel Laundry'];
  const serviceTypes = ['dry_clean', 'wash', 'press'];
  const units = ['piece', 'pair', 'set'];

  useEffect(() => {
    fetchRates();
    fetchVendors();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/laundry-rates/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRates(response.data || []);
    } catch (error) {
      console.error('Error fetching rates:', error);
      toast.error('Failed to fetch laundry rates');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/laundry-vendors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(editingRate ? 'Updating rate...' : 'Creating rate...');
    
    try {
      const token = localStorage.getItem('token');
      const url = editingRate 
        ? `/api/laundry-rates/${editingRate._id}`
        : '/api/laundry-rates';
      
      const method = editingRate ? 'put' : 'post';
      
      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(editingRate ? 'Rate updated successfully!' : 'Rate created successfully!', { id: loadingToast });
      resetForm();
      fetchRates();
    } catch (error) {
      console.error('Error saving rate:', error);
      toast.error('Failed to save rate', { id: loadingToast });
    }
  };

  const handleEdit = (rate) => {
    setEditingRate(rate);
    setFormData({
      category: rate.category,
      serviceType: rate.serviceType,
      itemName: rate.itemName,
      rate: rate.rate,
      unit: rate.unit,
      vendorId: rate.vendorId || '',
      isActive: rate.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rate?')) return;
    
    const loadingToast = toast.loading('Deleting rate...');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/laundry-rates/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Rate deleted successfully!', { id: loadingToast });
      fetchRates();
    } catch (error) {
      console.error('Error deleting rate:', error);
      toast.error('Failed to delete rate', { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      category: '',
      serviceType: '',
      itemName: '',
      rate: '',
      unit: 'piece',
      vendorId: '',
      isActive: true
    });
    setEditingRate(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getCategoryBadge = (category) => {
    const colors = {
      'gentlemen': 'bg-blue-100 text-blue-800',
      'ladies': 'bg-pink-100 text-pink-800',
      'Hotel Laundry': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getServiceTypeBadge = (serviceType) => {
    const colors = {
      'dry_clean': 'bg-purple-100 text-purple-800',
      'wash': 'bg-cyan-100 text-cyan-800',
      'press': 'bg-orange-100 text-orange-800'
    };
    return colors[serviceType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laundry Rates Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-hover"
        >
          <Plus size={16} className="mr-2" />
          Add New Rate
        </button>
      </div>

      {/* Rates Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">Loading...</td>
                </tr>
              ) : rates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No rates found
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryBadge(rate.category)}`}>
                        {rate.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getServiceTypeBadge(rate.serviceType)}`}>
                        {rate.serviceType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {rate.itemName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{rate.rate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rate.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {rate.vendorId ? vendors.find(v => v._id === rate.vendorId)?.vendorName || 'Unknown' : 'General'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rate.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {rate.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(rate)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(rate._id)}
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingRate ? 'Edit Rate' : 'Add New Rate'}
                </h2>
                <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Service Type</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select Service Type</option>
                    {serviceTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Shirt, Pants, Towel"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Rate (₹)</label>
                  <input
                    type="number"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                    required
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Vendor (Optional)</label>
                  <select
                    name="vendorId"
                    value={formData.vendorId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
                  >
                    <option value="">General Rate</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.vendorName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm">Active</label>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-hover"
                  >
                    <Save size={16} className="mr-1" />
                    {editingRate ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaundryRates;
