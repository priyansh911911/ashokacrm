import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Save, 
  X, 
  User, 
  Package, 
  Calendar, 
  AlertCircle, 
  Plus, 
  Trash2,
  Clock,
  CreditCard,
  Clipboard
} from 'lucide-react';
import toast from 'react-hot-toast';

const LaundryEditForm = ({ order, onSave, onClose }) => {
  const { axios } = useAppContext();
  
  if (!order) {
    return null;
  }
  
  const isEditing = order._id ? true : false;
  const [orderData, setOrderData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [laundryRates, setLaundryRates] = useState([]);
  
  const [formData, setFormData] = useState({
    _id: order._id || null,
    bookingId: order.bookingId || "",
    items: order.items || [{ rateId: "", quantity: 1, status: "pending" }],
    laundryStatus: order.laundryStatus || "pending",
    isUrgent: order.isUrgent || false,
    scheduledPickupTime: order.scheduledPickupTime 
      ? new Date(order.scheduledPickupTime).toISOString().slice(0, 16) 
      : "",
    scheduledDeliveryTime: order.scheduledDeliveryTime 
      ? new Date(order.scheduledDeliveryTime).toISOString().slice(0, 16) 
      : "",
    totalAmount: order.totalAmount || 0,
    billStatus: order.billStatus || "unpaid",
    isBillable: order.isBillable !== undefined ? order.isBillable : true,
    isComplimentary: order.isComplimentary || false,
    createdAt: order.createdAt || null,
    updatedAt: order.updatedAt || null
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [editingItems, setEditingItems] = useState({});

  // Fetch all bookings and laundry rates data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [bookingsResponse, ratesResponse] = await Promise.all([
          axios.get('/api/bookings/all', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/laundry-rates/all', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setBookings(bookingsResponse.data || []);
        setLaundryRates(ratesResponse.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [axios]);

  // Fetch complete order data if editing
  useEffect(() => {
    const fetchOrderData = async () => {
      if (isEditing && order._id) {
        setFetchingData(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`/api/laundry/${order._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fetchedOrder = response.data;
          setOrderData(fetchedOrder);
          
          // Find booking data from fetched bookings if order has bookingId
          let bookingData = null;
          if (fetchedOrder.bookingId && bookings.length > 0) {
            bookingData = bookings.find(booking => booking._id === fetchedOrder.bookingId);
          }
          
          // Update form data with fetched order
          setFormData({
            _id: fetchedOrder._id,
            bookingId: fetchedOrder.bookingId || "",
            items: fetchedOrder.items || [],
            laundryStatus: fetchedOrder.laundryStatus || "pending",
            isUrgent: fetchedOrder.isUrgent || false,
            scheduledPickupTime: fetchedOrder.scheduledPickupTime 
              ? (() => {
                  const date = new Date(fetchedOrder.scheduledPickupTime);
                  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
                })() 
              : "",
            scheduledDeliveryTime: fetchedOrder.scheduledDeliveryTime 
              ? (() => {
                  const date = new Date(fetchedOrder.scheduledDeliveryTime);
                  return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
                })() 
              : "",
            totalAmount: fetchedOrder.totalAmount || 0,
            billStatus: fetchedOrder.billStatus || "unpaid",
            isBillable: fetchedOrder.isBillable !== undefined ? fetchedOrder.isBillable : true,
            isComplimentary: fetchedOrder.isComplimentary || false,
            createdAt: fetchedOrder.createdAt || null,
            updatedAt: fetchedOrder.updatedAt || null
          });
        } catch (error) {
          console.error('Error fetching order data:', error);
          toast.error('Failed to fetch order data');
        } finally {
          setFetchingData(false);
        }
      }
    };

    fetchOrderData();
  }, [order._id, isEditing, axios, bookings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const handleItemChange = async (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];
    
    if (name === 'rateId' && value) {
      const selectedRate = laundryRates.find(rate => rate._id === String(value));
      if (selectedRate) {
        newItems[index] = {
          ...newItems[index],
          rateId: String(value),
          itemName: selectedRate.itemName,
          serviceType: selectedRate.serviceType
        };
      }
    } else if (name === 'status' && isEditing && newItems[index]._id) {
      // Update item status via API
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`/api/laundry/item/${formData._id}/${newItems[index]._id}`, 
          { status: value },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('Item status updated');
      } catch (error) {
        console.error('Error updating item status:', error);
        toast.error('Failed to update item status');
        return;
      }
      newItems[index] = {
        ...newItems[index],
        [name]: value,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        [name]: name === "quantity" ? Math.max(1, parseInt(value) || 1) : value,
      };
    }
    setFormData({ ...formData, items: newItems });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { rateId: "", quantity: 1, status: "pending" }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.items || formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    
    const validItems = formData.items.filter(item => item.rateId && item.quantity);
    if (validItems.length === 0) {
      toast.error('Please complete all item details');
      return;
    }

    setLoading(true);
    
    try {
      const cleanItems = formData.items
        .filter(item => item.rateId && item.quantity)
        .map(item => ({
          _id: item._id,
          rateId: typeof item.rateId === 'object' ? item.rateId._id || item.rateId.id : String(item.rateId),
          itemName: item.itemName,
          quantity: Math.max(1, parseInt(item.quantity) || 1),
          deliveredQuantity: Math.max(0, parseInt(item.deliveredQuantity) || 0),
          status: item.status || "pending",
          calculatedAmount: item.calculatedAmount || 0,
          damageReported: item.damageReported || false,
          itemNotes: item.itemNotes || ""
        }));

      const bookingId = typeof formData.bookingId === 'object' 
        ? formData.bookingId._id || formData.bookingId.id 
        : formData.bookingId;
      
      const dataToSend = {
        ...formData,
        bookingId: bookingId && bookingId.trim() !== '' ? String(bookingId) : null,
        items: cleanItems,
        scheduledPickupTime: formData.scheduledPickupTime ? new Date(formData.scheduledPickupTime).toISOString() : null,
        scheduledDeliveryTime: formData.scheduledDeliveryTime ? new Date(formData.scheduledDeliveryTime).toISOString() : null
      };

      if (isEditing) {
        const token = localStorage.getItem('token');
        await axios.put(`/api/laundry/${formData._id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Laundry order updated successfully');
        onSave(dataToSend);
      } else {
        await onSave(dataToSend);
        toast.success('Laundry order created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{border: '1px solid hsl(45, 100%, 85%)'}}
      >
        <div className="sticky top-0 bg-white p-6 border-b" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
              {isEditing ? 'Edit Laundry Order' : 'Create New Laundry Order'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors"
              style={{color: 'hsl(45, 100%, 20%)'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 100%, 85%)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {fetchingData ? (
          <div className="p-6 text-center">
            <div className="text-lg" style={{color: 'hsl(45, 100%, 20%)'}}>
              Loading order data...
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order Status */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 20%)'}}>
              <Package size={16} className="inline-block mr-1" style={{color: 'hsl(45, 43%, 58%)'}} />
              Order Status
            </label>
            <select
              name="laundryStatus"
              value={formData.laundryStatus}
              onChange={handleChange}
              className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
              style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="partially_delivered">Partially Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Booking Info Display */}
          {(() => {
            const booking = bookings.find(b => b._id === formData.bookingId);
            return booking ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 20%)'}}>
                  Booking Information
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><strong>Guest:</strong> {booking.name}</div>
                  <div><strong>GRC:</strong> {booking.grcNo}</div>
                  <div><strong>Room:</strong> {booking.roomNumber}</div>
                </div>
              </div>
            ) : null;
          })()}

          {/* Items Section */}
          <div className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)', backgroundColor: 'hsl(45, 100%, 98%)'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
                <Package size={18} className="inline-block mr-2" style={{color: 'hsl(45, 43%, 58%)'}} />
                Laundry Items
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center px-3 py-2 text-sm rounded-lg text-white transition-colors"
                style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
              >
                <Plus size={16} className="mr-1" /> Add Item
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                    {item.itemName && !editingItems[index] ? (
                      <div className="flex items-center justify-between w-full p-2 rounded border bg-gray-100" style={{borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)'}}>
                        <span>{item.itemName}</span>
                        <button
                          type="button"
                          onClick={() => setEditingItems({...editingItems, [index]: true})}
                          className="text-xs px-2 py-1 rounded text-white"
                          style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      <select
                        name="rateId"
                        value={item.rateId || ""}
                        onChange={(e) => {
                          handleItemChange(index, e);
                          if (e.target.value) {
                            setEditingItems({...editingItems, [index]: false});
                          }
                        }}
                        className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                        style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                        required
                        disabled={laundryRates.length === 0}
                      >
                        <option value="">{laundryRates.length === 0 ? 'Loading items...' : 'Item Name'}</option>
                        {laundryRates.map((rate) => (
                          <option key={rate._id} value={rate._id}>
                            {rate.itemName}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    <input
                      type="number"
                      name="quantity"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                      style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                      min="1"
                      placeholder="Qty"
                      required
                    />
                    
                    <input
                      type="number"
                      name="deliveredQuantity"
                      value={item.deliveredQuantity || 0}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                      style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                      min="0"
                      placeholder="Delivered"
                    />
                    
                    <select
                      name="status"
                      value={item.status || "pending"}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                      style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                    >
                      <option value="pending">Pending</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    <input
                      type="text"
                      name="itemNotes"
                      value={item.itemNotes || ""}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 rounded border focus:outline-none focus:ring-2"
                      style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                      placeholder="Notes"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>



          {/* Billing & Flags */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 20%)'}}>
                <CreditCard size={16} className="inline-block mr-1" style={{color: 'hsl(45, 43%, 58%)'}} />
                Bill Status
              </label>
              <select
                name="billStatus"
                value={formData.billStatus}
                onChange={handleChange}
                className="w-full p-3 rounded-lg focus:outline-none focus:ring-2"
                style={{border: '1px solid hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 20%)'}}>
                Total Amount
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                className="w-full p-3 rounded-lg bg-gray-100"
                style={{border: '1px solid hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)'}}
                readOnly
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm" style={{color: 'hsl(45, 100%, 20%)'}}>Urgent</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isBillable"
                  checked={formData.isBillable}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm" style={{color: 'hsl(45, 100%, 20%)'}}>Billable</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isComplimentary"
                  checked={formData.isComplimentary}
                  onChange={handleChange}
                  className="rounded"
                />
                <span className="text-sm" style={{color: 'hsl(45, 100%, 20%)'}}>Complimentary</span>
              </label>
            </div>
          </div>

          {/* Order Dates */}
          {isEditing && formData.createdAt && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 20%)'}}>
                Order Information
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Created:</strong> {new Date(formData.createdAt).toLocaleDateString()}</div>
                <div><strong>Updated:</strong> {new Date(formData.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          )}



          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border rounded-lg transition-colors"
              style={{borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 100%, 95%)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 rounded-lg text-white transition-colors disabled:opacity-50"
              style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
              onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = 'hsl(45, 32%, 46%)')}
              onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = 'hsl(45, 43%, 58%)')}
            >
              <Save size={18} className="mr-2" />
              {loading ? 'Saving...' : (isEditing ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default LaundryEditForm;