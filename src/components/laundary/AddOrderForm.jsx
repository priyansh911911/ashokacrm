import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AddOrderForm = ({ onSave, onClose }) => {
  const { axios } = useAppContext();
  
  const [formData, setFormData] = useState({
    bookingId: "",
    grcNo: "",
    roomNumber: "",
    requestedByName: "",
    items: [{ rateId: "", quantity: 1, status: "pending" }],
    laundryStatus: "pending",
    isUrgent: false,
    urgencyNote: "",
    specialInstructions: "",
    scheduledPickupTime: "",
    scheduledDeliveryTime: "",
    isBillable: true,
    isComplimentary: false,
    billStatus: "unpaid",
    receivedBy: ""
  });
  
  const [bookings, setBookings] = useState([]);
  const [laundryRates, setLaundryRates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/bookings/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const bookingsData = Array.isArray(response.data) ? response.data : response.data?.bookings || [];
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to fetch bookings');
      }
    };

    const fetchLaundryRates = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/laundry-rates/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const ratesData = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setLaundryRates(ratesData);
      } catch (error) {
        console.error('Error fetching laundry rates:', error);
        toast.error('Failed to fetch laundry items');
      }
    };

    fetchBookings();
    fetchLaundryRates();
  }, [axios]);

  const handleBookingChange = (e) => {
    const bookingId = e.target.value;
    
    if (!bookingId) {
      setFormData({
        ...formData,
        bookingId: "",
        grcNo: "",
        roomNumber: "",
        requestedByName: ""
      });
      return;
    }

    // Use local booking data for immediate auto-fill
    const selectedBooking = bookings.find(b => b._id === bookingId);
    if (selectedBooking) {
      setFormData({
        ...formData,
        bookingId,
        grcNo: selectedBooking.grcNo || "",
        roomNumber: selectedBooking.roomNumber || "",
        requestedByName: selectedBooking.guestName || selectedBooking.name || ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    if (field === 'rateId') {
      const selectedRate = laundryRates.find(rate => rate._id === value);
      newItems[index] = {
        ...newItems[index],
        rateId: value,
        itemName: selectedRate?.itemName || ""
      };
    } else {
      newItems[index][field] = value;
    }
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { rateId: "", quantity: 1, status: "pending" }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.items.some(item => item.rateId && item.quantity)) {
      toast.error('Please add at least one valid item');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Creating order...');
    
    try {
      const token = localStorage.getItem('token');
      const validItems = formData.items.filter(item => item.rateId && item.quantity);
      
      const response = await axios.post('/api/laundry/order', 
        { ...formData, items: validItems },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Order created successfully!', { id: loadingToast });
      onSave(response.data); // Pass the created order back to parent
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create order';
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-text">Add New Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Booking Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Select Booking</label>
            <select
              value={formData.bookingId}
              onChange={handleBookingChange}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-primary"
            >
              <option value="">Select a booking...</option>
              {bookings.map(booking => (
                <option key={booking._id} value={booking._id}>
                  {booking.guestName || booking.name || 'Unknown Guest'} - Room {booking.roomNumber || 'N/A'} {booking.grcNo ? `(GRC: ${booking.grcNo})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Guest Info (Read-only) */}
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              value={formData.grcNo}
              placeholder="GRC No"
              className="p-2 border rounded bg-gray-100"
              readOnly
            />
            <input
              type="text"
              value={formData.roomNumber}
              placeholder="Room Number"
              className="p-2 border rounded bg-gray-100"
              readOnly
            />
            <input
              type="text"
              value={formData.requestedByName}
              placeholder="Guest Name"
              className="p-2 border rounded bg-gray-100"
              readOnly
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Pickup Time</label>
              <input
                type="datetime-local"
                name="scheduledPickupTime"
                value={formData.scheduledPickupTime}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Time</label>
              <input
                type="datetime-local"
                name="scheduledDeliveryTime"
                value={formData.scheduledDeliveryTime}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          {/* Order Status & Received By */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Order Status</label>
              <select
                name="laundryStatus"
                value={formData.laundryStatus}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="partially_delivered">Partially Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Received By</label>
              <input
                type="text"
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                placeholder="Staff name..."
              />
            </div>
          </div>

          {/* Flags */}
          <div className="grid grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isUrgent"
                checked={formData.isUrgent}
                onChange={handleChange}
              />
              <span className="text-sm">Urgent</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isBillable"
                checked={formData.isBillable}
                onChange={handleChange}
              />
              <span className="text-sm">Billable</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isComplimentary"
                checked={formData.isComplimentary}
                onChange={handleChange}
              />
              <span className="text-sm">Complimentary</span>
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Bill Status</label>
              <select
                name="billStatus"
                value={formData.billStatus}
                onChange={handleChange}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="waived">Waived</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          {formData.isUrgent && (
            <div>
              <label className="block text-sm font-medium mb-1">Urgency Note</label>
              <textarea
                name="urgencyNote"
                value={formData.urgencyNote}
                onChange={handleChange}
                rows="2"
                className="w-full p-2 border rounded"
                placeholder="Reason for urgency..."
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium mb-1">Special Instructions</label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              rows="2"
              className="w-full p-2 border rounded"
              placeholder="Any special instructions..."
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Items</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-2 py-1 text-sm bg-primary text-white rounded hover:bg-hover"
              >
                <Plus size={14} className="mr-1" /> Add Item
              </button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-end">
                <div className="col-span-5">
                  <select
                    value={item.rateId}
                    onChange={(e) => handleItemChange(index, 'rateId', e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Item</option>
                    {laundryRates.map(rate => (
                      <option key={rate._id} value={rate._id}>
                        {rate.itemName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full p-2 border rounded"
                    min="1"
                    placeholder="Qty"
                    required
                  />
                </div>
                <div className="col-span-3">
                  <select
                    value={item.status || 'pending'}
                    onChange={(e) => handleItemChange(index, 'status', e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="pending">Pending</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-span-1">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded w-full"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-hover disabled:opacity-50"
            >
              <Save size={16} className="mr-1" />
              {loading ? 'Saving...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderForm;