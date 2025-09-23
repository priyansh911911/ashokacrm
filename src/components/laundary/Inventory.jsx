import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Package, Hash, Tag, Scale, Clock, X, Save } from 'lucide-react';
import { showToast } from '../../utils/toaster';

// Main App Component for Inventory Tracking
const InventoryForm= () => {
  // State to hold all inventory items
  const [inventory, setInventory] = useState(() => {
    // Initialize inventory from localStorage or with dummy data if not found
    const savedInventory = localStorage.getItem('laundryInventory');
    return savedInventory ? JSON.parse(savedInventory) : [
      {
        id: 'INV001',
        name: 'Laundry Detergent (Liquid)',
        category: 'Consumables',
        unit: 'Liter',
        quantity: 50,
        lastUpdated: '2025-07-20',
      },
      {
        id: 'INV002',
        name: 'Hangers (Plastic)',
        category: 'Supplies',
        unit: 'Piece',
        quantity: 500,
        lastUpdated: '2025-07-21',
      },
      {
        id: 'INV003',
        name: 'Laundry Bags (Large)',
        category: 'Supplies',
        unit: 'Piece',
        quantity: 150,
        lastUpdated: '2025-07-22',
      },
      {
        id: 'INV004',
        name: 'Fabric Softener',
        category: 'Consumables',
        unit: 'Liter',
        quantity: 30,
        lastUpdated: '2025-07-19',
      },
    ];
  });

  // Effect to save inventory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('laundryInventory', JSON.stringify(inventory));
  }, [inventory]);

  // State for controlling the visibility of the inventory form modal
  const [showInventoryForm, setShowInventoryForm] = useState(false);
  // State to hold the item being edited (null if adding a new item)
  const [editingItem, setEditingItem] = useState(null);
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');

  // Function to open the inventory form for adding a new item
  const handleAddItem = () => {
    setEditingItem(null); // Clear any existing editing item
    setShowInventoryForm(true); // Show the form
  };

  // Function to open the inventory form for editing an existing item
  const handleEditItem = (item) => {
    setEditingItem(item); // Set the item to be edited
    setShowInventoryForm(true); // Show the form
  };

  // Function to delete an inventory item
  const handleDeleteItem = (id) => {
    // Show a custom confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this inventory item?");
    if (confirmDelete) {
      setInventory(inventory.filter(item => item.id !== id)); // Remove the item from the list
      showToast.success('🗑️ Inventory item deleted successfully!');
    }
  };

  // Function to save (add or update) an inventory item
  const handleSaveItem = (newItem) => {
    const now = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    if (editingItem) {
      // If editing an existing item, update it
      setInventory(inventory.map(item => (item.id === newItem.id ? { ...newItem, lastUpdated: now } : item)));
      showToast.success('✅ Inventory item updated successfully!');
    } else {
      // If adding a new item, generate a new ID and add it
      const newId = 'INV' + (inventory.length + 1).toString().padStart(3, '0');
      setInventory([...inventory, { ...newItem, id: newId, lastUpdated: now }]);
      showToast.success('🎉 New inventory item added successfully!');
    }
    setShowInventoryForm(false); // Close the form
    setEditingItem(null); // Clear editing state
  };

  // Filter inventory items based on search query
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

  // Component for the Inventory Form (Modal)
  const InventoryForm = ({ item, onSave, onClose }) => {
    // State for form fields, initialized with existing item data or empty values
    const [formData, setFormData] = useState({
      id: item?.id || '',
      name: item?.name || '',
      category: item?.category || '',
      unit: item?.unit || '',
      quantity: item?.quantity || 0,
    });

    // Handle changes in form input fields
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    // Handle form submission
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData); // Call the onSave prop with the form data
    };

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative transform transition-all duration-300 scale-100 opacity-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
            {item ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Item Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                <Tag size={16} className="inline-block mr-1 text-blue-500" /> Item Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                <Hash size={16} className="inline-block mr-1 text-purple-500" /> Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., Consumables, Supplies, Equipment"
                required
              />
            </div>

            {/* Unit and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  <Scale size={16} className="inline-block mr-1 text-green-500" /> Unit
                </label>
                <input
                  type="text"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Liter, Piece, KG"
                  required
                />
              </div>
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  <Package size={16} className="inline-block mr-1 text-orange-500" /> Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center px-5 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                <Save size={16} className="mr-2" /> Save Item
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-4 sm:mb-0">Laundry Inventory Tracking</h1>
        <button
          onClick={handleAddItem}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
        >
          <Plus size={20} className="mr-2" /> Add New Item
        </button>
      </header>

      {/* Search Section */}
      <div className="flex items-center bg-white p-4 rounded-xl shadow-md mb-6">
        <Search size={20} className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search inventory by name, category, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Inventory List Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredInventory.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No inventory items found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {item.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                          aria-label={`Edit item ${item.name}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors"
                          aria-label={`Delete item ${item.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inventory Form Modal */}
      {showInventoryForm && (
        <InventoryForm
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => setShowInventoryForm(false)}
        />
      )}
    </div>
  );
};

export default InventoryForm;