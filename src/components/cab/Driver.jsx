
import React, { useState, useEffect, useRef } from 'react';
import { showToast } from '../../utils/toaster';
import { useAppContext } from '../../context/AppContext';

function App() {
  const context = useAppContext();
  const axios = context?.axios;
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    driverName: '',
    contactNumber: '',
    licenseNumber: '',
    licenseExpiry: '',
    address: '',
    idProofType: 'AADHAAR',
    idProofNumber: '',
    driverPhotoUrl: '', // This will now store the Base64 string
    notes: '',
    status: 'ACTIVE',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // State for camera functionality
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const getAuthToken = () => localStorage.getItem("token");

  // Function to fetch all drivers from the backend
  const fetchDrivers = async () => {
    if (!axios) {
      setError('Axios instance not available');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      const response = await axios.get('/api/driver', {
        headers: { Authorization: `Bearer ${token}` }
      }); // API for getting all drivers
      let data = response.data;

      // Ensure data is an array, handling various API response structures
      if (data && typeof data === 'object' && data.drivers && Array.isArray(data.drivers)) {
        data = data.drivers; // Adjust if your API wraps the array in an object like { drivers: [...] }
      } else if (!Array.isArray(data)) {
        console.warn("API response for /driver was not an array or did not contain a 'drivers' array:", data);
        data = [];
      }

      // Format licenseExpiry date for display in the form (YYYY-MM-DD)
      const formattedData = data.map(driver => ({
        ...driver,
        licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
      }));
      setDrivers(formattedData);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      setError(`Failed to load drivers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch drivers on component mount
  useEffect(() => {
    if (axios) {
      fetchDrivers();
    }
  }, [axios]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file input change for image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, driverPhotoUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Open camera modal (doesn't start stream immediately, relies on useEffect)
  const openCameraModal = () => {
    setIsCameraOpen(true);
  };

  // Close camera and stop stream
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  // Toggle camera facing mode
  const toggleCameraFacingMode = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    // Close current stream, then let useEffect restart with new facing mode
    closeCamera();
    setIsCameraOpen(true); // Keep modal open to trigger new stream
  };

  // Effect to manage camera stream lifecycle
  useEffect(() => {
    let currentLocalStream = null; // Use a local variable to manage stream for this effect instance

    const setupCamera = async () => {
      if (isCameraOpen && videoRef.current) {
        try {
          currentLocalStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
          videoRef.current.srcObject = currentLocalStream;
          setStream(currentLocalStream); // Update state with the new stream
        } catch (err) {
          console.error("Error accessing camera:", err);
          setError("Failed to access camera. Please ensure permissions are granted.");
          setIsCameraOpen(false); // Close camera modal if stream fails
        }
      } else if (!isCameraOpen && stream) { // If camera is closed and there's an active stream in state, stop it
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };

    setupCamera();

    // Cleanup function: This runs when the component unmounts or before the effect re-runs
    return () => {
      if (currentLocalStream) { // Use the local variable `currentLocalStream` for cleanup
        currentLocalStream.getTracks().forEach(track => track.stop());
      }
      // No need to setStream(null) here if it's already handled by the main logic or next effect run
    };
  }, [isCameraOpen, facingMode]); // Depend only on isCameraOpen and facingMode

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataURL = canvas.toDataURL('image/png'); // Get image as Base64
      setFormData(prev => ({ ...prev, driverPhotoUrl: imageDataURL }));
      closeCamera(); // Close camera after capturing
    }
  };

  // Handle form submission (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setError(null);

    try {
      // Prepare data for the API, ensuring dates are sent as ISO strings if they exist
      const driverData = {
        ...formData,
        licenseExpiry: formData.licenseExpiry ? new Date(formData.licenseExpiry).toISOString() : null,
      };

      let response;
      let url;

      const token = getAuthToken();
      if (editingDriver) {
        // Changed URL to use singular 'driver' for update
        response = await axios.put(`/api/driver/${editingDriver._id}`, driverData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.post('/api/driver/add', driverData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }



      setMessage(`Driver ${editingDriver ? 'updated' : 'added'} successfully!`);
      resetForm();
      fetchDrivers(); // Re-fetch drivers to update the list
      showToast.success(`✅ Driver ${editingDriver ? 'updated' : 'added'} successfully!`);
    } catch (err) {
      console.error("Error saving driver:", err);
      setError(`Failed to save driver: ${err.message}`);
      showToast.error(`Failed to save driver: ${err.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
    }
  };

  // Set form for editing
  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      driverName: driver.driverName,
      contactNumber: driver.contactNumber,
      licenseNumber: driver.licenseNumber,
      // Ensure date is in YYYY-MM-DD format for input type="date"
      licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
      address: driver.address,
      idProofType: driver.idProofType,
      idProofNumber: driver.idProofNumber,
      driverPhotoUrl: driver.driverPhotoUrl, // Load existing photo URL (Base64 or actual URL)
      notes: driver.notes,
      status: driver.status,
    });
    setIsFormOpen(true);
  };

  // Delete a driver
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      setLoading(true);
      setMessage('');
      setError(null);
      try {
        const token = getAuthToken();
        // Updated: The delete API now uses /api/driver/{id} (singular)
        await axios.delete(`/api/driver/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessage('Driver deleted successfully!');

        fetchDrivers(); // Re-fetch drivers to update the list
        showToast.success('🗑️ Driver deleted successfully!');
      } catch (err) {
        console.error("Error deleting driver:", err);
        setError(`Failed to delete driver: ${err.message}`);
        showToast.error(`Failed to delete driver: ${err.message}`);
      } finally {
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Reset form and close it
  const resetForm = () => {
    setEditingDriver(null);
    setFormData({
      driverName: '',
      contactNumber: '',
      licenseNumber: '',
      licenseExpiry: '',
      address: '',
      idProofType: 'AADHAAR',
      idProofNumber: '',
      driverPhotoUrl: '', // Clear photo URL on reset
      notes: '',
      status: 'ACTIVE',
    });
    setIsFormOpen(false);
    // Ensure camera is closed when form is reset or closed
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Handle clicks outside the modal content
  const handleModalClick = (e) => {
    // Check if the click occurred directly on the overlay, not on the modal content itself
    if (e.target.id === 'driver-form-modal-overlay') {
      resetForm();
    }
  };

  // Get dynamic label, placeholder, and validation rules based on ID proof type
  const getIdProofDetails = (type) => {
    switch (type) {
      case 'AADHAAR':
        return { 
          label: 'Aadhaar Number', 
          placeholder: 'Enter 12-digit Aadhaar number',
          maxLength: 12,
          minLength: 12,
          pattern: '[0-9]{12}',
          inputMode: 'numeric'
        };
      case 'DL':
        return { 
          label: 'Driving License Number', 
          placeholder: 'Enter driving license number',
          maxLength: 20,
          minLength: 10,
          pattern: '[A-Z0-9]+',
          inputMode: 'text'
        };
      case 'VOTER_ID':
        return { 
          label: 'Voter ID Number', 
          placeholder: 'Enter voter ID number',
          maxLength: 10,
          minLength: 10,
          pattern: '[A-Z]{3}[0-9]{7}',
          inputMode: 'text'
        };
      case 'PASSPORT':
        return { 
          label: 'Passport Number', 
          placeholder: 'Enter passport number',
          maxLength: 8,
          minLength: 8,
          pattern: '[A-Z][0-9]{7}',
          inputMode: 'text'
        };
      case 'PAN':
        return { 
          label: 'PAN Number', 
          placeholder: 'Enter PAN number',
          maxLength: 10,
          minLength: 10,
          pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}',
          inputMode: 'text'
        };
      case 'OTHER':
        return { 
          label: 'ID Proof Number', 
          placeholder: 'Enter ID proof number',
          maxLength: 50,
          minLength: 1,
          pattern: null,
          inputMode: 'text'
        };
      default:
        return { 
          label: 'ID Proof Number', 
          placeholder: 'Enter ID proof number',
          maxLength: 50,
          minLength: 1,
          pattern: null,
          inputMode: 'text'
        };
    }
  };

  // Filtered drivers based on search query and status (client-side filtering)
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = searchQuery === '' ||
      driver.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.contactNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || driver.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (!axios) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans flex items-center justify-center" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 font-sans" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
        <h1 className="text-3xl font-bold text-center mb-6" style={{ color: 'hsl(45, 100%, 20%)' }}>Driver Management</h1>

        {/* Message and Error Display */}
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Controls: Add Driver, Search, Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto font-bold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
            style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
          >
            Add New Driver
          </button>

          <input
            type="text"
            placeholder="Search by name, license, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/2 p-2 border rounded-lg shadow-sm"
            style={{ borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
            onFocus={(e) => e.target.style.borderColor = 'hsl(45, 43%, 58%)'}
            onBlur={(e) => e.target.style.borderColor = 'hsl(45, 100%, 85%)'}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto p-2 border rounded-lg shadow-sm"
            style={{ borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
            onFocus={(e) => e.target.style.borderColor = 'hsl(45, 43%, 58%)'}
            onBlur={(e) => e.target.style.borderColor = 'hsl(45, 100%, 85%)'}
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_TRIP">On Trip</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="ml-3 text-gray-700">Loading data...</p>
          </div>
        )}

        {/* Driver List Table */}
        {!loading && (
          <div className="overflow-x-auto rounded-lg shadow-md border" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
            <table className="min-w-full divide-y" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
              <thead style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>Photo</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>Driver Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>Contact No.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>License No.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>License Expiry</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>ID Proof</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y" style={{ borderColor: 'hsl(45, 100%, 85%)' }}>
                {filteredDrivers.length > 0 ? (
                  filteredDrivers.map((driver) => (
                    <tr key={driver._id} className="hover:bg-gray-50" onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'hsl(45, 100%, 95%)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {driver.driverPhotoUrl ? (
                          <img src={driver.driverPhotoUrl} alt="Driver" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Photo</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'hsl(45, 100%, 20%)' }}>{driver.driverName}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>{driver.contactNumber}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>{driver.licenseNumber}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {driver.licenseExpiry || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          driver.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          driver.status === 'ON_TRIP' ? 'bg-blue-100 text-blue-800' :
                          driver.status === 'UNAVAILABLE' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800' // INACTIVE
                        } capitalize`}>
                          {driver.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {driver.idProofType} ({driver.idProofNumber})
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(driver)}
                          className="mr-3 transition duration-150 ease-in-out"
                          style={{ color: 'hsl(45, 43%, 58%)' }}
                          onMouseEnter={(e) => e.target.style.color = 'hsl(45, 32%, 46%)'}
                          onMouseLeave={(e) => e.target.style.color = 'hsl(45, 43%, 58%)'}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(driver._id)}
                          className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-4 py-4 text-center text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>No drivers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Driver Form Modal */}
        {isFormOpen && (
          <div
            id="driver-form-modal-overlay" // Added ID for click detection
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50" // Updated background
            onClick={handleModalClick} // Added onClick handler
          >
            <style>
              {`
              /* For WebKit browsers (Chrome, Safari) */
              .hide-scrollbar::-webkit-scrollbar {
                  display: none;
              }

              /* For Firefox */
              .hide-scrollbar {
                  scrollbar-width: none; /* Firefox */
              }
              `}
            </style>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform scale-95 animate-fade-in hide-scrollbar">
              <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'hsl(45, 100%, 20%)' }}>
                {editingDriver ? 'Edit Driver' : 'Add New Driver'}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Driver Name */}
                <div>
                  <label htmlFor="driverName" className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Driver Name</label>
                  <input
                    type="text"
                    id="driverName"
                    name="driverName"
                    value={formData.driverName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border rounded-md shadow-sm"
                    style={{ borderColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
                    onFocus={(e) => e.target.style.borderColor = 'hsl(45, 43%, 58%)'}
                    onBlur={(e) => e.target.style.borderColor = 'hsl(45, 100%, 85%)'}
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input
                    type="text"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* License Number */}
                <div>
                  <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* License Expiry */}
                <div>
                  <label htmlFor="licenseExpiry" className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                  <input
                    type="date"
                    id="licenseExpiry"
                    name="licenseExpiry"
                    value={formData.licenseExpiry}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                {/* ID Proof Type */}
                <div>
                  <label htmlFor="idProofType" className="block text-sm font-medium text-gray-700 mb-1">ID Proof Type</label>
                  <select
                    id="idProofType"
                    name="idProofType"
                    value={formData.idProofType}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="AADHAAR">AADHAAR</option>
                    <option value="DL">DL</option>
                    <option value="VOTER_ID">VOTER ID</option>
                    <option value="PASSPORT">PASSPORT</option>
                    <option value="PAN">PAN</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>

                {/* ID Proof Number */}
                <div>
                  <label htmlFor="idProofNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    {getIdProofDetails(formData.idProofType).label}
                  </label>
                  <input
                    type="text"
                    id="idProofNumber"
                    name="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={handleChange}
                    placeholder={getIdProofDetails(formData.idProofType).placeholder}
                    maxLength={getIdProofDetails(formData.idProofType).maxLength}
                    minLength={getIdProofDetails(formData.idProofType).minLength}
                    pattern={getIdProofDetails(formData.idProofType).pattern}
                    inputMode={getIdProofDetails(formData.idProofType).inputMode}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    title={`Please enter a valid ${getIdProofDetails(formData.idProofType).label.toLowerCase()}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.idProofType === 'AADHAAR' && 'Must be exactly 12 digits'}
                    {formData.idProofType === 'PAN' && 'Format: ABCDE1234F (5 letters + 4 digits + 1 letter)'}
                    {formData.idProofType === 'PASSPORT' && 'Format: A1234567 (1 letter + 7 digits)'}
                    {formData.idProofType === 'VOTER_ID' && 'Format: ABC1234567 (3 letters + 7 digits)'}
                    {formData.idProofType === 'DL' && 'Enter valid driving license number'}
                  </p>
                </div>

                {/* Driver Photo URL - Replaced with Image Upload/Camera */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Photo</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUploadInput"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('imageUploadInput').click()}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out"
                    >
                      Upload Photo
                    </button>
                    <button
                      type="button"
                      onClick={openCameraModal}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition duration-150 ease-in-out"
                    >
                      Take Photo
                    </button>
                  </div>
                  {formData.driverPhotoUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Photo Preview:</p>
                      <img src={formData.driverPhotoUrl} alt="Driver Preview" className="h-32 w-32 object-cover rounded-md border border-gray-300" />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, driverPhotoUrl: '' }))}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>

                {/* Camera Modal */}
                {isCameraOpen && (
                  <div className="fixed inset-0 bg-gray-800 bg-opacity-90 flex flex-col items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-lg bg-black rounded-lg overflow-hidden shadow-xl">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded-lg"></video>
                      <canvas ref={canvasRef} className="hidden"></canvas>
                      <div className="absolute bottom-0 w-full flex justify-around p-4 bg-gray-900 bg-opacity-75 rounded-b-lg">
                        <button
                          type="button"
                          onClick={toggleCameraFacingMode}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-150 ease-in-out"
                        >
                          Switch Camera ({facingMode === 'user' ? 'Front' : 'Back'})
                        </button>
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-150 ease-in-out"
                        >
                          Capture Photo
                        </button>
                        <button
                          type="button"
                          onClick={closeCamera}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150 ease-in-out"
                        >
                          Close Camera
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="md:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="ON_TRIP">ON TRIP</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150 ease-in-out"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-bold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                    style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'hsl(45, 100%, 20%)' }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
                  >
                    {editingDriver ? 'Update Driver' : 'Add Driver'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
