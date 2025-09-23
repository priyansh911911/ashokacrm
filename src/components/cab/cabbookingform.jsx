
import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { showToast } from "../../utils/toaster";

// Main App component that renders either CabBookingForm or CabList
export default function App() {
  const [showBookingForm, setShowBookingForm] = useState(true); // State to control which component to show

  // Callback function to switch to the CabList view after successful submission
  const handleBookingSuccess = () => {
    setShowBookingForm(false);
  };

  // Callback function to switch back to the CabBookingForm
  const handleGoToBookingForm = () => {
    setShowBookingForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center font-sans">
      {showBookingForm ? (
        <CabBookingForm onSubmissionSuccess={handleBookingSuccess} />
      ) : (
        <CabList onGoBack={handleGoToBookingForm} />
      )}
    </div>
  );
}

// CabBookingForm component (remains largely the same, but now accepts a prop)
function CabBookingForm({ onSubmissionSuccess }) {
  const { axios } = useAppContext();
  // State to hold form data, initialized with default values
  const [formData, setFormData] = useState({
    _id: "", // Added for update functionality
    purpose: "guest_transport",
    guestName: "",
    roomNumber: "",
    grcNo: "",
    guestType: "inhouse",
    pickupLocation: "",
    destination: "",
    pickupTime: "", // Will be set by datetime-local input
    cabType: "standard",
    specialInstructions: "",
    scheduled: false,
    estimatedFare: "",
    actualFare: "",
    distanceInKm: "",
    paymentStatus: "unpaid",
    vehicleId: "", // Added for Mongoose ObjectId reference
    vehicleNumber: "", // Now selected from dropdown
    vehicleType: "", // New: Auto-filled based on vehicle selection
    vehicleModel: "", // New: Auto-filled based on vehicle selection
    insuranceValidTill: "", // New: Auto-filled based on vehicle selection
    driverId: "", // Added for Mongoose ObjectId reference
    driverName: "", // Now selected from dropdown
    driverContact: "", // Auto-filled based on driverName selection
    licenseNumber: "", // New: Auto-filled based on driver selection
    licenseExpiry: "", // New: Auto-filled based on driver selection
    driverStatus: "", // New: Auto-filled based on driver selection
    status: "pending",
    cancellationReason: "",
  });

  // State for managing form submission messages
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [fetchBookingId, setFetchBookingId] = useState(""); // State for the ID to fetch
  const [fetchGrcNo, setFetchGrcNo] = useState(""); // New state for GRC No. to fetch
  const [drivers, setDrivers] = useState([]); // State to store fetched driver data
  const [vehicles, setVehicles] = useState([]); // State to store fetched vehicle data

  // useEffect to fetch drivers and vehicles when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Drivers
      try {
        const { data: driverData } = await axios.get("/api/driver");
        setDrivers(Array.isArray(driverData) ? driverData : []);
      } catch (error) {
        console.error("Network error fetching drivers:", error);
        setMessage(`Network error fetching drivers: ${error.message}`);
        setMessageType("error");
      }

      // Fetch Vehicles
      try {
        const { data: vehicleData } = await axios.get("/api/vehicle/all");
        setVehicles(
          Array.isArray(vehicleData.vehicles) ? vehicleData.vehicles : []
        );
      } catch (error) {
        console.error("Network error fetching vehicles:", error);
        setMessage(`Network error fetching vehicles: ${error.message}`);
        setMessageType("error");
      }
    };
    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Handle input changes for all form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "driverName") {
      const selectedDriver = drivers.find(
        (driver) => driver.driverName === value
      );
      setFormData((prevData) => ({
        ...prevData,
        driverName: value,
        driverContact: selectedDriver ? selectedDriver.contactNumber : "",
        driverId: selectedDriver ? selectedDriver._id : "",
        licenseNumber: selectedDriver ? selectedDriver.licenseNumber : "",
        licenseExpiry: selectedDriver
          ? new Date(selectedDriver.licenseExpiry).toISOString().slice(0, 10)
          : "",
        driverStatus: selectedDriver ? selectedDriver.status : "",
      }));
    } else if (name === "vehicleNumber") {
      const selectedVehicle = vehicles.find(
        (vehicle) => vehicle.vehicleNumber === value
      );
      setFormData((prevData) => ({
        ...prevData,
        vehicleNumber: value,
        vehicleId: selectedVehicle ? selectedVehicle._id : "",
        vehicleType: selectedVehicle ? selectedVehicle.type : "",
        vehicleModel: selectedVehicle ? selectedVehicle.model : "",
        insuranceValidTill: selectedVehicle
          ? new Date(selectedVehicle.insuranceValidTill)
              .toISOString()
              .slice(0, 10)
          : "",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle fetching a booking by ID or GRC No.
  const handleFetchBooking = async () => {
    setMessage("");
    setMessageType("");
    let bookingData = null;

    if (!fetchBookingId && !fetchGrcNo) {
      setMessage("Please enter either a Booking ID or a GRC No. to fetch.");
      setMessageType("error");
      return;
    }

    try {
      let data;
      if (fetchBookingId) {
        const response = await axios.get(`/api/cab/bookings/${fetchBookingId}`);
        data = response.data;
      } else if (fetchGrcNo) {
        const response = await axios.get(
          `/api/cab/bookings?grcNo=${fetchGrcNo}`
        );
        data = response.data;
      }
      if (
        fetchGrcNo &&
        Array.isArray(data.bookings) &&
        data.bookings.length > 0
      ) {
        bookingData = data.bookings[0];
        setMessage("Booking fetched successfully by GRC No. (first match)!");
        setMessageType("success");
      } else if (fetchBookingId && data) {
        bookingData = data;
        setMessage("Booking fetched successfully by ID!");
        setMessageType("success");
      } else {
        setMessage("No booking found for the provided ID or GRC No.");
        setMessageType("error");
        return;
      }
    } catch (error) {
      setMessage(`Network error or invalid JSON response: ${error.message}`);
      setMessageType("error");
      console.error("Fetch error:", error);
      return;
    }

    if (bookingData) {
      const formattedPickupTime = bookingData.pickupTime
        ? new Date(bookingData.pickupTime).toISOString().slice(0, 16)
        : "";

      const driverIdToMatch =
        typeof bookingData.driverId === "object"
          ? bookingData.driverId._id
          : bookingData.driverId;
      const vehicleIdToMatch =
        typeof bookingData.vehicleId === "object"
          ? bookingData.vehicleId._id
          : bookingData.vehicleId;

      const fetchedDriver = drivers.find((d) => d._id === driverIdToMatch);
      const fetchedVehicle = vehicles.find((v) => v._id === vehicleIdToMatch);

      setFormData({
        ...bookingData,
        _id: bookingData._id,
        pickupTime: formattedPickupTime,
        estimatedFare: bookingData.estimatedFare
          ? String(bookingData.estimatedFare)
          : "",
        actualFare: bookingData.actualFare
          ? String(bookingData.actualFare)
          : "",
        distanceInKm: bookingData.distanceInKm
          ? String(bookingData.distanceInKm)
          : "",
        driverName: fetchedDriver
          ? fetchedDriver.driverName
          : bookingData.driverName || "",
        driverContact: fetchedDriver
          ? fetchedDriver.contactNumber
          : bookingData.driverContact || "",
        licenseNumber: fetchedDriver
          ? fetchedDriver.licenseNumber
          : bookingData.licenseNumber || "",
        licenseExpiry:
          fetchedDriver && fetchedDriver.licenseExpiry
            ? new Date(fetchedDriver.licenseExpiry).toISOString().slice(0, 10)
            : bookingData.licenseExpiry
            ? new Date(bookingData.licenseExpiry).toISOString().slice(0, 10)
            : "",
        driverStatus: fetchedDriver
          ? fetchedDriver.status
          : bookingData.driverStatus || "",
        vehicleNumber: fetchedVehicle
          ? fetchedVehicle.vehicleNumber
          : bookingData.vehicleNumber || "",
        vehicleType: fetchedVehicle
          ? fetchedVehicle.type
          : bookingData.vehicleType || "",
        vehicleModel: fetchedVehicle
          ? fetchedVehicle.model
          : bookingData.vehicleModel || "",
        insuranceValidTill:
          fetchedVehicle && fetchedVehicle.insuranceValidTill
            ? new Date(fetchedVehicle.insuranceValidTill)
                .toISOString()
                .slice(0, 10)
            : bookingData.insuranceValidTill
            ? new Date(bookingData.insuranceValidTill)
                .toISOString()
                .slice(0, 10)
            : "",
        vehicleId: fetchedVehicle
          ? fetchedVehicle._id
          : bookingData.vehicleId && typeof bookingData.vehicleId === "string"
          ? bookingData.vehicleId
          : "",
        driverId: fetchedDriver
          ? fetchedDriver._id
          : bookingData.driverId && typeof bookingData.driverId === "string"
          ? bookingData.driverId
          : "",
      });
      setFetchBookingId(bookingData._id || "");
      setFetchGrcNo(bookingData.grcNo || "");
    }
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    const isUpdate = !!formData._id;

    const dataToSend = {
      ...formData,
      estimatedFare: formData.estimatedFare
        ? parseFloat(formData.estimatedFare)
        : undefined,
      actualFare: formData.actualFare
        ? parseFloat(formData.actualFare)
        : undefined,
      distanceInKm: formData.distanceInKm
        ? parseFloat(formData.distanceInKm)
        : undefined,
      pickupTime: formData.pickupTime
        ? new Date(formData.pickupTime).toISOString()
        : undefined,
      licenseExpiry: formData.licenseExpiry
        ? new Date(formData.licenseExpiry).toISOString()
        : undefined,
      insuranceValidTill: formData.insuranceValidTill
        ? new Date(formData.insuranceValidTill).toISOString()
        : undefined,
      createdBy: "60d5ec49f8c7e20015f8e2e1",
    };

    Object.keys(dataToSend).forEach((key) => {
      if (
        dataToSend[key] === "" ||
        dataToSend[key] === undefined ||
        dataToSend[key] === null
      ) {
        delete dataToSend[key];
      }
    });

    try {
      let result;
      if (isUpdate) {
        result = await axios.put(
          `/api/cab/bookings/${formData._id}`,
          dataToSend
        );
      } else {
        result = await axios.post("/api/cab/bookings", dataToSend);
      }
      setMessage(
        `Cab booking successfully ${isUpdate ? "updated" : "created"}!`
      );
      setMessageType("success");
      console.log("Success:", result.data);
      showToast.success(`🎉 Cab booking successfully ${isUpdate ? "updated" : "created"}!`);
      // Call the callback to switch view on success
      if (onSubmissionSuccess) {
        onSubmissionSuccess();
      }
      handleClearForm(); // Clear form after successful submission
    } catch (error) {
      setMessage(`Network error or invalid JSON response: ${error.message}`);
      setMessageType("error");
      console.error("Network error:", error);
      showToast.error(`Network error or invalid JSON response: ${error.message}`);
    }
  };

  // Function to clear the form
  const handleClearForm = () => {
    setFormData({
      _id: "",
      purpose: "guest_transport",
      guestName: "",
      roomNumber: "",
      grcNo: "",
      guestType: "inhouse",
      pickupLocation: "",
      destination: "",
      pickupTime: "",
      cabType: "standard",
      specialInstructions: "",
      scheduled: false,
      estimatedFare: "",
      actualFare: "",
      distanceInKm: "",
      paymentStatus: "unpaid",
      vehicleId: "",
      vehicleNumber: "",
      vehicleType: "",
      vehicleModel: "",
      insuranceValidTill: "",
      driverId: "",
      driverName: "",
      driverContact: "",
      licenseNumber: "",
      licenseExpiry: "",
      driverStatus: "",
      status: "pending",
      cancellationReason: "",
    });
    setFetchBookingId("");
    setFetchGrcNo("");
    setMessage("");
    setMessageType("");
  };

  // Determine if guest-related fields should be shown
  const showGuestInfo =
    formData.purpose === "guest_transport" ||
    formData.purpose === "sightseeing";
  // Determine if cancellation reason should be shown
  const showCancellationReason = formData.status === "cancelled";

  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-200">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
        Cab Booking Request
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message Display */}
        {message && (
          <div
            className={`p-3 rounded-md text-center ${
              messageType === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        {/* Fetch Booking by ID or GRC No. Section */}
        {/* <div className="p-6 bg-blue-50 rounded-lg border border-blue-200 flex flex-col sm:flex-row items-center gap-4">
          <label htmlFor="fetchBookingId" className="block text-sm font-medium text-gray-700 whitespace-nowrap">Fetch by Booking ID:</label>
          <input
            type="text"
            id="fetchBookingId"
            name="fetchBookingId"
            value={fetchBookingId}
            onChange={(e) => setFetchBookingId(e.target.value)}
            placeholder="Enter booking ID"
            className="flex-grow mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          />
          <label htmlFor="fetchGrcNo" className="block text-sm font-medium text-gray-700 whitespace-nowrap">OR GRC No.:</label>
          <input
            type="text"
            id="fetchGrcNo"
            name="fetchGrcNo"
            value={fetchGrcNo}
            onChange={(e) => setFetchGrcNo(e.target.value)}
            placeholder="Enter GRC No."
            className="flex-grow mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          />
          <button
            type="button"
            onClick={handleFetchBooking}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Fetch Booking
          </button>
        </div> */}

        {/* Purpose Section */}
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
          >
            <option value="guest_transport">Guest Transport</option>
            <option value="hotel_supply">Hotel Supply</option>
            <option value="staff_pickup">Staff Pickup</option>
            <option value="sightseeing">Sightseeing</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Guest or Room Info (Conditional Rendering) */}
        {showGuestInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="col-span-full text-lg font-semibold text-blue-800 mb-2">
              Guest Information
            </h3>
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
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              />
            </div>
            <div>
              <label
                htmlFor="roomNumber"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Room Number
              </label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              />
            </div>
            <div>
              <label
                htmlFor="grcNo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                GRC No. (Optional)
              </label>
              <input
                type="text"
                id="grcNo"
                name="grcNo"
                value={formData.grcNo}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              />
            </div>
            <div className="col-span-full">
              <label
                htmlFor="guestType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Guest Type
              </label>
              <select
                id="guestType"
                name="guestType"
                value={formData.guestType}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              >
                <option value="inhouse">Inhouse</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
        )}

        {/* Ride Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-2">
            Ride Details
          </h3>
          <div>
            <label
              htmlFor="pickupLocation"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pickup Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="pickupLocation"
              name="pickupLocation"
              value={formData.pickupLocation}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Destination <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div className="md:col-span-2">
            <label
              htmlFor="pickupTime"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pickup Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="pickupTime"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            >
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="suv">SUV</option>
            </select>
          </div>
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            ></textarea>
          </div>
          <div className="flex items-center md:col-span-2">
            <input
              id="scheduled"
              name="scheduled"
              type="checkbox"
              checked={formData.scheduled}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="scheduled"
              className="ml-2 block text-sm font-medium text-gray-700"
            >
              Scheduled Ride
            </label>
          </div>
        </div>

        {/* Fare and Distance Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-2">
            {" "}
            Distance
          </h3>
          {/* <div>
            <label htmlFor="estimatedFare" className="block text-sm font-medium text-gray-700 mb-1">Estimated Fare</label>
            <input
              type="number"
              id="estimatedFare"
              name="estimatedFare"
              value={formData.estimatedFare}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label htmlFor="actualFare" className="block text-sm font-medium text-gray-700 mb-1">Actual Fare</label>
            <input
              type="number"
              id="actualFare"
              name="actualFare"
              value={formData.actualFare}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div> */}
          <div>
            <label
              htmlFor="distanceInKm"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Distance
            </label>
            <input
              type="string"
              id="distanceInKm"
              name="distanceInKm"
              value={formData.distanceInKm}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div className="col-span-full">
            <label
              htmlFor="paymentStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Status
            </label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
            </select>
          </div>
        </div>

        {/* Cab Vehicle & Driver Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-2">
            Cab & Driver Info
          </h3>
          <div>
            <label
              htmlFor="vehicleNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vehicle Number
            </label>
            <select
              id="vehicleNumber"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            >
              <option value="">Select a Vehicle</option>
              {Array.isArray(vehicles) &&
                vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle.vehicleNumber}>
                    {vehicle.vehicleNumber}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="vehicleType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vehicle Type
            </label>
            <input
              type="text"
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label
              htmlFor="vehicleModel"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vehicle Model
            </label>
            <input
              type="text"
              id="vehicleModel"
              name="vehicleModel"
              value={formData.vehicleModel}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div className="md:col-span-full">
            <label
              htmlFor="insuranceValidTill"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Insurance Valid Till
            </label>
            <input
              type="date"
              id="insuranceValidTill"
              name="insuranceValidTill"
              value={formData.insuranceValidTill}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm transition duration-150 ease-in-out"
            />
          </div>

          <div>
            <label
              htmlFor="driverName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Driver Name
            </label>
            <select
              id="driverName"
              name="driverName"
              value={formData.driverName}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            >
              <option value="">Select a Driver</option>
              {Array.isArray(drivers) &&
                drivers.map((driver) => (
                  <option key={driver._id} value={driver.driverName}>
                    {driver.driverName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="driverContact"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Driver Contact
            </label>
            <input
              type="text"
              id="driverContact"
              name="driverContact"
              value={formData.driverContact}
              readOnly // Make it read-only as it's auto-filled
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label
              htmlFor="licenseNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              License Number
            </label>
            <input
              type="text"
              id="licenseNumber"
              name="licenseNumber"
              value={formData.licenseNumber}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label
              htmlFor="licenseExpiry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              License Expiry
            </label>
            <input
              type="date"
              id="licenseExpiry"
              name="licenseExpiry"
              value={formData.licenseExpiry}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
          <div>
            <label
              htmlFor="driverStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Driver Status
            </label>
            <input
              type="text"
              id="driverStatus"
              name="driverStatus"
              value={formData.driverStatus}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
        </div>

        {/* Status Tracking Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="col-span-full text-lg font-semibold text-gray-800 mb-2">
            Status Tracking
          </h3>
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
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="on_route">On Route</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {showCancellationReason && (
            <div>
              <label
                htmlFor="cancellationReason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cancellation Reason
              </label>
              <textarea
                id="cancellationReason"
                name="cancellationReason"
                value={formData.cancellationReason}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              ></textarea>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-8 space-x-4">
          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-105"
          >
            {formData._id ? "Update Cab Request" : "Submit Cab Request"}
          </button>
          <button
            type="button"
            onClick={handleClearForm}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  );
}

// Minimal CabList component to satisfy the App's rendering requirement
function CabList({ onGoBack }) {
  return (
    <div className="w-full bg-white p-8 rounded-xl shadow-2xl border border-gray-200 text-center">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
        Cab Booking List
      </h2>
      <p className="text-gray-700 mb-6">
        This is where the list of cab bookings would be displayed.
      </p>
      <button
        onClick={onGoBack}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out transform hover:scale-105"
      >
        Go Back to Booking Form
      </button>
    </div>
  );
}
