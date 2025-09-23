import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../utils/toaster';
import Pagination from './common/Pagination';

const backendAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true
});

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

function Customer() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    nationality: '',
    idType: 'Passport',
    idNumber: '',
    companyName: '',
    gstNumber: '',
    isVip: false,
    notes: ''
  });

  const getAuthToken = () => localStorage.getItem("token");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const token = getAuthToken();
      // Use bookings API to get customer data
      const { data } = await backendAxios.get('/api/bookings/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bookings = Array.isArray(data) ? data : data.bookings || [];
      
      // Extract unique customers from bookings
      const uniqueCustomers = [];
      const seen = new Set();
      
      bookings.forEach(booking => {
        const key = `${booking.name}-${booking.email || booking.mobileNo}`;
        if (!seen.has(key) && booking.name) {
          seen.add(key);
          uniqueCustomers.push({
            _id: booking._id,
            name: booking.name,
            email: booking.email || '',
            phone: booking.mobileNo || '',
            address: booking.address || '',
            city: booking.city || '',
            nationality: booking.nationality || '',
            idType: 'N/A',
            idNumber: '',
            companyName: booking.companyName || '',
            gstNumber: booking.companyGSTIN || '',
            isVip: booking.vip || false,
            notes: ''
          });
        }
      });
      
      setCustomers(uniqueCustomers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getAuthToken();
      // Create a booking entry for new customer
      const bookingData = {
        name: formData.name,
        email: formData.email,
        mobileNo: formData.phone,
        address: formData.address,
        city: formData.city,
        nationality: formData.nationality,
        companyName: formData.companyName,
        companyGSTIN: formData.gstNumber,
        vip: formData.isVip,
        status: 'Draft',
        checkInDate: new Date().toISOString().split('T')[0],
        checkOutDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        roomNumber: 'TBD'
      };
      
      if (editingCustomer) {
        await backendAxios.put(`/api/bookings/update/${editingCustomer._id}`, bookingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await backendAxios.post('/api/bookings/create', bookingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      showToast.success(`Customer ${editingCustomer ? 'updated' : 'added'} successfully!`);
      resetForm();
      fetchCustomers();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      const token = getAuthToken();
      await backendAxios.delete(`/api/bookings/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast.success('Customer deleted successfully!');
      fetchCustomers();
    } catch (err) {
      showToast.error(err.message);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      nationality: customer.nationality || '',
      idType: customer.idType || 'Passport',
      idNumber: customer.idNumber || '',
      companyName: customer.companyName || '',
      gstNumber: customer.gstNumber || '',
      isVip: customer.isVip || false,
      notes: customer.notes || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      nationality: '',
      idType: 'Passport',
      idNumber: '',
      companyName: '',
      gstNumber: '',
      isVip: false,
      notes: ''
    });
    setEditingCustomer(null);
    setShowForm(false);
  };

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans bg-background">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-border">
        <h1 className="text-3xl font-bold text-center mb-6 text-text">Customer Management</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <div className="flex justify-end mb-6">
          <button 
            onClick={() => setShowForm(true)}
            className="font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 bg-primary text-text hover:bg-hover"
          >
            Add New Customer
          </button>
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
              <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: 'hsl(45, 100%, 20%)' }}>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nationality</label>
                    <input
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Type</label>
                    <select
                      name="idType"
                      value={formData.idType}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Passport">Passport</option>
                      <option value="Aadhar">Aadhar Card</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Voter ID">Voter ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID Number</label>
                    <input
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GST Number</label>
                    <input
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="2"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    name="isVip"
                    type="checkbox"
                    checked={formData.isVip}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">VIP Customer</label>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                  >
                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!loading && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'hsl(45, 100%, 20%)' }}>All Customers</h2>
            <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedCustomers.length > 0 ? (
                    paginatedCustomers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{customer.email || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{customer.phone || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{customer.city || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{customer.idType || 'N/A'}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            customer.isVip ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {customer.isVip ? 'VIP' : 'Regular'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right text-sm font-medium flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-indigo-600 hover:text-indigo-900 transition duration-150 ease-in-out"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
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
                        No customers found.
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
              totalItems={customers.length}
            />
          </div>
        )}


      </div>
    </div>
  );
}

export default Customer;