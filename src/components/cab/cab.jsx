
import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { showToast } from "../../utils/toaster";

// Utility function to get the authentication token
const getAuthToken = () => {
  return localStorage.getItem("token");
};

// Custom Modal component for confirmation messages (e.g., delete)
const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
        <p className="text-lg font-semibold text-gray-800 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal component for editing a cab booking
const EditBookingModal = ({ booking, onClose, onSave, showMessage }) => {
  // Local state to manage form inputs, initialized with current booking data
  const [formData, setFormData] = useState({
    pickupLocation: booking.pickupLocation || "",
    destination: booking.destination || "",
    pickupTime: booking.pickupTime
      ? new Date(booking.pickupTime).toISOString().slice(0, 16)
      : "", // Format for datetime-local input
    status: booking.status || "pending",
    cabType: booking.cabType || "standard",
    purpose: booking.purpose || "guest_transport",
    guestName: booking.guestName || "",
    guestContact: booking.guestContact || "",
    numberOfGuests: booking.numberOfGuests || 1,
    specialInstructions: booking.specialInstructions || "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Ensure pickupTime is in a valid format for backend (e.g., ISO string)
    const dataToSend = {
      ...formData,
      pickupTime: new Date(formData.pickupTime).toISOString(),
      numberOfGuests: parseInt(formData.numberOfGuests, 10), // Convert to number
    };
    onSave(booking._id, dataToSend); // Call the parent's save function
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Edit Cab Booking
        </h3>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>

        {showMessage && (
          <div
            className={`p-3 rounded-md text-center mb-4 ${
              showMessage.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {showMessage.text}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Pickup Location */}
          <div>
            <label
              htmlFor="pickupLocation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pickup Location
            </label>
            <input
              type="text"
              id="pickupLocation"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Destination */}
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Destination
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Pickup Time */}
          <div>
            <label
              htmlFor="pickupTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pickup Time
            </label>
            <input
              type="datetime-local"
              id="pickupTime"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="on_route">On Route</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Cab Type */}
          <div>
            <label
              htmlFor="cabType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Cab Type
            </label>
            <select
              id="cabType"
              name="cabType"
              value={formData.cabType}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="suv">SUV</option>
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label
              htmlFor="purpose"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Purpose
            </label>
            <select
              id="purpose"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="guest_transport">Guest Transport</option>
              <option value="hotel_supply">Hotel Supply</option>
              <option value="staff_pickup">Staff Pickup</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Guest Name */}
          <div>
            <label
              htmlFor="guestName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Guest Name
            </label>
            <input
              type="text"
              id="guestName"
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Guest Contact */}
          <div>
            <label
              htmlFor="guestContact"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Guest Contact
            </label>
            <input
              type="text"
              id="guestContact"
              name="guestContact"
              value={formData.guestContact}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Number of Guests */}
          <div>
            <label
              htmlFor="numberOfGuests"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Number of Guests
            </label>
            <input
              type="number"
              id="numberOfGuests"
              name="numberOfGuests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              min="1"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Special Instructions */}
          <div className="md:col-span-2">
            <label
              htmlFor="specialInstructions"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Special Instructions
            </label>
            <textarea
              id="specialInstructions"
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CabBookingListPage = forwardRef(({ onBookingActionSuccess }, ref) => {
  const { axios } = useAppContext();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCabType, setFilterCabType] = useState("all");
  const [filterPurpose, setFilterPurpose] = useState("all");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // State for edit modal
  const [editingBooking, setEditingBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMessage, setEditMessage] = useState(null); // For messages within the edit modal

  // State for delete confirmation modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [bookingToDeleteId, setBookingToDeleteId] = useState(null);

  // Uncommented: Hook for programmatic navigation
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    const token = getAuthToken();

    if (!token) {
      setError("Authentication token not found. Please log in.");
      setLoading(false);
      setBookings([]);
      showToast.error('Authentication token not found. Please log in.');
      return;
    }

    try {
      const { data: responseData } = await axios.get("/api/cab/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const bookingsArray = responseData.bookings;

      if (Array.isArray(bookingsArray)) {
        setBookings(bookingsArray);
      } else {
        console.warn(
          "API response 'bookings' property was not an array or was missing:",
          responseData
        );
        setBookings([]);
      }
    } catch (e) {
      setError(`Failed to fetch bookings: ${e.message}`);
      console.error("Fetch error:", e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    fetchBookings: fetchBookings,
  }));

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handler for opening the edit modal
  const handleEditClick = (booking) => {
    setEditingBooking(booking);
    setIsEditModalOpen(true);
    setEditMessage(null); // Clear any previous messages in the edit modal
  };

  // Handler for closing the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingBooking(null);
    setEditMessage(null);
  };

  // Handler for saving updated booking data
  const handleUpdateBooking = async (id, updatedData) => {
    setEditMessage(null); // Clear previous messages
    const token = getAuthToken();
    if (!token) {
      setEditMessage({
        text: "Authentication token not found. Please log in.",
        type: "error",
      });
      showToast.error('Authentication token not found. Please log in.');
      return;
    }

    console.log("Attempting to update booking with ID:", id);
    console.log("Data being sent:", updatedData);

    try {
      await axios.put(`/api/cab/bookings/${id}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEditMessage({
        text: "Booking successfully updated!",
        type: "success",
      });
      fetchBookings(); // Refresh the list
      if (onBookingActionSuccess) onBookingActionSuccess();
      showToast.success('✅ Booking successfully updated!');
      // Optionally close modal after a short delay or user interaction
      setTimeout(() => handleCloseEditModal(), 1500);
    } catch (e) {
      setEditMessage({
        text: `Network error during update: ${e.message}`,
        type: "error",
      });
      console.error("Update error:", e);
    }
  };

  // Handler for initiating delete confirmation
  const handleDeleteClick = (id) => {
    setBookingToDeleteId(id);
    setShowDeleteConfirmModal(true);
  };

  // Handler for confirming deletion
  const confirmDelete = async () => {
    setMessage("");
    setMessageType("");
    setShowDeleteConfirmModal(false); // Close the confirmation modal
    const token = getAuthToken();

    if (!token) {
      setMessage("Authentication token not found. Please log in.");
      setMessageType("error");
      showToast.error('Authentication token not found. Please log in.');
      return;
    }

    try {
      await axios.delete(`/api/cab/bookings/${bookingToDeleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Booking successfully deleted!");
      setMessageType("success");
      fetchBookings(); // Refresh the list after deletion
      if (onBookingActionSuccess) onBookingActionSuccess();
      showToast.success('🗑️ Booking successfully deleted!');
    } catch (e) {
      setMessage(`Network error during delete: ${e.message}`);
      setMessageType("error");
      console.error("Delete error:", e);
    } finally {
      setBookingToDeleteId(null); // Clear the ID after action
    }
  };

  // Handler for canceling deletion
  const cancelDelete = () => {
    setShowDeleteConfirmModal(false);
    setBookingToDeleteId(null);
  };

  const filteredBookings = (bookings || []).filter((booking) => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    if (!booking || typeof booking !== "object") {
      return false;
    }

    const matchesSearch =
      lowerSearchTerm === "" ||
      Object.values(booking).some((value) =>
        String(value).toLowerCase().includes(lowerSearchTerm)
      );

    const matchesStatus =
      filterStatus === "all" ||
      (booking.status &&
        booking.status.toLowerCase().trim() ===
          filterStatus.toLowerCase().trim());

    const matchesCabType =
      filterCabType === "all" ||
      (booking.cabType &&
        booking.cabType.toLowerCase().trim() ===
          filterCabType.toLowerCase().trim());

    const matchesPurpose =
      filterPurpose === "all" ||
      (booking.purpose &&
        booking.purpose.toLowerCase().trim() ===
          filterPurpose.toLowerCase().trim());

    return matchesSearch && matchesStatus && matchesCabType && matchesPurpose;
  });

  return (
    <div className="w-full max-w-7xl bg-white p-8 rounded-xl shadow-2xl border border-gray-200 mx-auto font-sans">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Cab Booking List
      </h2>

      {message && (
        <div
          className={`p-3 rounded-md text-center mb-4 ${
            messageType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search bookings..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow min-w-[200px] px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="on_route">On Route</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filterCabType}
          onChange={(e) => setFilterCabType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="all">All Cab Types</option>
          <option value="standard">Standard</option>
          <option value="premium">Premium</option>
          <option value="suv">SUV</option>
        </select>

        <select
          value={filterPurpose}
          onChange={(e) => setFilterPurpose(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="all">All Purposes</option>
          <option value="guest_transport">Guest Transport</option>
          <option value="hotel_supply">Hotel Supply</option>
          <option value="staff_pickup">Staff Pickup</option>
          <option value="sightseeing">Sightseeing</option>
          <option value="other">Other</option>
        </select>

        <button
          onClick={() => navigate("/cabbookingform")}
          className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[color:var(--color-primary)] focus:ring-2 focus:ring-offset-2 focus:bg-[color:var(--color-primary)]n-out"
        >
          Book New Cab
        </button>
      </div>

      {loading ? (
        <div className="text-center text-lg font-semibold text-gray-700">
          Loading bookings...
        </div>
      ) : error ? (
        <div className="text-center text-lg font-semibold text-red-600 p-4 bg-red-100 rounded-md shadow-md">
          {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center text-lg text-gray-600 p-4 bg-gray-50 rounded-md">
          No bookings found matching your criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Purpose
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pickup/Destination
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pickup Time
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cab Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Guest Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking._id.slice(-6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {booking.purpose
                      ? booking.purpose.replace(/_/g, " ")
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.pickupLocation} to {booking.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.pickupTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        booking.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }
                      ${
                        booking.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : ""
                      }
                      ${
                        booking.status === "on_route"
                          ? "bg-purple-100 text-purple-800"
                          : ""
                      }
                      ${
                        booking.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : ""
                      }
                      capitalize`}
                    >
                      {booking.status || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {booking.cabType || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.guestName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(booking)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4 transition duration-150 ease-in-out"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(booking._id)}
                      className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Booking Modal */}
      {isEditModalOpen && editingBooking && (
        <EditBookingModal
          booking={editingBooking}
          onClose={handleCloseEditModal}
          onSave={handleUpdateBooking}
          showMessage={editMessage}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this booking?"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
});

export default CabBookingListPage;
