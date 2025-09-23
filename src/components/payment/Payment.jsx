import React, { useState } from 'react';
import { showToast } from '../../utils/toaster';
import { validateRequired, validatePositiveNumber } from '../../utils/validation';

const Payment = () => {
  const [payments, setPayments] = useState([
    {
      _id: '1',
      sourceType: 'Booking',
      sourceId: 'BK001',
      invoiceId: 'INV-001',
      paymentNumber: 'PAY-123456',
      amount: 5000,
      paymentMode: 'Cash',
      isAdvance: false,
      status: 'Paid',
      collectedBy: 'John Doe',
      remarks: 'Room booking payment',
      receivedAt: '2024-01-15T10:30:00'
    },
    {
      _id: '2',
      sourceType: 'Restaurant',
      sourceId: 'REST-002',
      invoiceId: 'INV-002',
      paymentNumber: 'PAY-789012',
      amount: 1200,
      paymentMode: 'UPI',
      isAdvance: false,
      status: 'Paid',
      collectedBy: 'Jane Smith',
      remarks: 'Dinner bill payment',
      receivedAt: '2024-01-16T19:45:00'
    },
    {
      _id: '3',
      sourceType: 'CabBooking',
      sourceId: 'CAB-003',
      invoiceId: '',
      paymentNumber: 'PAY-345678',
      amount: 800,
      paymentMode: 'Card',
      isAdvance: true,
      status: 'Paid',
      collectedBy: 'Mike Johnson',
      remarks: 'Advance payment for cab booking',
      receivedAt: '2024-01-17T08:15:00'
    },
    {
      _id: '4',
      sourceType: 'Laundry',
      sourceId: 'LAU-004',
      invoiceId: 'INV-004',
      paymentNumber: 'PAY-901234',
      amount: 300,
      paymentMode: 'Cash',
      isAdvance: false,
      status: 'Pending',
      collectedBy: '',
      remarks: 'Laundry service payment pending',
      receivedAt: '2024-01-18T14:20:00'
    },
    {
      _id: '5',
      sourceType: 'Pantry',
      sourceId: 'PAN-005',
      invoiceId: 'INV-005',
      paymentNumber: 'PAY-567890',
      amount: 450,
      paymentMode: 'Bank Transfer',
      isAdvance: false,
      status: 'Failed',
      collectedBy: 'Sarah Wilson',
      remarks: 'Payment failed due to insufficient funds',
      receivedAt: '2024-01-19T11:30:00'
    }
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPayment, setCurrentPayment] = useState({
    sourceType: '',
    sourceId: '',
    invoiceId: '',
    paymentNumber: '',
    amount: 0,
    paymentMode: '',
    isAdvance: false,
    status: 'Paid',
    collectedBy: '',
    remarks: '',
    receivedAt: new Date().toISOString().slice(0, 16)
  });

  const sourceTypes = ['Booking', 'Reservation', 'CabBooking', 'Laundry', 'Pantry', 'Restaurant', 'RoomInspection'];
  const paymentModes = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];
  const statusOptions = ['Pending', 'Paid', 'Failed'];

  const generatePaymentNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `PAY-${timestamp}`;
  };

  const handleAddPayment = () => {
    setEditMode(false);
    setCurrentPayment({
      sourceType: '',
      sourceId: '',
      invoiceId: '',
      paymentNumber: generatePaymentNumber(),
      amount: 0,
      paymentMode: '',
      isAdvance: false,
      status: 'Paid',
      collectedBy: '',
      remarks: '',
      receivedAt: new Date().toISOString().slice(0, 16)
    });
    setShowForm(true);
  };

  const handleEditPayment = (payment) => {
    setEditMode(true);
    setCurrentPayment({
      ...payment,
      receivedAt: new Date(payment.receivedAt).toISOString().slice(0, 16)
    });
    setShowForm(true);
  };

  const validateForm = () => {
    if (!validateRequired(currentPayment.sourceType)) {
      showToast.error('Source type is required');
      return false;
    }
    if (!validateRequired(currentPayment.sourceId)) {
      showToast.error('Source ID is required');
      return false;
    }
    if (!validateRequired(currentPayment.paymentNumber)) {
      showToast.error('Payment number is required');
      return false;
    }
    if (!validatePositiveNumber(currentPayment.amount)) {
      showToast.error('Amount must be a positive number');
      return false;
    }
    if (!validateRequired(currentPayment.paymentMode)) {
      showToast.error('Payment mode is required');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    // TODO: API call will be added here
    if (editMode) {
      setPayments(payments.map(p => p._id === currentPayment._id ? currentPayment : p));
      showToast.success('Payment updated successfully');
    } else {
      const newPayment = { ...currentPayment, _id: Date.now().toString() };
      setPayments([...payments, newPayment]);
      showToast.success('Payment added successfully');
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      setPayments(payments.filter(p => p._id !== id));
      showToast.success('Payment deleted successfully');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#1f2937]">Payment Management</h1>
        <button
          onClick={handleAddPayment}
          className="bg-secondary text-dark px-4 py-2 rounded-lg hover:shadow-lg transition-shadow font-medium"
        >
          + Add Payment
        </button>
      </div>

      {/* Payment Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  💳 {editMode ? 'Edit Payment' : 'Add New Payment'}
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Source Type *</label>
                  <select
                    value={currentPayment.sourceType}
                    onChange={(e) => setCurrentPayment({...currentPayment, sourceType: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Source Type</option>
                    {sourceTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Source ID *</label>
                  <input
                    type="text"
                    value={currentPayment.sourceId}
                    onChange={(e) => setCurrentPayment({...currentPayment, sourceId: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter source ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Number *</label>
                  <input
                    type="text"
                    value={currentPayment.paymentNumber}
                    onChange={(e) => setCurrentPayment({...currentPayment, paymentNumber: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="PAY-123456"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount *</label>
                  <input
                    type="number"
                    value={currentPayment.amount}
                    onChange={(e) => setCurrentPayment({...currentPayment, amount: parseFloat(e.target.value)})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Payment Mode *</label>
                  <select
                    value={currentPayment.paymentMode}
                    onChange={(e) => setCurrentPayment({...currentPayment, paymentMode: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Payment Mode</option>
                    {paymentModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={currentPayment.status}
                    onChange={(e) => setCurrentPayment({...currentPayment, status: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Invoice ID</label>
                  <input
                    type="text"
                    value={currentPayment.invoiceId}
                    onChange={(e) => setCurrentPayment({...currentPayment, invoiceId: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional invoice ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Collected By</label>
                  <input
                    type="text"
                    value={currentPayment.collectedBy}
                    onChange={(e) => setCurrentPayment({...currentPayment, collectedBy: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Staff name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Received At</label>
                  <input
                    type="datetime-local"
                    value={currentPayment.receivedAt}
                    onChange={(e) => setCurrentPayment({...currentPayment, receivedAt: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAdvance"
                    checked={currentPayment.isAdvance}
                    onChange={(e) => setCurrentPayment({...currentPayment, isAdvance: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isAdvance" className="text-sm font-medium">Advance Payment</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  value={currentPayment.remarks}
                  onChange={(e) => setCurrentPayment({...currentPayment, remarks: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editMode ? 'Update' : 'Add'} Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {payment.paymentNumber}
                    {payment.isAdvance && <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Advance</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">{payment.sourceType}</div>
                      <div className="text-sm text-gray-500">{payment.sourceId}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                    ₹{payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{payment.paymentMode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(payment.receivedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditPayment(payment)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(payment._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {payments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No payments found. Add a new payment to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default Payment;
