import React, { useState, useEffect } from "react";
import { Edit, Trash2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { showToast } from "../../utils/toaster";
import Pagination from "../common/Pagination";
import DashboardLoader from '../DashboardLoader';

// Inline ReservationEdit for simplicity
const ReservationEdit = ({ reservation, onSave, onCancel }) => {
  const [current, setCurrent] = useState({
    guestName: reservation.guestName || "",
    grcNo: reservation.grcNo || "",
    status: reservation.status || "",
    checkInDate: reservation.checkInDate || "",
    checkOutDate: reservation.checkOutDate || "",
    mobileNo: reservation.mobileNo || reservation.phoneNo || "",
    noOfRooms: reservation.noOfRooms || 1,
    rate: reservation.rate || 0,
  });

  const handleChange = (field, value) => {
    setCurrent((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(current);
  };

  if (!reservation) return null;

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 rounded shadow"
      style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}
    >
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>GRC No</label>
        <input
          type="text"
          value={current.grcNo}
          onChange={(e) => handleChange("grcNo", e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Guest Name</label>
        <input
          type="text"
          value={current.guestName}
          onChange={(e) => handleChange("guestName", e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Check In</label>
        <input
          type="date"
          value={current.checkInDate ? current.checkInDate.slice(0, 10) : ""}
          onChange={(e) => handleChange("checkInDate", e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Check Out</label>
        <input
          type="date"
          value={current.checkOutDate ? current.checkOutDate.slice(0, 10) : ""}
          onChange={(e) => handleChange("checkOutDate", e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Status</label>
        <select
          value={current.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
        >
          <option value="">Select Status</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Tentative">Tentative</option>
          <option value="Waiting">Waiting</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Mobile No</label>
        <input
          type="tel"
          value={current.mobileNo}
          onChange={(e) => handleChange("mobileNo", e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Number of Rooms</label>
        <input
          type="number"
          min="1"
          value={current.noOfRooms}
          onChange={(e) => handleChange("noOfRooms", e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={{ color: 'hsl(45, 100%, 20%)' }}>Rate</label>
        <input
          type="number"
          min="0"
          value={current.rate}
          onChange={(e) => handleChange("rate", e.target.value)}
          className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
          style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md transition-colors"
          style={{ backgroundColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)', border: '1px solid hsl(45, 100%, 85%)' }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md transition-colors"
          style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'white' }}
        >
          Update
        </button>
      </div>
    </form>
  );
};

const ReservationPage = () => {
  const navigate = useNavigate();
  const { axios } = useAppContext();
  const [reservations, setReservations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for edit overlays
  const [editId, setEditId] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Fetch reservations from the API
  const fetchReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "No authentication token found. Please log in to view reservations."
        );
        setIsLoading(false);
        return;
      }
      const { data } = await axios.get("/api/reservations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReservations(
        Array.isArray(data.reservations) ? data.reservations : []
      );
    } catch (err) {
      setError(err.message || "Failed to load reservations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch booking data by GRC number
  const fetchBookingByGrc = async (grcNo) => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(`/api/bookings/fetch-by-grc/${grcNo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookingData(data);
    } catch (err) {
      setError(`Failed to fetch booking data for GRC: ${grcNo}`);
    }
  };

  // Fetch available rooms
  const fetchAvailableRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get('/api/rooms/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const rooms = Array.isArray(data) ? data : [];
      const available = rooms.filter(room => room.status === 'available');
      setAvailableRooms(available);
    } catch (err) {
      console.error('Error fetching rooms:', err);
    }
  };

  // Convert reservation to booking
  const convertToBooking = async () => {
    if (!selectedReservation || !selectedRoom) {
      showToast.error('Please select a room');
      return;
    }

    setIsConverting(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `/api/bookings/convert-reservation/${selectedReservation._id}`,
        { 
          roomNumber: selectedRoom,
          // Required fields with defaults
          idProofType: 'Aadhaar',
          salutation: 'mr.',
          // Ensure other required fields are present
          name: selectedReservation.guestName || 'Guest',
          mobileNo: selectedReservation.mobileNo || selectedReservation.phoneNo || '0000000000'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showToast.success('Reservation converted to booking successfully!');
      setShowConvertModal(false);
      setSelectedReservation(null);
      setSelectedRoom('');
      fetchReservations(); // Refresh reservations list
    } catch (err) {
      showToast.error(err.response?.data?.error || 'Failed to convert reservation');
    } finally {
      setIsConverting(false);
    }
  };

  // Open convert modal
  const openConvertModal = (reservation) => {
    if (reservation.status === 'Cancelled') {
      showToast.error('Cannot convert cancelled reservation');
      return;
    }
    setSelectedReservation(reservation);
    setShowConvertModal(true);
    fetchAvailableRooms();
  };
  // useeffect
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      await fetchReservations();
      setIsInitialLoading(false);
    };
    loadInitialData();
  }, []);

  // Modal handler
  const handleEditModal = (reservation) => setEditId(reservation._id);

  // Update reservation via API (only table fields)
  const updateReservation = async (reservationId, updatedData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast.error("Authentication required. Please log in.");
      return;
    }
    // Send all the fields shown in the table
    const payload = {
      guestName: updatedData.guestName,
      grcNo: updatedData.grcNo,
      status: updatedData.status,
      checkInDate: updatedData.checkInDate,
      checkOutDate: updatedData.checkOutDate,
      mobileNo: updatedData.mobileNo,
      noOfRooms: updatedData.noOfRooms,
      rate: updatedData.rate,
    };
    try {
      await axios.put(`/api/reservations/${reservationId}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchReservations();
      setEditId(null);
    } catch (error) {
      showToast.error(`Update failed: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = async (reservation) => {
    setError(null);
    if (!reservation || !reservation._id) {
      setError("Cannot delete: Reservation ID not found.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/reservations/${reservation._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchReservations();
    } catch (err) {
      setError("Failed to delete reservation. Please try again.");
    }
  };

  const filtered = Array.isArray(reservations)
    ? reservations.filter(
        (r) =>
          typeof r.guestName === "string" &&
          r.guestName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedReservations = filtered.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const inputStyle =
    "rounded-lg pl-4 pr-4 py-2 focus:outline-none focus:ring-2";

  if (isInitialLoading) {
    return <DashboardLoader pageName="Reservations" />;
  }

  return (
    <div className="p-6 overflow-auto h-full bg-background">
      <div className="flex justify-between items-center mb-8 mt-6">
        <h1 className="text-3xl font-extrabold text-[#1f2937]">
          Reservations
        </h1>
        <button
          onClick={() => navigate("/reservationform")}
          className="px-4 py-2 rounded text-sm sm:text-base transition-colors"
          style={{ backgroundColor: 'hsl(45, 43%, 58%)', color: 'white' }}
        >
          Add Reservation
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search by guest name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`${inputStyle} w-full sm:max-w-md pl-10`}
          style={{ backgroundColor: 'white', border: '1px solid hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
        />
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded relative mb-4"
          style={{ backgroundColor: 'hsl(0, 100%, 95%)', border: '1px solid hsl(0, 100%, 85%)', color: 'hsl(0, 100%, 30%)' }}
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">
            {" "}
            {typeof error === "string" ? error : JSON.stringify(error)}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4" style={{ color: 'hsl(45, 100%, 20%)' }}>Loading reservations...</div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-xl shadow-sm" style={{ backgroundColor: 'white', border: '1px solid hsl(45, 100%, 85%)' }}>
            <table className="min-w-full text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
              <thead className="border-b" style={{ backgroundColor: 'hsl(45, 100%, 90%)', borderColor: 'hsl(45, 100%, 85%)' }}>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    Guest Name
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    GRC No
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    Check In
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    Check Out
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    Mobile
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    Rooms
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    Rate
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: 'hsl(45, 100%, 20%)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'white', borderColor: 'hsl(45, 100%, 90%)' }}>
                {paginatedReservations.length > 0 ? (
                  paginatedReservations.map((b) => (
                    <tr key={b._id}>
                      <td className="px-3 py-3 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {b.guestName}
                        {b.vip && <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'hsl(45, 71%, 69%)', color: 'hsl(45, 100%, 20%)' }}>VIP</span>}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {b.grcNo ? (
                          <button
                            onClick={() => fetchBookingByGrc(b.grcNo)}
                            className="underline transition-colors"
                            style={{ color: 'hsl(45, 43%, 58%)' }}
                          >
                            {b.grcNo}
                          </button>
                        ) : "N/A"}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          b.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                          b.status === 'Tentative' ? 'bg-yellow-100 text-yellow-800' :
                          b.status === 'Waiting' ? 'bg-blue-100 text-blue-800' :
                          b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {b.status || 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {b.mobileNo || b.phoneNo || 'N/A'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        {b.noOfRooms || 1}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm" style={{ color: 'hsl(45, 100%, 20%)' }}>
                        ₹{b.rate || 0}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex space-x-1 justify-center">
                          <button
                            onClick={() => handleEditModal(b)}
                            className="p-1.5 rounded-full transition-colors"
                            style={{ color: 'hsl(45, 43%, 58%)' }}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          {b.status !== 'Cancelled' && !b.linkedCheckInId && (
                            <button
                              onClick={() => openConvertModal(b)}
                              className="p-1.5 rounded-full transition-colors"
                              style={{ color: 'hsl(120, 60%, 40%)' }}
                              title="Convert to Booking"
                            >
                              <ArrowRight size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(b)}
                            className="p-1.5 rounded-full transition-colors"
                            style={{ color: 'hsl(0, 60%, 50%)' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-4 text-center"
                      style={{ color: 'hsl(45, 100%, 40%)' }}
                    >
                      No reservations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {paginatedReservations.length > 0 ? (
              paginatedReservations.map((b) => (
                <div
                  key={b._id}
                  className="rounded-lg shadow-sm p-4"
                  style={{ backgroundColor: 'white', border: '1px solid hsl(45, 100%, 85%)' }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: 'hsl(45, 100%, 20%)' }}>{b.guestName}</h3>
                      <p className="text-sm" style={{ color: 'hsl(45, 100%, 40%)' }}>GRC: 
                        {b.grcNo ? (
                          <button
                            onClick={() => fetchBookingByGrc(b.grcNo)}
                            className="underline ml-1 transition-colors"
                            style={{ color: 'hsl(45, 43%, 58%)' }}
                          >
                            {b.grcNo}
                          </button>
                        ) : "N/A"}
                      </p>
                      {b.vip && <span className="inline-block mt-1 px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'hsl(45, 71%, 69%)', color: 'hsl(45, 100%, 20%)' }}>VIP</span>}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      b.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      b.status === 'Tentative' ? 'bg-yellow-100 text-yellow-800' :
                      b.status === 'Waiting' ? 'bg-blue-100 text-blue-800' :
                      b.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {b.status || 'N/A'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <span style={{ color: 'hsl(45, 100%, 40%)' }}>Check In:</span>
                      <span className="ml-1 font-medium" style={{ color: 'hsl(45, 100%, 20%)' }}>{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(45, 100%, 40%)' }}>Check Out:</span>
                      <span className="ml-1 font-medium" style={{ color: 'hsl(45, 100%, 20%)' }}>{b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(45, 100%, 40%)' }}>Mobile:</span>
                      <span className="ml-1 font-medium" style={{ color: 'hsl(45, 100%, 20%)' }}>{b.mobileNo || b.phoneNo || 'N/A'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'hsl(45, 100%, 40%)' }}>Rooms:</span>
                      <span className="ml-1 font-medium" style={{ color: 'hsl(45, 100%, 20%)' }}>{b.noOfRooms || 1}</span>
                    </div>
                    <div className="col-span-2">
                      <span style={{ color: 'hsl(45, 100%, 40%)' }}>Rate:</span>
                      <span className="ml-1 font-medium text-lg" style={{ color: 'hsl(45, 100%, 20%)' }}>₹{b.rate || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-3 border-t" style={{ borderColor: 'hsl(45, 100%, 90%)' }}>
                    <button
                      onClick={() => handleEditModal(b)}
                      className="p-2 rounded-full transition duration-300"
                      style={{ color: 'hsl(45, 43%, 58%)' }}
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    {b.status !== 'Cancelled' && !b.linkedCheckInId && (
                      <button
                        onClick={() => openConvertModal(b)}
                        className="p-2 rounded-full transition duration-300"
                        style={{ color: 'hsl(120, 60%, 40%)' }}
                        title="Convert to Booking"
                      >
                        <ArrowRight size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(b)}
                      className="p-2 rounded-full transition duration-300"
                      style={{ color: 'hsl(0, 60%, 50%)' }}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg shadow-sm p-8 text-center" style={{ backgroundColor: 'white', border: '1px solid hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 40%)' }}>
                No reservations found.
              </div>
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filtered.length}
          />
        </>
      )}

      {/* Overlay for edit */}
      {editId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
            <ReservationEdit
              reservation={reservations.find((r) => r._id === editId)}
              onSave={async (updated) => {
                await updateReservation(editId, updated);
              }}
              onCancel={() => setEditId(null)}
            />
          </div>
        </div>
      )}

      {/* Convert to Booking Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: 'hsl(45, 100%, 95%)' }}>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'hsl(45, 100%, 20%)' }}>
                Convert Reservation to Booking
              </h3>
              
              <div className="mb-4">
                <p className="text-sm mb-2" style={{ color: 'hsl(45, 100%, 30%)' }}>
                  Guest: <strong>{selectedReservation?.guestName}</strong>
                </p>
                <p className="text-sm mb-4" style={{ color: 'hsl(45, 100%, 30%)' }}>
                  Check-in: <strong>{selectedReservation?.checkInDate ? new Date(selectedReservation.checkInDate).toLocaleDateString() : 'N/A'}</strong>
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'hsl(45, 100%, 20%)' }}>
                  Select Room *
                </label>
                <select
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                  style={{ border: '1px solid hsl(45, 100%, 85%)', backgroundColor: 'white', color: 'hsl(45, 100%, 20%)' }}
                >
                  <option value="">Choose a room...</option>
                  {availableRooms.map((room) => (
                    <option key={room._id} value={room.room_number || room.roomNumber}>
                      Room {room.room_number || room.roomNumber} - {room.categoryId?.name || 'Standard'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowConvertModal(false);
                    setSelectedReservation(null);
                    setSelectedRoom('');
                  }}
                  className="px-4 py-2 rounded-md transition-colors"
                  style={{ backgroundColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)' }}
                  disabled={isConverting}
                >
                  Cancel
                </button>
                <button
                  onClick={convertToBooking}
                  className="px-4 py-2 rounded-md transition-colors"
                  style={{ backgroundColor: 'hsl(120, 60%, 40%)', color: 'white' }}
                  disabled={isConverting || !selectedRoom}
                >
                  {isConverting ? 'Converting...' : 'Convert to Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationPage;
