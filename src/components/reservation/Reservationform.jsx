import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { showToast } from "../../utils/toaster";
import { validateEmail, validatePhone, validateRequired, validatePositiveNumber, validateDateRange, validateGST } from "../../utils/validation";
import {
  FaUser,
  FaPhone,
  FaCity,
  FaMapMarkedAlt,
  FaBuilding,
  FaGlobe,
  FaRegAddressCard,
  FaMobileAlt,
  FaEnvelope,
  FaMoneyCheckAlt,
  FaCalendarAlt,
  FaClock,
  FaDoorOpen,
  FaUsers,
  FaConciergeBell,
  FaInfoCircle,
  FaSuitcase,
  FaComments,
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaSignInAlt,
  FaPassport,
  FaIdCard,
  FaCreditCard,
  FaCashRegister,
  FaAddressBook,
  FaRegListAlt,
  FaRegUser,
  FaRegCalendarPlus,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaRegUserCircle,
  FaRegCreditCard,
  FaRegStar,
  FaRegFlag,
  FaRegEdit,
  FaRegClone,
  FaRegCommentDots,
  FaRegFileAlt,
  FaRegCalendarCheck,
  FaRegCalendarTimes,
  FaRegMap,
  FaHotel,
  FaTimes,
} from "react-icons/fa";

// InputWithIcon for UI consistency
const InputWithIcon = ({
  icon,
  type,
  name,
  placeholder,
  value,
  onChange,
  className,
  required,
  min,
  max,
  step,
  readOnly,
  inputClassName,
}) => (
  <div className="relative flex items-center">
    {icon && (
      <div className="absolute left-3 text-gray-400 pointer-events-none">
        {icon}
      </div>
    )}
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`pl-10 pr-4 py-2 w-full ${
        inputClassName ||
        "bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      } ${className}`}
      required={required}
      min={min}
      max={max}
      step={step}
      readOnly={readOnly}
    />
  </div>
);

// Generate a new local GRC number for reservations
const fetchNewGRCNo = (setFormData) => {
  const random = Math.floor(Math.random() * 9000) + 1000;
  const grcNo = `GRC-${random}`;
  setFormData((prev) => ({ ...prev, grcNo }));
};

