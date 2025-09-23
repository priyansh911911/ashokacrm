import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';
import Pagination from '../common/Pagination';

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

// Success Modal Component for showing success messages
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

// Order Form Component for adding/editing orders
function OrderForm({ initialData, pantryItems, onSubmit, onCancel }) {
  // State for the order form data, now includes notes and priority
  const [formData, setFormData] = useState({
    pantryItem: '',
    quantity: 1,
    orderDate: new Date().toISOString().slice(0, 10),
    deliveryDate: '',
    notes: '',
    priority: 'medium',
  });

  // Effect to populate form data when editing an existing order
  useEffect(() => {
    if (initialData) {
      // Create a Date object from the initial deliveryDate and check if it's a valid date
      const deliveryDate = initialData.deliveryDate
        ? new Date(initialData.deliveryDate)
        : null;
      const formattedDeliveryDate = deliveryDate && !isNaN(deliveryDate.getTime())
        ? deliveryDate.toISOString().slice(0, 10)
        : '';

      // Add a similar robust check for the orderDate
      // The provided data uses requestDate, so we'll map that to orderDate
      const orderDate = initialData.requestDate
        ? new Date(initialData.requestDate)
        : new Date(); // Default to current date if invalid or missing
      const formattedOrderDate = !isNaN(orderDate.getTime())
        ? orderDate.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10); // Default to current date if invalid

      setFormData({
        // Extract pantryItemId from the items array
        pantryItem: initialData.items[0]?.pantryItemId || '',
        quantity: initialData.items[0]?.quantity || 1,
        orderDate: formattedOrderDate,
        deliveryDate: formattedDeliveryDate,
        notes: initialData.notes || '',
        priority: initialData.priority || 'medium',
      });
    } else {
      setFormData({
        pantryItem: pantryItems.length > 0 ? pantryItems[0]._id : '',
        quantity: 1,
        orderDate: new Date().toISOString().slice(0, 10),
        deliveryDate: '',
        notes: '',
        priority: 'medium',
      });
    }
  }, [initialData, pantryItems]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.pantryItem) {
      // Use a custom message box instead of alert()
      // You would typically use a state variable to show an in-app message
      console.log("Please select a pantry item.");
      return;
    }
    const dataToSend = {
      pantryItem: formData.pantryItem,
      quantity: parseFloat(formData.quantity),
      orderDate: formData.orderDate,
      deliveryDate: formData.deliveryDate, 
      notes: formData.notes,
      priority: formData.priority,
    };
    onSubmit(initialData ? initialData._id : null, dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pantryItem" className="block text-sm font-medium" style={{ color: 'hsl(45, 100%, 20%)' }}>Pantry Item</label>
        <select
          id="pantryItem"
          name="pantryItem"
          value={formData.pantryItem}
          onChange={handleChange}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {pantryItems.length > 0 ? (
            pantryItems.map(item => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))
          ) : (
            <option value="">No items available</option>
          )}
        </select>
      </div>

      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          id="quantity"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="orderDate" className="block text-sm font-medium text-gray-700">Order Date</label>
        <input
          type="date"
          id="orderDate"
          name="orderDate"
          value={formData.orderDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700">Delivery Date (Optional)</label>
        <input
          type="date"
          id="deliveryDate"
          name="deliveryDate"
          value={formData.deliveryDate}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
        <textarea
          id="notes"
          name="notes"
          rows="2"
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        ></textarea>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
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
          {initialData ? 'Update Order' : 'Place Order'}
        </button>
      </div>
    </form>
  );
}

// Main App Component for Orders Management
function App() {
  const { axios } = useAppContext();
  // State variables for application data and UI
  const [orders, setOrders] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Order Form states
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Helper function to get auth token from local storage
  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      return null;
    }
    return token;
  };

  // Function to fetch all pantry items from the backend
  const fetchPantryItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    try {
      if (!token) {
        return;
      }

      const { data } = await axios.get('/api/pantry/items', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPantryItems(data.items || []);
    } catch (err) {
      console.error("Error fetching pantry items:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Failed to load pantry items: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to fetch all orders from the backend
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    try {
      if (!token) {
        return;
      }

      const { data } = await axios.get('/api/pantry/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Failed to load orders: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch for both items and orders
  useEffect(() => {
    fetchPantryItems();
    fetchOrders();
  }, [fetchPantryItems, fetchOrders]);

  // Order Management Functions
  const handleOrderSubmit = async (id, data) => {
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    try {
      if (!token) {
        throw new Error("Authentication token not found.");
      }



      if (id) {
        await axios.put(`/api/pantry/orders/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/pantry/orders', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      showToast.success(`Order ${id ? 'updated' : 'placed'} successfully!`);
      resetOrderForm();
      fetchOrders();
    } catch (err) {
      console.error("Error saving order:", err);
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Failed to save order: ${errorMessage}`);
    } finally {
      setLoading(false);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleOrderEdit = (order) => {
    setEditingOrder(order);
    setIsOrderFormOpen(true);
  };

  const handleOrderDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    try {
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      await axios.delete(`/api/pantry/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.success('Order deleted successfully!');
      fetchOrders();
    } catch (err) {
      console.error("Error deleting order:", err);
      const errorMessage = err.response?.data?.message || err.message;
      showToast.error(`Failed to delete order: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const resetOrderForm = () => {
    setEditingOrder(null);
    setIsOrderFormOpen(false);
  };

  // Handle clicks outside the modal content to close it
  const handleModalClick = (e) => {
    if (e.target.id === 'order-form-modal-overlay') {
      resetOrderForm();
    }
  };

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
      <div className="w-full bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Pantry Orders Management</h1>

       

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Controls: Add Order */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsOrderFormOpen(true)}
            className="font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
          >
            Place New Order
          </button>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="ml-3 text-gray-700">Loading data...</p>
          </div>
        )}

        {/* Orders List Table */}
        {!loading && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">All Orders</h2>
            <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order No.</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-500">{order.orderNumber || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{order.items[0]?.name || 'Item Not Found'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{order.items[0]?.quantity || 'N/A'} {order.items[0]?.unit || ''}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{new Date(order.requestDate).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-sm text-gray-500 capitalize">{order.priority || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{order.notes || 'No notes'}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            (order.status === 'fulfilled' || order.deliveryDate) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status || (order.deliveryDate ? 'Delivered' : 'Ordered')}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-medium flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOrderEdit(order)}
                            className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleOrderDelete(order._id)}
                            className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-3 text-center text-sm text-gray-500">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              itemsPerPage={itemsPerPage}
              totalItems={orders.length}
            />
          </div>
        )}
        
        {/* Add/Edit Order Form Modal */}
        {isOrderFormOpen && (
          <div
            id="order-form-modal-overlay"
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
            onClick={handleModalClick}
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto transform scale-95 animate-fade-in hide-scrollbar">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {editingOrder ? 'Edit Order' : 'Place New Order'}
              </h2>
              <OrderForm
                initialData={editingOrder}
                pantryItems={pantryItems}
                onSubmit={handleOrderSubmit}
                onCancel={resetOrderForm}
              />
            </div>
          </div>
        )}


      </div>
    </div>
  );
}

export default App;
