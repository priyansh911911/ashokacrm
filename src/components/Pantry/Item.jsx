import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import DashboardLoader from '../DashboardLoader';
import CategoryForm from './CategoryForm';

// Confirmation Modal Component
function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="relative p-8 bg-white w-full max-w-sm mx-auto rounded-lg shadow-xl animate-fade-in-down">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Confirm Action</h3>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Success Modal Component
function SuccessModal({ message, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
      <div className="relative p-8 bg-white w-full max-w-sm mx-auto rounded-lg shadow-xl animate-fade-in-down">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Success!</h3>
        <p className="mb-6 text-gray-700">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

function Item() {
  const { axios } = useAppContext();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitFormData, setUnitFormData] = useState({ name: '', shortName: '' });
  const [units, setUnits] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    isAvailable: true,
    stockQuantity: 0,
    minStockLevel: 5,
    unit: 'piece'
  });

  const getAuthToken = () => localStorage.getItem("token");

  const fetchItems = async () => {
    const token = getAuthToken();
    const { data } = await axios.get('/api/pantry/items', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.items || [];
  };

  const fetchCategories = async () => {
    const token = getAuthToken();
    const { data } = await axios.get('/api/pantry-categories/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data || [];
  };

  const fetchUnits = async () => {
    const token = getAuthToken();
    const { data } = await axios.get('/api/units/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data || [];
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      category: typeof item.category === 'object' ? item.category._id : item.category
    });
    setShowForm(true);
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        // Load all data concurrently for faster loading
        const [itemsData, categoriesData, unitsData] = await Promise.allSettled([
          fetchItems(),
          fetchCategories(),
          fetchUnits()
        ]);
        
        // Set items (critical)
        if (itemsData.status === 'fulfilled') {
          setItems(itemsData.value);
        } else {
          throw new Error('Failed to load items');
        }
        
        // Set categories (non-critical)
        setCategories(categoriesData.status === 'fulfilled' ? categoriesData.value : []);
        
        // Set units (non-critical)
        setUnits(unitsData.status === 'fulfilled' ? unitsData.value : [{ _id: 'piece', name: 'Piece', shortName: 'pc' }]);
        
        // Check URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'create-category') {
          setShowCategoryForm(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        setError(error.message || 'Failed to load page data');
      } finally {
        setPageLoading(false);
      }
    };
    
    initializePage();
  }, []);

  // Separate effect for handling edit URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editItemId = urlParams.get('edit');
    if (editItemId && items.length > 0) {
      const itemToEdit = items.find(item => item._id === editItemId);
      if (itemToEdit) {
        handleEdit(itemToEdit);
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [items]);

  if (pageLoading) {
    return <DashboardLoader pageName="Pantry Items" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getAuthToken();
      if (editingItem) {
        await axios.put(`/api/pantry/items/${editingItem._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/pantry/items', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setSuccessMessage(`Item ${editingItem ? 'updated' : 'added'} successfully!`);
      setShowSuccessModal(true);
      resetForm();
      const updatedItems = await fetchItems();
      setItems(updatedItems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmMessage("Are you sure you want to delete this item?");
    setConfirmAction(() => async () => {
      try {
        const token = getAuthToken();
        await axios.delete(`/api/pantry/items/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccessMessage('Item deleted successfully!');
        setShowSuccessModal(true);
        const updatedItems = await fetchItems();
        setItems(updatedItems);
      } catch (err) {
        setError(err.message);
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      isAvailable: true,
      stockQuantity: 0,
      minStockLevel: 5,
      unit: 'piece'
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'unit' && value === 'create_new') {
      setShowUnitForm(true);
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const { data } = await axios.post('/api/units/add', unitFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchUnits();
      setFormData(prev => ({ ...prev, unit: data._id }));
      setUnitFormData({ name: '', shortName: '' });
      setShowUnitForm(false);
      setSuccessMessage('Unit created successfully!');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error creating unit:', err);
      if (err.response?.status === 404) {
        setError('Unit creation feature is not available yet. Please contact your administrator.');
      } else {
        setError(err.response?.data?.message || 'Failed to create unit');
      }
    }
  };

  const exportToExcel = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get('/api/pantry/items/excel-report', {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });
      
      const contentType = response.headers['content-type'] || '';
      let mimeType, fileExtension;
      
      if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileExtension = 'xlsx';
      } else {
        mimeType = 'text/csv;charset=utf-8;';
        fileExtension = 'csv';
      }
      
      const blob = new Blob([response.data], { type: mimeType });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pantry-items-${new Date().toISOString().split('T')[0]}.${fileExtension}`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccessMessage(`${fileExtension.toUpperCase()} report downloaded successfully`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export report');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
      <div className="w-full bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Pantry Items Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Export Excel ({items.length} items)
            </button>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
          >
            Add New Item
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search items by name, category, or unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="ml-3 text-gray-700">Loading...</p>
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium" style={{ color: 'hsl(45, 100%, 20%)' }}>Name</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="create_new" style={{backgroundColor: '#f0f0f0', fontWeight: 'bold'}}>+ Create New Unit</option>
                      {units.map((unit) => (
                        <option key={unit._id} value={unit._id}>
                          {unit.name} ({unit.shortName})
                        </option>
                      ))}
                      <option value="piece">Piece</option>
                      <option value="bag">Bag</option>
                      <option value="plate">Plate</option>
                      <option value="bowl">Bowl</option>
                      <option value="glass">Glass</option>
                      <option value="cup">Cup</option>
                      <option value="bottle">Bottle</option>
                      <option value="ml">ML</option>
                      <option value="ltr">Liter</option>
                      <option value="gram">Gram</option>
                      <option value="kg">KG</option>
                      <option value="packet">Packet</option>
                      <option value="combo">Combo</option>
                      <option value="slice">Slice</option>
                      <option value="tin">Tin</option>
                      <option value="scoop">Scoop</option>
                      <option value="portion">Portion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                    <input
                      name="stockQuantity"
                      type="number"
                      value={formData.stockQuantity}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Min Stock Level</label>
                    <input
                      name="minStockLevel"
                      type="number"
                      value={formData.minStockLevel}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    name="isAvailable"
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Available</label>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2 border rounded-lg transition duration-150 ease-in-out"
                    style={{ borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showUnitForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Create New Unit</h2>
              <form onSubmit={handleUnitSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit Name</label>
                  <input
                    type="text"
                    value={unitFormData.name}
                    onChange={(e) => setUnitFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Kilogram"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Short Name</label>
                  <input
                    type="text"
                    value={unitFormData.shortName}
                    onChange={(e) => setUnitFormData(prev => ({ ...prev, shortName: e.target.value }))}
                    required
                    placeholder="e.g., kg"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUnitForm(false);
                      setUnitFormData({ name: '', shortName: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Unit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!loading && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 black">All Items</h2>
            <div className="overflow-x-auto rounded-lg shadow-md border" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.length > 0 ? (
                    items.filter(item => 
                      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (item.category?.name || item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (item.unit || '').toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{item.category?.name || item.category}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">₹{item.price}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          <span className={`${
                            item.stockQuantity < 0 ? 'text-red-700 font-bold bg-red-100 px-2 py-1 rounded' :
                            item.stockQuantity <= item.minStockLevel ? 'text-red-600 font-semibold' : ''
                          }`}>
                            {item.stockQuantity < 0 ? `${item.stockQuantity} (Negative Stock!)` : item.stockQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {typeof item.unit === 'object' ? item.unit.shortName : item.unit}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-medium flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-3 text-center text-sm text-gray-500">
                        {searchTerm ? 'No items match your search.' : 'No items found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showConfirmModal && (
          <ConfirmationModal
            message={confirmMessage}
            onConfirm={() => {
              confirmAction();
              setShowConfirmModal(false);
            }}
            onCancel={() => setShowConfirmModal(false)}
          />
        )}
        
        {showSuccessModal && (
          <SuccessModal
            message={successMessage}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
        
        <CategoryForm 
          showModal={showCategoryForm}
          setShowModal={setShowCategoryForm}
          onCategoryAdded={fetchCategories}
        />
      </div>
    </div>
  );
}

export default Item;