// Shadcn-like components (for a self-contained example)
const Button = ({
  children,
  onClick,
  className = "",
  disabled,
  type = "button",
  variant = "default",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2";
  const variants = {
    default: "bg-[hsl(45,43%,58%)] text-white border border-[hsl(45,43%,58%)] shadow hover:bg-[hsl(45,32%,46%)]",
    outline:
      "border border-[hsl(45,100%,85%)] bg-transparent hover:bg-[hsl(45,100%,95%)] hover:text-[hsl(45,100%,20%)]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Input = ({
  type,
  placeholder,
  value,
  onChange,
  className = "",
  ...props
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 min-w-0 ${className}`}
    {...props}
  />
);

const Label = ({ children, htmlFor, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 ${className}`}
  >
    {children}
  </label>
);

const Select = ({
  value,
  onChange,
  children,
  className = "",
  name,
  ...props
}) => (
  <select
    value={value}
    onChange={onChange}
    name={name}
    className={`flex h-9 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 truncate ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Checkbox = ({ id, checked, onChange, className = "", name }) => (
  <input
    type="checkbox"
    id={id}
    name={name}
    checked={checked}
    onChange={onChange}
    className={`peer h-4 w-4 shrink-0 rounded-sm border border-[hsl(45,43%,58%)] shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(45,43%,58%)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

// Lucide-react-like icons
const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-[hsl(45,100%,20%)]"
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const UserIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-[hsl(45,100%,20%)]"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const BedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-[hsl(45,100%,20%)]"
  >
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4" />
    <path d="M12 4h4a2 2 0 0 1 2 2v4" />
    <path d="M22 10v4" />
  </svg>
);
const DollarSignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-[hsl(45,100%,20%)]"
  >
    <line x1="12" x2="12" y1="2" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const CarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-[hsl(45,100%,20%)]"
  >
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L14 6H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-[hsl(45,100%,20%)]"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

// Custom Date Picker Component to avoid browser inconsistencies
const DatePicker = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(
    value ? new Date(value) : new Date()
  );

  const formattedValue = value
    ? new Date(value).toLocaleDateString("en-CA")
    : "";

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handleDayClick = (day) => {
    const selectedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    onChange(selectedDate.toLocaleDateString("en-CA"));
    setIsOpen(false);
  };

  const handleMonthChange = (offset) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
      const isSelected =
        value &&
        new Date(value).getDate() === i &&
        new Date(value).getMonth() === month &&
        new Date(value).getFullYear() === year;
      const dayClasses = `h-10 w-10 flex items-center justify-center rounded-full cursor-pointer transition-colors ${
        isSelected ? "bg-black text-white" : "hover:bg-gray-100"
      }`;
      days.push(
        <div key={i} className={dayClasses} onClick={() => handleDayClick(i)}>
          {i}
        </div>
      );
    }
    return days;
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-start text-left font-normal border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 truncate min-w-0"
      >
        <CalendarIcon className="mr-2 flex-shrink-0" />
        <span className="truncate">{formattedValue || `Select ${label}`}</span>
      </Button>

      {isOpen && (
        <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-full sm:w-80">
          <div className="flex justify-between items-center mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMonthChange(-1)}
            >
              <ChevronLeftIcon />
            </Button>
            <span className="font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleMonthChange(1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
            {dayNames.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 text-center">{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const navigate = useNavigate();
  const { axios } = useAppContext();
  const [formData, setFormData] = useState({
    grcNo: "",

    // Fetch GRC number from backend (outside App to avoid syntax issues)

    bookingRefNo: "",
    reservationType: "Online",
    modeOfReservation: "",
    category: "",
    status: "Confirmed",
    salutation: "Mr.",
    guestName: "",
    nationality: "",
    city: "",
    address: "",
    phoneNo: "",
    mobileNo: "",
    email: "",
    companyName: "",
    gstApplicable: true,
    companyGSTIN: "",
    roomHoldStatus: "Pending",
    roomAssigned: [], // Changed to array to hold multiple room numbers
    roomHoldUntil: "",
    checkInDate: "",
    checkOutDate: "",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    noOfRooms: 1,
    noOfAdults: 1,
    noOfChildren: 0,
    planPackage: "EP",
    rate: 0,
    arrivalFrom: "",
    purposeOfVisit: "Leisure",
    roomPreferences: {
      smoking: false,
      bedType: "King",
    },
    specialRequests: "",
    remarks: "",
    billingInstruction: "",
    paymentMode: "",
    refBy: "",
    advancePaid: 0,
    isAdvancePaid: false,
    transactionId: "",
    discountPercent: 0,
    vehicleDetails: {
      vehicleNumber: "",
      vehicleType: "",
      vehicleModel: "",
      driverName: "",
      driverMobile: "",
    },
    vip: false,
    isForeignGuest: false,
    cancellationReason: "",
    cancelledBy: "",
    isNoShow: false,
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);
  const [allRooms, setAllRooms] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]);
  const [availableRoomsByCat, setAvailableRoomsByCat] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [selectedRooms, setSelectedRooms] = useState([]); // New state for selected rooms
  const [searchGRC, setSearchGRC] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Special handling for paymentMode to clear unrelated fields
    if (name === "paymentMode") {
      setFormData((prev) => {
        const cleared = { ...prev };
        // Clear all payment details fields
        delete cleared.cardNumber;
        delete cleared.cardHolder;
        delete cleared.cardExpiry;
        delete cleared.cardCVV;
        delete cleared.upiId;
        delete cleared.bankName;
        delete cleared.accountNumber;
        delete cleared.ifsc;
        return {
          ...cleared,
          paymentMode: value,
        };
      });
      return;
    }
    
    // Auto-fill vehicle details when vehicle type is selected
    if (name === "vehicleDetails.vehicleType") {
      const selectedVehicle = allVehicles.find(v => v.type === value);
      setFormData((prev) => ({
        ...prev,
        vehicleDetails: {
          ...prev.vehicleDetails,
          vehicleType: value,
          vehicleNumber: selectedVehicle?.vehicleNumber || "",
          vehicleModel: selectedVehicle?.model || "",
        },
      }));
      return;
    }
    
    // Auto-fill driver mobile when driver name is selected
    if (name === "vehicleDetails.driverName") {
      const selectedDriver = allDrivers.find(d => d.driverName === value);
      setFormData((prev) => ({
        ...prev,
        vehicleDetails: {
          ...prev.vehicleDetails,
          driverName: value,
          driverMobile: selectedDriver?.contactNumber || "",
        },
      }));
      return;
    }
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleDateChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSelection = (room) => {
    setSelectedRooms((prev) => {
      const isSelected = prev.some((r) => r._id === room._id);
      if (isSelected) {
        return prev.filter((r) => r._id !== room._id);
      } else {
        return [...prev, room];
      }
    });
  };

  useEffect(() => {
    // Update formData.roomAssigned whenever selectedRooms changes
    setFormData((prev) => ({
      ...prev,
      roomAssigned: selectedRooms.map((r) => r._id),
    }));
    setFormData((prev) => ({
      ...prev,
      noOfRooms: selectedRooms.length,
    }));
  }, [selectedRooms]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [roomsRes, vehiclesRes, driversRes] = await Promise.all([
        axios.get('/api/rooms/all', config),
        axios.get('/api/vehicle/all', config),
        axios.get('/api/driver', config),
      ]);

      const roomsData = roomsRes.data;
      const vehiclesData = vehiclesRes.data;
      const driversData = driversRes.data;

      setAllRooms(Array.isArray(roomsData) ? roomsData : []);
      setAllVehicles(
        Array.isArray(vehiclesData.vehicles) ? vehiclesData.vehicles : []
      );

      let drivers = [];
      if (Array.isArray(driversData)) {
        drivers = driversData;
      } else if (driversData && Array.isArray(driversData.drivers)) {
        drivers = driversData.drivers;
      }
      setAllDrivers(drivers);

      // Don't set default values to allow user selection
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Could not fetch initial data. Please check the network and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    const { checkInDate, checkOutDate } = formData;
    if (
      !checkInDate ||
      !checkOutDate ||
      new Date(checkInDate) >= new Date(checkOutDate)
    ) {
      setError("Please select valid check-in and check-out dates.");
      setAvailableCategories([]);
      setAvailableRoomsByCat({});
      setFormData((prev) => ({ ...prev, category: "" }));
      setHasCheckedAvailability(true);
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedRooms([]); // Reset selected rooms on new availability check
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/rooms/available?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data;

      const availableRoomsList = data.availableRooms || [];
      if (Array.isArray(availableRoomsList)) {
        setAvailableCategories(availableRoomsList);

        const roomsByCategory = availableRoomsList.reduce((acc, current) => {
          if (current.rooms) {
            acc[current.category] = current.rooms;
          }
          return acc;
        }, {});
        setAvailableRoomsByCat(roomsByCategory);

        // Auto-select the first category if available
        if (availableRoomsList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            category: availableRoomsList[0].category,
          }));
        } else {
          setFormData((prev) => ({ ...prev, category: "" }));
        }
      } else {
        const errorMessage =
          "Received unexpected data from the server. The API for room availability did not return a list of rooms. Please try a different date range or check the API backend.";
        console.error(
          "API response for rooms/available was not an array:",
          data
        );
        setError(errorMessage);
        setAvailableCategories([]);
        setAvailableRoomsByCat({});
        setFormData((prev) => ({ ...prev, category: "" }));
      }
    } catch (err) {
      console.error(err);
      setError(
        "Could not fetch room availability. Please check your network connection and try again."
      );
    } finally {
      setLoading(false);
      setHasCheckedAvailability(true);
    }
  };

  const handleFetchReservation = async () => {
    if (!searchGRC.trim()) {
      showMessage('error', 'Please enter a GRC number to search.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/bookings/grc/${searchGRC.trim()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.status === 200) {
        const fetchedData = response.data.booking;
        
        // Format dates
        const formatDate = (dateString) => {
          if (!dateString) return '';
          try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
          } catch {
            return '';
          }
        };
        
        // Map booking data to reservation form fields
        setFormData({
          ...formData,
          grcNo: fetchedData.grcNo || '',
          guestName: fetchedData.name || '',
          nationality: fetchedData.nationality || '',
          city: fetchedData.city || '',
          address: fetchedData.address || '',
          phoneNo: fetchedData.phoneNo || '',
          mobileNo: fetchedData.mobileNo || '',
          email: fetchedData.email || '',
          companyName: fetchedData.companyName || '',
          companyGSTIN: fetchedData.companyGSTIN || '',
          checkInDate: formatDate(fetchedData.checkInDate),
          checkOutDate: formatDate(fetchedData.checkOutDate),
          noOfAdults: fetchedData.noOfAdults || 1,
          noOfChildren: fetchedData.noOfChildren || 0,
          rate: fetchedData.rate || 0,
          discountPercent: fetchedData.discountPercent || 0,
          paymentMode: fetchedData.paymentMode || '',
          vip: fetchedData.vip || false,
        });
        
        showMessage('success', 'Booking found and form populated successfully!');
      } else {
        showMessage('error', 'No booking found with that GRC number.');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      if (error.response?.status === 404) {
        showMessage('error', 'No booking found with that GRC number.');
      } else {
        showMessage('error', `Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchNewGRCNo(setFormData);
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const resetForm = () => {
    setFormData({
      grcNo: "",
      bookingRefNo: "",
      reservationType: "Online",
      modeOfReservation: "",
      category: "",
      status: "Confirmed",
      salutation: "Mr.",
      guestName: "",
      nationality: "",
      city: "",
      address: "",
      phoneNo: "",
      mobileNo: "",
      email: "",
      companyName: "",
      gstApplicable: true,
      companyGSTIN: "",
      roomHoldStatus: "Pending",
      roomAssigned: [],
      roomHoldUntil: "",
      checkInDate: "",
      checkOutDate: "",
      checkInTime: "14:00",
      checkOutTime: "12:00",
      noOfRooms: 1,
      noOfAdults: 1,
      noOfChildren: 0,
      planPackage: "EP",
      rate: 0,
      arrivalFrom: "",
      purposeOfVisit: "Leisure",
      roomPreferences: {
        smoking: false,
        bedType: "King",
      },
      specialRequests: "",
      remarks: "",
      billingInstruction: "",
      paymentMode: "",
      refBy: "",
      advancePaid: 0,
      isAdvancePaid: false,
      transactionId: "",
      discountPercent: 0,
      vehicleDetails: {
        vehicleNumber: "",
        vehicleType: "",
        vehicleModel: "",
        driverName: "",
        driverMobile: "",
      },
      vip: false,
      isForeignGuest: false,
      cancellationReason: "",
      cancelledBy: "",
      isNoShow: false,
    });
    setSearchGRC('');
    setSelectedRooms([]);
    setAvailableCategories([]);
    setAvailableRoomsByCat({});
    setHasCheckedAvailability(false);
    fetchNewGRCNo(setFormData);
  };

  const validateReservationForm = () => {
    // Required fields
    if (!validateRequired(formData.guestName)) {
      showMessage('error', 'Guest name is required');
      return false;
    }
    
    if (!formData.checkInDate || !formData.checkOutDate) {
      showMessage('error', 'Check-in and check-out dates are required');
      return false;
    }
    
    if (!validateDateRange(formData.checkInDate, formData.checkOutDate)) {
      showMessage('error', 'Check-out date must be after check-in date');
      return false;
    }
    
    if (selectedRooms.length === 0) {
      showMessage('error', 'Please select at least one room');
      return false;
    }
    
    // Email validation
    if (formData.email && !validateEmail(formData.email)) {
      showMessage('error', 'Please enter a valid email address');
      return false;
    }
    
    // Phone validation
    if (formData.mobileNo && !validatePhone(formData.mobileNo)) {
      showMessage('error', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    
    // Rate validation
    if (formData.rate && !validatePositiveNumber(formData.rate)) {
      showMessage('error', 'Rate must be a positive number');
      return false;
    }
    
    // GST validation
    if (formData.companyGSTIN && !validateGST(formData.companyGSTIN)) {
      showMessage('error', 'Please enter a valid GST number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateReservationForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showMessage('error', 'No authentication token found. Please log in again.');
        return;
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      await axios.post('/api/reservations', formData, config);
      
      showToast.success("🎉 Reservation submitted successfully! Redirecting to reservations page...");
      setTimeout(() => {
        navigate('/reservation');
      }, 1000);
    } catch (error) {
      console.error('Error submitting reservation:', error);
      showMessage('error', `Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryCardClick = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    setSelectedRooms([]); // Clear selected rooms when category changes
  };

  const roomsForSelectedCategory = availableRoomsByCat[formData.category] || [];

  const isCheckAvailabilityDisabled =
    !formData.checkInDate ||
    !formData.checkOutDate ||
    new Date(formData.checkInDate) >= new Date(formData.checkOutDate);

  return (
    <div className="min-h-screen" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
            Reservation Form
          </h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 space-y-8">
      {message.text && (
        <div
          className={`px-4 py-3 rounded relative mb-4 mx-auto max-w-3xl ${
            message.type === "success"
              ? "bg-green-100 border border-green-400 text-green-700"
              : "bg-red-100 border border-red-400 text-red-700"
          }`}
          role="alert"
        >
          <span className="block sm:inline">{message.text}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setMessage({ type: "", text: "" })}
          >
            <svg
              className="fill-current h-6 w-6"
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Information Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full" style={{backgroundColor: 'hsl(45, 100%, 85%)'}}>
              <FaInfoCircle className="text-lg" style={{color: 'hsl(45, 43%, 58%)'}} />
            </div>
            <h2 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
              General Information
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="grcNo">GRC No.</Label>
              <InputWithIcon
                icon={<FaRegAddressCard />}
                type="text"
                name="grcNo"
                placeholder="GRC No."
                value={formData.grcNo || ""}
                onChange={handleChange}
                readOnly={true}
                inputClassName="bg-gray-100 border border-gray-300 rounded-lg cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="searchGRC">Search by GRC</Label>
              <InputWithIcon
                icon={<FaRegAddressCard />}
                type="text"
                name="searchGRC"
                placeholder="Enter GRC number to load reservation"
                value={searchGRC}
                onChange={(e) => setSearchGRC(e.target.value)}
                inputClassName="bg-white border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleFetchReservation}
                disabled={loading || !searchGRC.trim()}
              >
                {loading ? "Searching..." : "Search Reservation"}
              </Button>
              <Button
                onClick={() => {
                  setSearchGRC('');
                  fetchNewGRCNo(setFormData);
                }}
                disabled={loading}
                variant="outline"
                className="px-3"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingRefNo">Booking Reference No</Label>
              <InputWithIcon
                icon={<FaRegListAlt />}
                type="text"
                name="bookingRefNo"
                placeholder="Booking Reference No"
                value={formData.bookingRefNo}
                onChange={handleChange}
                inputClassName="bg-white border border-secondary rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservationType">Reservation Type</Label>
              <div className="relative flex items-center">
                <FaInfoCircle className="absolute left-3 text-gray-400 pointer-events-none" />
                <select
                  className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  id="reservationType"
                  name="reservationType"
                  value={formData.reservationType}
                  onChange={handleChange}
                >
                  <option key="online-option" value="Online">
                    Online
                  </option>
                  <option key="walk-in-option" value="Walk-in">
                    Walk-in
                  </option>
                  <option key="agent-option" value="Agent">
                    Agent
                  </option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modeOfReservation">Mode of Reservation</Label>
              <InputWithIcon
                icon={<FaRegUser />}
                type="text"
                name="modeOfReservation"
                placeholder="Mode of Reservation"
                value={formData.modeOfReservation}
                onChange={handleChange}
                inputClassName="bg-white border border-secondary rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <div className="relative flex items-center">
                <FaCheckCircle className="absolute left-3 text-gray-400 pointer-events-none" />
                <select
                  className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option key="confirmed-option" value="Confirmed">
                    Confirmed
                  </option>
                  <option key="tentative-option" value="Tentative">
                    Tentative
                  </option>
                  <option key="waiting-option" value="Waiting">
                    Waiting
                  </option>
                  <option key="cancelled-option" value="Cancelled">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomHoldStatus">Room Hold Status</Label>
              <div className="relative flex items-center">
                <FaRegCheckCircle className="absolute left-3 text-gray-400 pointer-events-none" />
                <select
                  className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  id="roomHoldStatus"
                  name="roomHoldStatus"
                  value={formData.roomHoldStatus}
                  onChange={handleChange}
                >
                  <option key="pending-option" value="Pending">
                    Pending
                  </option>
                  <option key="held-option" value="Held">
                    Held
                  </option>
                  <option key="released-option" value="Released">
                    Released
                  </option>
                </select>
              </div>
            </div>
            {formData.status === "Cancelled" && (
              <div className="space-y-2 col-span-full">
                <Label htmlFor="cancellationReason">Cancellation Reason</Label>
                <Input
                  id="cancellationReason"
                  name="cancellationReason"
                  value={formData.cancellationReason}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="space-y-2 col-span-1 sm:col-span-2">
              <div className="relative flex items-start col-span-full">
                <FaComments className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                <textarea
                  id="remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Remarks"
                  className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full h-20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Room & Availability Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full" style={{backgroundColor: 'hsl(45, 100%, 85%)'}}>
              <BedIcon className="text-lg" style={{color: 'hsl(45, 43%, 58%)'}} />
            </div>
            <h2 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
              Room & Availability
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="checkInDate">Check-in Date</Label>
              <DatePicker
                value={formData.checkInDate}
                onChange={(value) => handleDateChange("checkInDate", value)}
                label="check-in date"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkOutDate">Check-out Date</Label>
              <DatePicker
                value={formData.checkOutDate}
                onChange={(value) => handleDateChange("checkOutDate", value)}
                label="check-out date"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchAvailableRooms}
                disabled={isCheckAvailabilityDisabled}
              >
                Check Availability
              </Button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-blue-500 mt-4">
              Checking for available rooms...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 mt-4">{error}</p>
          ) : hasCheckedAvailability ? (
            availableCategories.length > 0 ? (
              <div className="space-y-6 mt-4">
                <p className="text-lg font-medium">Select a Room Category:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableCategories.map((cat) => (
                    <div
                      key={cat.category}
                      onClick={() => +handleCategoryCardClick(cat.category)}
                      className={`
                            p-6 rounded-lg shadow-sm border cursor-pointer transition-all
                            ${
                              formData.category === cat.category
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-400"
                            }
                          `}
                    >
                      <h3 className="text-xl font-semibold">
                        {cat.categoryName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {cat.availableRooms} rooms available
                      </p>
                    </div>
                  ))}
                </div>

                {formData.category && roomsForSelectedCategory.length > 0 && (
                  <div className="mt-6 rounded-lg border border-gray-200 overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th scope="col" className="p-4">
                            <span className="sr-only">Select</span>
                          </th>
                          <th scope="col" className="px-4 py-3 whitespace-nowrap">
                            Room Number
                          </th>
                          <th scope="col" className="px-4 py-3 whitespace-nowrap">
                            Room Name
                          </th>
                          <th scope="col" className="px-4 py-3 whitespace-nowrap">
                            Capacity
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomsForSelectedCategory.map((room) => (
                          <tr
                            key={room._id}
                            className={`border-b ${
                              selectedRooms.some((r) => r._id === room._id)
                                ? "bg-blue-100"
                                : "bg-white hover:bg-gray-50"
                            }`}
                          >
                            <td className="w-4 p-4">
                              <Button
                                type="button"
                                variant="default"
                                className={
                                  selectedRooms.some((r) => r._id === room._id)
                                    ? "bg-green-500 text-black border-green-500 hover:bg-green-600"
                                    : "bg-red-500 text-black border-red-500 hover:bg-red-600"
                                }
                                onClick={() => handleRoomSelection(room)}
                              >
                                {selectedRooms.some((r) => r._id === room._id)
                                  ? "Unselect"
                                  : "Select"}
                              </Button>
                            </td>
                            <td className="px-4 py-4 font-medium text-black whitespace-nowrap">
                              {room.room_number}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {room.title}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {room.capacity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {formData.category && roomsForSelectedCategory.length === 0 && (
                  <p className="text-center text-red-500">
                    No rooms found for the selected category and dates.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-red-500 mt-4">
                No rooms available for the selected dates.
              </p>
            )
          ) : (
            <p className="text-center text-gray-500 mt-4">
              Please select your check-in and check-out dates and click 'Check
              Availability'.
            </p>
          )}
        </section>

        {/* Guest Details Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full" style={{backgroundColor: 'hsl(45, 100%, 85%)'}}>
              <FaUser className="text-lg" style={{color: 'hsl(45, 43%, 58%)'}} />
            </div>
            <h2 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
              Guest Details
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salutation">Salutation</Label>
              <Select
                id="salutation"
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
              >
                <option key="mr-option" value="Mr.">
                  Mr.
                </option>
                <option key="ms-option" value="Ms.">
                  Ms.
                </option>
                <option key="dr-option" value="Dr.">
                  Dr.
                </option>
                <option key="prof-option" value="Prof.">
                  Prof.
                </option>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="guestName">
                Guest Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="guestName"
                name="guestName"
                value={formData.guestName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNo">Phone No</Label>
              <Input
                id="phoneNo"
                name="phoneNo"
                type="tel"
                value={formData.phoneNo}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobileNo">Mobile No</Label>
              <Input
                id="mobileNo"
                name="mobileNo"
                type="tel"
                value={formData.mobileNo}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-3">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 col-span-1 sm:col-span-2 lg:col-span-3 flex items-center gap-2">
              <Checkbox
                id="gstApplicable"
                name="gstApplicable"
                checked={formData.gstApplicable}
                onChange={handleChange}
              />
              <Label htmlFor="gstApplicable">GST Applicable</Label>
            </div>
            {formData.gstApplicable && (
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="companyGSTIN">Company GSTIN</Label>
                <Input
                  id="companyGSTIN"
                  name="companyGSTIN"
                  value={formData.companyGSTIN}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="space-y-2 flex items-center gap-2">
              <Checkbox
                id="vip"
                name="vip"
                checked={formData.vip}
                onChange={handleChange}
              />
              <Label htmlFor="vip">VIP Guest</Label>
            </div>
            <div className="space-y-2 flex items-center gap-2">
              <Checkbox
                id="isForeignGuest"
                name="isForeignGuest"
                checked={formData.isForeignGuest}
                onChange={handleChange}
              />
              <Label htmlFor="isForeignGuest">Foreign Guest</Label>
            </div>
          </div>
        </section>

        {/* Stay Info Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full" style={{backgroundColor: 'hsl(45, 100%, 85%)'}}>
              <BedIcon className="text-lg" style={{color: 'hsl(45, 43%, 58%)'}} />
            </div>
            <h2 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
              Stay Information
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="noOfRooms">Number of Rooms</Label>
              <Input
                id="noOfRooms"
                name="noOfRooms"
                type="number"
                min="1"
                value={formData.noOfRooms}
                onChange={handleChange}
                readOnly
                className="bg-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noOfAdults">Adults</Label>
              <Input
                id="noOfAdults"
                name="noOfAdults"
                type="number"
                min="1"
                value={formData.noOfAdults}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noOfChildren">Children</Label>
              <Input
                id="noOfChildren"
                name="noOfChildren"
                type="number"
                min="0"
                value={formData.noOfChildren}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planPackage">Package Plan</Label>
              <Select
                id="planPackage"
                name="planPackage"
                value={formData.planPackage}
                onChange={handleChange}
              >
                <option key="ep-option" value="EP">
                  EP (European Plan)
                </option>
                <option key="cp-option" value="CP">
                  CP (Continental Plan)
                </option>
                <option key="map-option" value="MAP">
                  MAP (Modified American Plan)
                </option>
                <option key="ap-option" value="AP">
                  AP (American Plan)
                </option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkInTime">Check-in Time</Label>
              <Input
                id="checkInTime"
                name="checkInTime"
                type="time"
                value={formData.checkInTime}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOutTime">Check-out Time</Label>
              <Input
                id="checkOutTime"
                name="checkOutTime"
                type="time"
                value={formData.checkOutTime}
                onChange={handleChange}
                disabled
              />
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2">
              <Label htmlFor="arrivalFrom">Arrival From</Label>
              <Input
                id="arrivalFrom"
                name="arrivalFrom"
                value={formData.arrivalFrom}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purposeOfVisit">Purpose of Visit</Label>
              <Select
                id="purposeOfVisit"
                name="purposeOfVisit"
                value={formData.purposeOfVisit}
                onChange={handleChange}
              >
                <option key="leisure-option" value="Leisure">
                  Leisure
                </option>
                <option key="business-option" value="Business">
                  Business
                </option>
                <option key="other-option" value="Other">
                  Other
                </option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="roomPreferences.bedType">Bed Type</Label>
              <Select
                id="roomPreferences.bedType"
                name="roomPreferences.bedType"
                value={formData.roomPreferences.bedType}
                onChange={handleChange}
              >
                <option key="king-bed" value="King">
                  King
                </option>
                <option key="twin-bed" value="Twin">
                  Twin
                </option>
                <option key="queen-bed" value="Queen">
                  Queen
                </option>
              </Select>
            </div>
            <div className="space-y-2 col-span-1 md:col-span-2 flex items-center gap-2">
              <Checkbox
                id="roomPreferences.smoking"
                name="roomPreferences.smoking"
                checked={formData.roomPreferences.smoking}
                onChange={handleChange}
              />
              <Label htmlFor="roomPreferences.smoking">Smoking Room</Label>
            </div>
            <div className="space-y-2 col-span-full">
              <Label htmlFor="specialRequests">Special Requests</Label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                rows="3"
              />
            </div>
            <div className="space-y-2 col-span-full">
              <Label htmlFor="billingInstruction">Billing Instruction</Label>
              <textarea
                id="billingInstruction"
                name="billingInstruction"
                value={formData.billingInstruction}
                onChange={handleChange}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                rows="3"
              />
            </div>
          </div>
        </section>

        {/* Payment Info Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full" style={{backgroundColor: 'hsl(45, 100%, 85%)'}}>
              <FaCreditCard className="text-lg" style={{color: 'hsl(45, 43%, 58%)'}} />
            </div>
            <h2 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
              Payment Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label htmlFor="rate">Total Rate</Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                value={formData.rate}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Select
                id="paymentMode"
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
              >
                <option value="">Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountPercent">Discount (%)</Label>
              <Input
                id="discountPercent"
                name="discountPercent"
                type="number"
                min="0"
                max="100"
                value={formData.discountPercent}
                onChange={handleChange}
              />
            </div>

            {/* Show payment details based on payment mode */}
            {formData.paymentMode === "Card" && (
              <>
                <div className="col-span-full">
                  <span className="block font-semibold text-blue-700 mb-2">
                    Card Payment Details
                  </span>
                </div>
                <div className="space-y-2 col-span-full sm:col-span-1">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber || ""}
                    onChange={handleChange}
                    maxLength={19}
                    placeholder="XXXX XXXX XXXX XXXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardHolder">Card Holder Name</Label>
                  <Input
                    id="cardHolder"
                    name="cardHolder"
                    value={formData.cardHolder || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry">Expiry Date</Label>
                  <Input
                    id="cardExpiry"
                    name="cardExpiry"
                    value={formData.cardExpiry || ""}
                    onChange={handleChange}
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardCVV">CVV</Label>
                  <Input
                    id="cardCVV"
                    name="cardCVV"
                    value={formData.cardCVV || ""}
                    onChange={handleChange}
                    maxLength={4}
                  />
                </div>
              </>
            )}
            {formData.paymentMode === "UPI" && (
              <>
                <div className="col-span-full">
                  <span className="block font-semibold text-blue-700 mb-2">
                    UPI Payment Details
                  </span>
                </div>
                <div className="space-y-2 col-span-full sm:col-span-1">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    name="upiId"
                    value={formData.upiId || ""}
                    onChange={handleChange}
                    placeholder="example@upi"
                  />
                </div>
              </>
            )}
            {formData.paymentMode === "Bank Transfer" && (
              <>
                <div className="col-span-full">
                  <span className="block font-semibold text-blue-700 mb-2">
                    Bank Transfer Details
                  </span>
                </div>
                <div className="space-y-2 col-span-full sm:col-span-1">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    name="bankName"
                    value={formData.bankName || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    name="accountNumber"
                    value={formData.accountNumber || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    name="ifsc"
                    value={formData.ifsc || ""}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
            <div className="space-y-2 col-span-full flex items-center gap-2">
              <Checkbox
                id="isAdvancePaid"
                name="isAdvancePaid"
                checked={formData.isAdvancePaid}
                onChange={handleChange}
              />
              <Label htmlFor="isAdvancePaid">Advance Paid</Label>
            </div>
            {formData.isAdvancePaid && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="advancePaid">Advance Paid Amount</Label>
                  <Input
                    id="advancePaid"
                    name="advancePaid"
                    type="number"
                    value={formData.advancePaid}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    name="transactionId"
                    value={formData.transactionId}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* Vehicle Details Section */}
        <section className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full" style={{backgroundColor: 'hsl(45, 100%, 85%)'}}>
              <CarIcon className="text-lg" style={{color: 'hsl(45, 43%, 58%)'}} />
            </div>
            <h2 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
              Vehicle Details
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label htmlFor="vehicleDetails.vehicleType">Vehicle Type</Label>
              <Select
                id="vehicleDetails.vehicleType"
                name="vehicleDetails.vehicleType"
                value={formData.vehicleDetails.vehicleType}
                onChange={handleChange}
              >
                <option value="">Select a vehicle type</option>
                {allVehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle.type}>
                    {vehicle.type}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleDetails.vehicleModel">Vehicle Model</Label>
              <Input
                id="vehicleDetails.vehicleModel"
                name="vehicleDetails.vehicleModel"
                value={formData.vehicleDetails.vehicleModel}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleDetails.vehicleNumber">
                Vehicle Number
              </Label>
              <Input
                id="vehicleDetails.vehicleNumber"
                name="vehicleDetails.vehicleNumber"
                value={formData.vehicleDetails.vehicleNumber}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleDetails.driverName">Driver Name</Label>
              <Select
                id="vehicleDetails.driverName"
                name="vehicleDetails.driverName"
                value={formData.vehicleDetails.driverName}
                onChange={handleChange}
              >
                <option value="">Select a driver</option>
                {allDrivers.map((driver) => (
                  <option key={driver._id} value={driver.driverName}>
                    {driver.driverName}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleDetails.driverMobile">Driver Mobile</Label>
              <Input
                id="vehicleDetails.driverMobile"
                name="vehicleDetails.driverMobile"
                type="tel"
                value={formData.vehicleDetails.driverMobile}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            type="button"
            onClick={resetForm}
            variant="outline"
          >
            Reset
          </Button>
          <Button
            type="submit"
          >
            Submit Reservation
          </Button>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-md mt-4 text-center ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
