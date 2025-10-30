import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { showToast } from '../utils/toaster';
import { useSocket } from '../context/SocketContext';
import { Plus, Edit, Trash2, Package, Clock, CheckCircle, Store } from 'lucide-react';

const Kitchen = () => {
  const { axios } = useAppContext();
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [kitchenStore, setKitchenStore] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    items: [{ itemId: '', quantity: '1', unitPrice: 0 }],
    totalAmount: 0,
    vendorId: '',
    orderType: 'kitchen_preparation',
    specialInstructions: ''
  });

  useEffect(() => {
    fetchData();
    fetchKitchenStore();
    
    // WebSocket listeners
    if (socket) {
      socket.on('kitchen-store-updated', () => {
        fetchKitchenStore();
      });
      
      socket.on('disbursement-created', (data) => {
        if (data.type === 'pantry_to_kitchen') {
          fetchKitchenStore();
          showToast.success(`${data.itemCount} items received from pantry`);
        }
      });
    }
    
    return () => {
      if (socket) {
        socket.off('kitchen-store-updated');
        socket.off('disbursement-created');
      }
    };
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch items
      try {
        const itemsRes = await axios.get('/api/pantry/items', { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        });
        const itemsData = itemsRes.data;
        setItems(Array.isArray(itemsData) ? itemsData : (itemsData?.items || itemsData?.data || []));
      } catch (error) {
        console.log('Items fetch failed:', error);
        setItems([]);
      }

      // Fetch vendors
      try {
        const vendorsRes = await axios.get('/api/vendor/all', { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        });
        const vendorsData = vendorsRes.data;
        setVendors(Array.isArray(vendorsData) ? vendorsData : (vendorsData?.vendors || vendorsData?.data || []));
      } catch (error) {
        console.log('Vendors fetch failed:', error);
        setVendors([]);
      }

      // Fetch orders
      try {
        const ordersRes = await axios.get('/api/kitchen-orders', { 
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } 
        });
        setOrders(ordersRes.data || []);
      } catch (error) {
        console.log('Kitchen orders not available');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchKitchenStore = async () => {
    try {
      const response = await axios.get('/api/disbursements/kitchen-store', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setKitchenStore(response.data || []);
    } catch (error) {
      console.log('Kitchen store fetch failed:', error);
      setKitchenStore([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.vendorId) {
      showToast.error('Please select a vendor');
      return;
    }
    
    const validItems = formData.items.filter(item => item.itemId && item.quantity > 0);
    if (validItems.length === 0) {
      showToast.error('Please add at least one valid item');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        items: validItems
      };
      
      if (editingOrder) {
        await axios.put(`/api/kitchen-orders/${editingOrder._id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showToast.success('Order updated successfully');
      } else {
        await axios.post('/api/kitchen-orders', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        showToast.success('Order created successfully');
      }
      resetForm();
      fetchData();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to save order');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await axios.delete(`/api/kitchen-orders/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast.success('Order deleted successfully');
      fetchData();
    } catch (error) {
      showToast.error('Failed to delete order');
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      items: order.items || [{ itemId: '', quantity: '1', unitPrice: 0 }],
      totalAmount: order.totalAmount,
      vendorId: order.vendorId || '',
      orderType: order.orderType,
      specialInstructions: order.specialInstructions || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      items: [{ itemId: '', quantity: '1', unitPrice: 0 }],
      totalAmount: 0,
      vendorId: '',
      orderType: 'kitchen_preparation',
      specialInstructions: ''
    });
    setEditingOrder(null);
    setShowForm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-purple-100 text-purple-800',
      fulfilled: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', quantity: '1', unitPrice: 0 }]
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    const total = updatedItems.reduce((sum, item) => sum + (parseFloat(item.quantity) * item.unitPrice), 0);
    setFormData({ ...formData, items: updatedItems, totalAmount: total });
  };

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Kitchen Orders</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowStore(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <Store size={20} />
            Kitchen Store
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-700 hover:to-orange-700 flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <Plus size={20} />
            New Order
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-xl border border-amber-200">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-2 text-amber-600">Loading orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-amber-600">
                      No orders found. Create your first order.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-amber-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">
                        {order._id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                        {order.orderType.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                        <div className="flex items-center gap-1">
                          <Package size={14} />
                          {order.items?.length} items
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-900">
                        ₹{order.totalAmount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(order)}
                            className="text-amber-600 hover:text-amber-800"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(order._id)}
                            className="text-red-600 hover:text-red-800"
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
        )}
      </div>

      {/* Kitchen Store Modal */}
      {showStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-amber-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-t-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-green-900">Kitchen Store Inventory</h2>
                <button
                  onClick={() => setShowStore(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-white rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-100 to-emerald-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Item</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Unit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-200">
                    {kitchenStore.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-green-600">
                          No items in kitchen store
                        </td>
                      </tr>
                    ) : (
                      kitchenStore.map((item) => (
                        <tr key={item._id} className="hover:bg-green-50">
                          <td className="px-4 py-3 text-sm text-green-900">
                            {item.itemId?.name || 'Unknown Item'}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-900 font-medium">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700">
                            {item.unit}
                          </td>
                          <td className="px-4 py-3 text-sm text-green-700">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-amber-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-t-lg">
              <h2 className="text-xl font-bold mb-4 text-amber-900">
                {editingOrder ? 'Edit Order' : 'Create New Order'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Order Type</label>
                  <select
                    value={formData.orderType}
                    onChange={(e) => setFormData({...formData, orderType: e.target.value})}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="kitchen_preparation">Kitchen Preparation</option>
                    <option value="kitchen_to_pantry">Kitchen to Pantry</option>
                    <option value="kitchen_to_vendor">Kitchen to Vendor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Vendor</label>
                  <select
                    value={formData.vendorId}
                    onChange={(e) => setFormData({...formData, vendorId: e.target.value})}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select Vendor</option>
                    {Array.isArray(vendors) && vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-amber-800">Items</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                    >
                      + Add Item
                    </button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={item.itemId}
                        onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                        className="px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      >
                        <option value="">Select Item</option>
                        {Array.isArray(items) && items.map(itm => (
                          <option key={itm._id} value={itm._id}>{itm.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                        className="px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      />
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Unit Price"
                        className="px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        step="0.01"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Total Amount</label>
                  <input
                    type="number"
                    value={formData.totalAmount}
                    readOnly
                    className="w-full px-3 py-2 border border-amber-300 rounded-md bg-amber-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Special Instructions</label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-amber-300 rounded-md text-amber-700 hover:bg-amber-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-md hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? 'Saving...' : editingOrder ? 'Update' : 'Create'}
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

export default Kitchen;