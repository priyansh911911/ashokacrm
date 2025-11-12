import React, { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Trash2, Package, AlertTriangle, Plus } from 'lucide-react';
import WastageTable from './WastageTable';

const WastageForm = () => {
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refreshTable, setRefreshTable] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Food',
    department: 'Kitchen',
    quantity: '',
    unit: 'kg',
    reason: 'Expired',
    estimatedCost: '',
    reportedBy: '',
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const submitData = {
        ...formData,
        quantity: Number(formData.quantity),
        estimatedCost: Number(formData.estimatedCost)
      };
      
      const url = editingId 
        ? `https://ashoka-api.shineinfosolutions.in/api/wastage/${editingId}`
        : 'https://ashoka-api.shineinfosolutions.in/api/wastage';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData)
      });

      if (response.ok) {
        toast.success(editingId ? 'Wastage updated successfully!' : 'Wastage reported successfully!');
        
        // Reset form
        setFormData({
          itemName: '',
          category: 'Food',
          department: 'Kitchen',
          quantity: '',
          unit: 'kg',
          reason: 'Expired',
          estimatedCost: '',
          reportedBy: '',
        });
        setEditingId(null);
        setRefreshTable(prev => prev + 1);
      } else {
        toast.error('Failed to submit wastage report');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error submitting wastage report');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      itemName: item.itemName,
      category: item.category,
      department: item.department,
      quantity: item.quantity.toString(),
      unit: item.unit,
      reason: item.reason,
      estimatedCost: item.estimatedCost.toString(),
      reportedBy: item.reportedBy
    });
    setEditingId(item._id);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      itemName: '',
      category: 'Food',
      department: 'Kitchen',
      quantity: '',
      unit: 'kg',
      reason: 'Expired',
      estimatedCost: '',
      reportedBy: '',
    });
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1f2937] flex items-center gap-2">
          <Trash2 className="text-red-600" size={24} />
          <span className="hidden sm:inline">Wastage Management</span>
          <span className="sm:hidden">Wastage</span>
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          {showForm ? 'Hide Form' : 'Add Wastage'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <AlertTriangle className="text-red-500" size={20} />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">Report Wastage</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Item Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter item name"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Food">Food</option>
                <option value="Beverage">Beverage</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Equipment">Equipment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Kitchen">Kitchen</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Pantry">Pantry</option>
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="Expired">Expired</option>
                <option value="Spoiled">Spoiled</option>
                <option value="Overcooked">Overcooked</option>
                <option value="Burnt">Burnt</option>
                <option value="Dropped">Dropped</option>
                <option value="Customer Return">Customer Return</option>
                <option value="Preparation Error">Preparation Error</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="0"
              />
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="kg">kg</option>
                <option value="grams">grams</option>
                <option value="liters">liters</option>
                <option value="ml">ml</option>
                <option value="pieces">pieces</option>
                <option value="plates">plates</option>
                <option value="bowls">bowls</option>
              </select>
            </div>

            {/* Estimated Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost (₹) *</label>
              <input
                type="number"
                name="estimatedCost"
                value={formData.estimatedCost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Reported By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reported By *</label>
            <input
              type="text"
              name="reportedBy"
              value={formData.reportedBy}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter reporter name"
            />
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">{editingId ? 'Updating...' : 'Submitting...'}</span>
                  <span className="sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <Package size={16} />
                  <span className="hidden sm:inline">{editingId ? 'Update Wastage' : 'Submit Wastage Report'}</span>
                  <span className="sm:hidden">{editingId ? 'Update' : 'Submit'}</span>
                </>
              )}
            </button>
          </div>
        </form>
        </div>
      )}

      {/* Wastage Table */}
      <WastageTable key={refreshTable} onEdit={handleEdit} />
      
      <Toaster position="top-right" />
    </div>
  );
};

export default WastageForm;
