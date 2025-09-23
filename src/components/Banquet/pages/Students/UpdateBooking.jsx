import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../../../../context/AppContext";
import {
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaUsers,
  FaMoneyBillWave,
  FaUtensils,
  FaBuilding,
  FaInfoCircle,
  FaArrowLeft,
  FaSave,
  FaEnvelope,
  FaRupeeSign,
  FaPlus,
  FaTrash,
  FaList,
} from "react-icons/fa";
import MenuSelector from "../Menu/MenuSelector"; // Import your MenuSelector component

const UpdateBooking = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const params = useParams();
  const id = params.id;
  const role = localStorage.getItem("role");
  const [booking, setBooking] = useState({
    name: "",
    email: "",
    number: "",
    whatsapp: "",
    pax: 1,
    startDate: "",
    hall: "",
    time: "",
    bookingStatus: "Tentative",
    statusHistory: [
      {
        status: "Tentative",
        type: false,
        changedAt: new Date().toISOString(),
      },
    ],
    ratePlan: "",
    roomOption: "complimentary",
    complimentaryRooms: 2,

    advance: 0,
    total: 0,
    balance: 0,
    ratePerPax: 0,
    foodType: "Veg",
    menuItems: [],
    notes: "",
    discount: "",
    statusChangedAt: null, // Track when status changes
    staffEditCount: 0, // Added for staff edit limit logic
  });

  const [showMenuModal, setShowMenuModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(false);

  // Staff edit limit logic (frontend) - define at component level so it's available in JSX
  const isStaffEditLimitReached =
    booking.staffEditCount >= 2 && role !== "Admin";

  // --- RATE CONFIGURATION (copy from AddBooking) ---
  const RATE_CONFIG = {
    Veg: {
      Silver: {
        basePrice: 1299,
        taxPercent: 18,
      },
      Gold: {
        basePrice: 1499,
        taxPercent: 18,
      },
      Platinum: {
        basePrice: 1899,
        taxPercent: 18,
      },
    },
    "Non-Veg": {
      Silver: {
        basePrice: 1599,
        taxPercent: 18,
      },
      Gold: {
        basePrice: 1899,
        taxPercent: 18,
      },
      Platinum: {
        basePrice: 2299,
        taxPercent: 18,
      },
    },
  };

  // Calculate total when pax, ratePlan, foodType, gst, or discount changes
  useEffect(() => {
    if (
      booking.pax &&
      booking.ratePlan &&
      booking.foodType &&
      booking.gst !== undefined &&
      booking.gst !== ""
    ) {
      const rateInfo = RATE_CONFIG[booking.foodType]?.[booking.ratePlan];
      if (rateInfo) {
        const paxNum = parseInt(booking.pax) || 0;
        const gstPercent = parseFloat(booking.gst) || 0;
        const basePrice = rateInfo.basePrice;
        const discount = parseFloat(booking.discount) || 0;
        let discountedBase = basePrice;
        if (discount > 0) {
          let maxDiscount = 0;
          if (role === "Admin") {
            maxDiscount = discount; // unlimited for admin
          } else {
            // Staff discount limits by rate plan
            if (booking.ratePlan === "Silver") maxDiscount = 100;
            else if (booking.ratePlan === "Gold") maxDiscount = 150;
            else if (booking.ratePlan === "Platinum") maxDiscount = 200;
            else maxDiscount = 0;
          }
          discountedBase = basePrice - Math.min(discount, maxDiscount);
        }
        // GST should be calculated as a percentage of the discounted base
        const gstAmount = (discountedBase * gstPercent) / 100;
        const rateWithGST = discountedBase + gstAmount;

        const total = rateWithGST * paxNum; // Remove room price from calculation

        setBooking((prev) => ({
          ...prev,
          total: total ? total.toFixed(2) : "",
          ratePerPax: rateWithGST.toFixed(2),
        }));
      }
    } else {
      setBooking((prev) => ({
        ...prev,
        total: "",
        ratePerPax: "",
      }));
    }
  }, [
    booking.pax,
    booking.ratePlan,
    booking.foodType,
    booking.gst,
    booking.discount,
  ]);

  // Calculate room price when rooms change
  useEffect(() => {
    const roomsValue = parseInt(booking.rooms);
    if (!isNaN(roomsValue) && roomsValue > 2) {
      const extraRooms = roomsValue - 2;
      const pricePerUnit =
        booking.roomPricePerUnit === "" || isNaN(booking.roomPricePerUnit)
          ? 0
          : parseFloat(booking.roomPricePerUnit);
      const extraRoomTotalPrice = extraRooms * pricePerUnit;
      setBooking((prev) => ({
        ...prev,
        extraRoomTotalPrice,
        roomPrice: extraRoomTotalPrice, // Keep roomPrice for backward compatibility
      }));
    } else {
      setBooking((prev) => ({
        ...prev,
        extraRoomTotalPrice: 0,
        roomPrice: 0,
      }));
    }
  }, [booking.rooms, booking.roomPricePerUnit]);

  // Auto-calculate balance and update status if advance is paid
  useEffect(() => {
    const advance = parseFloat(booking.advance) || 0;
    const total = parseFloat(booking.total) || 0;
    const balance = total - advance;
    let newStatus = booking.bookingStatus;
    let statusBool = booking.status;
    if (advance > 0) {
      newStatus = "Confirmed";
      statusBool = true;
    } else {
      newStatus = "Tentative";
      statusBool = false;
    }
    setBooking((prev) => ({
      ...prev,
      balance: balance.toFixed(2),
      bookingStatus: newStatus,
      status: statusBool,
      statusChangedAt: new Date().toISOString(),
      statusHistory: [
        ...(Array.isArray(prev.statusHistory) ? prev.statusHistory : []),
        {
          status: newStatus,
          type: statusBool,
          changedAt: new Date().toISOString(),
        },
      ],
    }));
  }, [booking.advance, booking.total]);

  // Fetch booking details when component loads
  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const fetchBookingDetail = () => {
    axios
      .get(`/api/bookings/${id}`)
      .then((res) => {
        if (res.data) {
          const bookingData = res.data.data || res.data;
          const categorizedMenu = res.data.categorizedMenu;

          // Flatten all items from categorizedMenu into a single array
          const menuItems = categorizedMenu
            ? Object.values(categorizedMenu)
                .flat()
                .filter((item) => typeof item === "string")
            : [];

          const formatDate = (date) => {
            if (!date) return "";
            try {
              const d = new Date(date);
              return isNaN(d.getTime()) ? "" : d.toISOString().split("T")[0];
            } catch {
              return "";
            }
          };

          // Ensure statusHistory exists and is an array
          let statusHistory =
            Array.isArray(bookingData.statusHistory) &&
            bookingData.statusHistory.length > 0
              ? bookingData.statusHistory
              : [
                  {
                    status: bookingData.bookingStatus || "Tentative",
                    changedAt:
                      bookingData.statusChangedAt || new Date().toISOString(),
                  },
                ];

          // Use numbers for calculation fields, empty string if missing
          // Ensure staffEditCount is loaded from backend if present, else default to 0
          const formattedData = {
            ...bookingData,
            startDate: formatDate(bookingData.startDate),
            menuItems,
            categorizedMenu,
            pax:
              bookingData.pax !== undefined &&
              bookingData.pax !== null &&
              bookingData.pax !== ""
                ? Number(bookingData.pax)
                : "",
            ratePerPax:
              bookingData.ratePerPax !== undefined &&
              bookingData.ratePerPax !== null &&
              bookingData.ratePerPax !== ""
                ? Number(bookingData.ratePerPax)
                : "",
            advance:
              bookingData.advance !== undefined &&
              bookingData.advance !== null &&
              bookingData.advance !== ""
                ? Number(bookingData.advance)
                : "",
            total:
              bookingData.total !== undefined &&
              bookingData.total !== null &&
              bookingData.total !== ""
                ? Number(bookingData.total)
                : "",
            balance:
              bookingData.balance !== undefined &&
              bookingData.balance !== null &&
              bookingData.balance !== ""
                ? Number(bookingData.balance)
                : "",
            gst:
              bookingData.gst !== undefined &&
              bookingData.gst !== null &&
              bookingData.gst !== ""
                ? Number(bookingData.gst)
                : "",
            statusHistory,
            staffEditCount:
              typeof bookingData.staffEditCount === "number"
                ? bookingData.staffEditCount
                : 0,
            // Add these lines to initialize room-related fields
            extraRooms:
              bookingData.extraRooms !== undefined
                ? String(bookingData.extraRooms)
                : "",
            roomPricePerUnit:
              bookingData.roomPricePerUnit !== undefined
                ? String(bookingData.roomPricePerUnit)
                : "",
            extraRoomTotalPrice:
              bookingData.extraRoomTotalPrice || bookingData.roomPrice || 0,
            roomOption: bookingData.roomOption || "complimentary", // Add this line
            // ... rest of the fields
          };

          setBooking(formattedData);
        }
      })
      .catch((err) => {
        toast.error("Error fetching booking details");
      });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;
    setBooking((prev) => {
      let newStatus = prev.bookingStatus;
      let newStatusHistory = [
        ...(Array.isArray(prev.statusHistory) ? prev.statusHistory : []),
      ];
      let isConfirmed = prev.isConfirmed || false;
      let isEnquiry = prev.isEnquiry || false;
      let isTentative = prev.isTentative || false;
      // If advance is changed and > 0, set Confirmed
      if (name === "advance" && parseFloat(val) > 0) {
        newStatus = "Confirmed";
        isConfirmed = true || prev.isConfirmed;
        isEnquiry = prev.isEnquiry;
        isTentative = prev.isTentative;
        if (
          newStatusHistory.length === 0 ||
          newStatusHistory[newStatusHistory.length - 1].status !== "Confirmed"
        ) {
          newStatusHistory.push({
            status: "Confirmed",
            changedAt: new Date().toISOString(),
          });
        }
      } else if (name !== "advance" && prev.bookingStatus !== "Confirmed") {
        // On any other edit, set Tentative if not already
        newStatus = "Tentative";
        isConfirmed = prev.isConfirmed;
        isEnquiry = prev.isEnquiry;
        isTentative = true || prev.isTentative;
        if (
          newStatusHistory.length === 0 ||
          newStatusHistory[newStatusHistory.length - 1].status !== "Tentative"
        ) {
          newStatusHistory.push({
            status: "Tentative",
            changedAt: new Date().toISOString(),
          });
        }
      }
      // If bookingStatus is changed directly (dropdown), handle accordingly
      if (name === "bookingStatus" && value !== prev.bookingStatus) {
        newStatus = val;
        isConfirmed = prev.isConfirmed || val === "Confirmed";
        isEnquiry = prev.isEnquiry || val === "Enquiry";
        isTentative = prev.isTentative || val === "Tentative";
        if (
          newStatusHistory.length === 0 ||
          newStatusHistory[newStatusHistory.length - 1].status !== val
        ) {
          newStatusHistory.push({
            status: val,
            changedAt: new Date().toISOString(),
          });
        }
      }
      return {
        ...prev,
        [name]: val,
        bookingStatus: newStatus,
        isConfirmed,
        isEnquiry,
        isTentative,
        statusChangedAt: new Date().toISOString(),
        statusHistory: newStatusHistory,
        // staffEditCount is only incremented on menu change, not here
      };
    });
  };
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    // Allow empty string for controlled input, otherwise parse as number
    const numValue = value === "" ? "" : Number(value);
    setBooking((prev) => {
      const updated = {
        ...prev,
        [name]: numValue,
      };
      if (name === "pax" || name === "ratePerPax") {
        const paxVal = name === "pax" ? numValue : prev.pax;
        const rateVal = name === "ratePerPax" ? numValue : prev.ratePerPax;
        const newTotal =
          paxVal !== "" && rateVal !== "" ? paxVal * rateVal : "";
        return {
          ...updated,
          total: newTotal,
          balance: newTotal !== "" ? newTotal - (prev.advance || 0) : "",
        };
      }
      if (name === "advance") {
        return {
          ...updated,
          balance:
            (prev.total !== "" ? prev.total : 0) -
            (numValue !== "" ? numValue : 0),
        };
      }
      if (name === "total") {
        return {
          ...updated,
          balance:
            (numValue !== "" ? numValue : 0) -
            (prev.advance !== "" ? prev.advance : 0),
        };
      }
      return updated;
    });
  };

  // Menu item handlers
  const handleMenuItemChange = (e, index) => {
    const { name, value } = e.target;
    const updatedMenuItems = [...booking.menuItems];
    updatedMenuItems[index] = {
      ...updatedMenuItems[index],
      [name]: name === "quantity" ? Number(value) : value,
    };
    setBooking((prev) => ({ ...prev, menuItems: updatedMenuItems }));
  };

  // --- Rate Plan Summary UI Helper ---
  const getCurrentRateInfo = () => {
    if (!booking.ratePlan || !booking.foodType) return null;
    return RATE_CONFIG[booking.foodType][booking.ratePlan];
  };
  const currentRate = getCurrentRateInfo();

  const removeMenuItem = (index) => {
    const updatedMenuItems = [...booking.menuItems];
    updatedMenuItems.splice(index, 1);
    setBooking((prev) => ({ ...prev, menuItems: updatedMenuItems }));
  };

  // Handle menu selection from modal
  const handleMenuSelection = (selectedItems, categorizedMenu) => {
    // Only increment staffEditCount if staff (not admin), menu is changed, and limit not reached
    setBooking((prev) => {
      const isMenuChanged =
        JSON.stringify(prev.menuItems) !== JSON.stringify(selectedItems) ||
        JSON.stringify(prev.categorizedMenu) !==
          JSON.stringify(categorizedMenu);
      let newCount = prev.staffEditCount;
      // Only increment if staff, menu changed, and staffEditCount < 2, and do NOT block the 2nd edit
      if (role !== "Admin" && isMenuChanged && prev.staffEditCount >= 2) {
        newCount = prev.staffEditCount + 1;
      }
      // Only allow menu change if staffEditCount < 2 for staff, unlimited for admin
      if (role !== "Admin" && prev.staffEditCount >= 2) {
        // Do not update menu or categorizedMenu, just return previous state
        return prev;
      }
      return {
        ...prev,
        menuItems: selectedItems,
        categorizedMenu,
        staffEditCount: newCount,
      };
    });
  };

  const updateBooking = () => {
    setLoading(true);

    const requiredFields = ["name", "email", "number", "pax", "startDate"];
    const missingFields = requiredFields.filter((field) => !booking[field]);

    if (missingFields.length > 0) {
      const missingFieldsMsg = `Please fill in all required fields: ${missingFields.join(
        ", "
      )}`;
      toast.error(missingFieldsMsg);
      setLoading(false);
      return;
    }

    // Build payload with customerRef and categorizedMenu as requested
    const categorizedMenu = booking.categorizedMenu;
    const payload = {
      ...booking,
      complimentaryRooms:
        booking.complimentaryRooms === ""
          ? 0
          : Number(booking.complimentaryRooms),
      customerRef: String(
        booking.customerRef || booking.customerref || booking.number
      ),
      categorizedMenu: categorizedMenu,
    };
    if (!payload.menuItems) payload.menuItems = [];
    if (!payload.statusChangedAt) {
      delete payload.statusChangedAt;
    }
    payload.statusHistory = [
      {
        status: booking.bookingStatus,
        changedAt: new Date().toISOString(),
      },
    ];
    function computeStatusBooleans(statusHistory) {
      let isEnquiry = false,
        isTentative = false,
        isConfirmed = false;
      for (const entry of statusHistory) {
        if (entry.status === "Enquiry") isEnquiry = true;
        if (entry.status === "Tentative") isTentative = true;
        if (entry.status === "Confirmed") isConfirmed = true;
      }
      return { isEnquiry, isTentative, isConfirmed };
    }
    const statusBooleans = computeStatusBooleans(payload.statusHistory || []);
    payload.isEnquiry = statusBooleans.isEnquiry;
    payload.isTentative = statusBooleans.isTentative;
    payload.isConfirmed = statusBooleans.isConfirmed;
    // Send the user's role
    payload.role = localStorage.getItem("role") || "Staff";

    // Only include categorizedMenu if staff is allowed to edit menu, or if admin
    const isStaff = payload.role !== "Admin";
    if (isStaff && booking.staffEditCount >= 2) {
      // Staff cannot update menu anymore, so remove categorizedMenu from payload
      delete payload.categorizedMenu;
    } else if (payload.categorizedMenu && payload.categorizedMenu.customerRef) {
      // Remove customerRef from categorizedMenu if present
      const { customerRef, ...rest } = payload.categorizedMenu;
      payload.categorizedMenu = rest;
    }

    console.log("Updating booking with data:", payload);

    axios
      .put(`/api/bookings/${id}`, payload)
      .then((res) => {
        if (res.data) {
          toast.success("Booking updated successfully!");
          setLoading(false);
          setTimeout(() => {
            navigate("/list-booking");
          }, 600);
        }
      })
      .catch((err) => {
        setLoading(false);
        toast.error(err.response?.data?.message || "Error updating booking");
        console.error("Update Error:", err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/list-booking"
          className="flex items-center text-[#c3ad6b] hover:text-[#b39b5a]"
        >
          <FaArrowLeft className="mr-2" /> Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Update Booking</h1>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 space-y-8">
          {/* Personal Information Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#c3ad6b]/20 p-2 rounded-full">
                <FaUser className="text-[#c3ad6b] text-lg" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Personal Information
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.name}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.email}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="number"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.number}
                    required
                  />
                </div>
              </div>

              {/* WhatsApp */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp Number
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="whatsapp"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.whatsapp}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Rate Plan Summary Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#c3ad6b]/20 p-2 rounded-full">
                <FaMoneyBillWave className="text-[#c3ad6b] text-lg" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Rate Plan Summary
              </h2>
            </div>
            <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:space-x-8 space-y-4 md:space-y-0 border border-[#f3e9d1]">
              {/* Rate Plan & Food Type */}
              <div className="flex-1 flex flex-col items-center md:items-start">
                <div className="flex items-center space-x-2 mb-1">
                  <FaUtensils className="text-[#c3ad6b] text-xl" />
                  <span className="font-semibold text-gray-700 text-lg">
                    {booking.ratePlan || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Rate Plan</span>
                {booking.foodType &&
                  booking.ratePlan &&
                  RATE_CONFIG[booking.foodType] &&
                  RATE_CONFIG[booking.foodType][booking.ratePlan] && (
                    <div className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const base =
                          RATE_CONFIG[booking.foodType][booking.ratePlan]
                            .basePrice;
                        const discount = parseFloat(booking.discount) || 0;
                        let displayBase = base;
                        if (discount > 0) {
                          displayBase = base - discount;
                        }
                        return (
                          <>
                            {booking.ratePlan} Rate:{" "}
                            <span className="font-bold text-[#c3ad6b]">
                              ₹{displayBase}
                            </span>
                            {discount > 0 && (
                              <span className="ml-2 text-green-600">
                                (Discounted)
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
              </div>
              {/* Food Type */}
              <div className="flex-1 flex flex-col items-center md:items-start">
                <div className="flex items-center space-x-2 mb-1">
                  <FaUsers className="text-[#c3ad6b] text-xl" />
                  <span className="font-semibold text-gray-700 text-lg">
                    {booking.foodType || (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-gray-500">Food Type</span>
              </div>
              {/* Calculation */}
              <div className="flex-1 flex flex-col items-center md:items-start">
                <div className="flex items-center space-x-2 mb-1">
                  <FaRupeeSign className="text-[#c3ad6b] text-xl" />
                  <span className="font-semibold text-gray-700 text-lg">
                    Calculation
                  </span>
                </div>
                {booking.ratePlan &&
                booking.foodType &&
                booking.pax &&
                booking.gst ? (
                  <>
                    {(() => {
                      const rateInfo =
                        RATE_CONFIG[booking.foodType][booking.ratePlan];
                      if (!rateInfo) return null;
                      const base = rateInfo.basePrice;
                      const discount = parseFloat(booking.discount) || 0;
                      const discountedBase =
                        discount > 0 ? base - discount : base;
                      const gstPercent = parseFloat(booking.gst) || 0;
                      const gstAmount = (discountedBase * gstPercent) / 100;
                      const rateWithGST = discountedBase + gstAmount;
                      const pax = parseInt(booking.pax) || 0;
                      const total = (rateWithGST * pax).toFixed(2);
                      return (
                        <>
                          <span className="text-lg font-bold text-[#c3ad6b]">
                            ₹{rateWithGST.toFixed(2)}
                          </span>
                          <span className="text-gray-700"> x {pax} = </span>
                          <span className="text-lg font-bold text-[#c3ad6b]">
                            ₹{total}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            Rate per pax: ₹{discountedBase} + ₹
                            {gstAmount.toFixed(2)} (GST) = ₹
                            {rateWithGST.toFixed(2)}
                          </div>
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </div>
              {/* Total Amount */}
              <div className="flex-1 flex flex-col items-center md:items-start">
                <div className="flex items-center space-x-2 mb-1">
                  <FaMoneyBillWave className="text-[#c3ad6b] text-xl" />
                  <span className="font-semibold text-gray-700 text-lg">
                    Total
                  </span>
                </div>
                <span className="text-2xl font-extrabold text-[#c3ad6b]">
                  {booking.total || <span className="text-gray-400">N/A</span>}
                </span>
                <span className="text-xs text-gray-500">Total Amount</span>
              </div>
            </div>
            {/* Discount Input Section */}
            <div className="mt-4 flex flex-col md:flex-row md:items-center md:space-x-8 space-y-2 md:space-y-0">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Discount{" "}
                  {localStorage.getItem("role") === "Admin"
                    ? "(unlimited)"
                    : "(max 100)"}
                </label>
                <input
                  type="number"
                  name="discount"
                  className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                  onChange={handleInputChange}
                  value={booking.discount}
                  min={0}
                  max={
                    localStorage.getItem("role") === "Admin"
                      ? undefined
                      : booking.ratePlan === "Silver"
                      ? 100
                      : booking.ratePlan === "Gold"
                      ? 150
                      : booking.ratePlan === "Platinum"
                      ? 200
                      : 0
                  }
                  placeholder="Enter discount"
                  disabled={!booking.ratePlan}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {booking.ratePlan
                    ? localStorage.getItem("role") === "Admin"
                      ? "No discount limit for Admin"
                      : booking.ratePlan === "Silver"
                      ? "Maximum discount allowed: ₹100"
                      : booking.ratePlan === "Gold"
                      ? "Maximum discount allowed: ₹150"
                      : booking.ratePlan === "Platinum"
                      ? "Maximum discount allowed: ₹200"
                      : "Select a Rate Plan to enable discount"
                    : "Select a Rate Plan to enable discount"}
                </div>
              </div>
            </div>
          </section>

          {/* Booking Details Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#c3ad6b]/20 p-2 rounded-full">
                <FaCalendarAlt className="text-[#c3ad6b] text-lg" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Booking Details
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Pax */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Number of Pax *
                </label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="pax"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleNumberInputChange}
                    value={isNaN(booking.pax) ? "" : booking.pax}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Booking Date *
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    name="startDate"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.startDate}
                    required
                  />
                </div>
              </div>

              {/* Time */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Time Slot
                </label>
                <input
                  type="time"
                  name="time"
                  className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                  onChange={handleInputChange}
                  value={booking.time}
                />
              </div>

              {/* Hall */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Hall Type
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="hall"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.hall}
                  >
                    <option value="Nirvana">Nirvana</option>
                    <option value="Mandala">Mandala</option>
                    <option value="Conference">Conference</option>
                    <option value="Lawn">Lawn</option>
                  </select>
                </div>
              </div>

              {/* Room Options - Only show if hall is selected */}
              {booking.hall && (
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Room Option
                  </label>
                  <select
                    name="roomOption"
                    className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.roomOption || "complimentary"}
                  >
                    <option value="complimentary">
                      Complimentary Free Room
                    </option>
                    <option value="additional">Additional Room</option>
                    <option value="both">
                      Complimentary + Additional Room
                    </option>
                  </select>
                </div>
              )}

              {/* Complimentary Rooms - Show only for complimentary or both options */}
              {booking.hall &&
                (booking.roomOption === "complimentary" ||
                  booking.roomOption === "both") && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Complimentary Rooms
                    </label>
                    <input
                      type="number"
                      name="complimentaryRooms"
                      min={0}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 px-3"
                      value={
                        booking.complimentaryRooms === ""
                          ? ""
                          : booking.complimentaryRooms
                      }
                      onChange={(e) =>
                        setBooking({
                          ...booking,
                          complimentaryRooms:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    />
                    <div className="text-green-600 font-medium">FREE</div>
                  </div>
                )}

              {/* Additional Rooms - Show only for additional or both options */}
              {booking.hall &&
                (booking.roomOption === "additional" ||
                  booking.roomOption === "both") && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Rooms
                    </label>
                    <input
                      type="number"
                      name="extraRooms"
                      className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                      onChange={(e) => {
                        const value = e.target.value;
                        const extraRoomsNum =
                          value === "" ? 0 : parseInt(value, 10);
                        const pricePerRoomNum =
                          booking.roomPricePerUnit === ""
                            ? 0
                            : parseFloat(booking.roomPricePerUnit);
                        const extraRoomTotalPrice =
                          pricePerRoomNum * extraRoomsNum;

                        setBooking({
                          ...booking,
                          extraRooms: value, // keep as string for input
                          rooms:
                            booking.roomOption === "both"
                              ? (2 + extraRoomsNum).toString()
                              : value,
                          extraRoomTotalPrice: extraRoomTotalPrice,
                        });
                      }}
                      value={booking.extraRooms}
                    />
                  </div>
                )}

              {/* Room Price - only shown when extra rooms are added */}
              {booking.hall &&
                (booking.roomOption === "additional" ||
                  booking.roomOption === "both") &&
                booking.extraRooms > 0 && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Room Price (per room)
                    </label>
                    <div className="relative">
                      <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="roomPricePerUnit"
                        className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                        onChange={(e) => {
                          const value = e.target.value;
                          const pricePerRoomNum =
                            value === "" ? 0 : parseFloat(value);
                          const extraRoomsNum =
                            booking.extraRooms === ""
                              ? 0
                              : parseInt(booking.extraRooms, 10);
                          const extraRoomTotalPrice =
                            pricePerRoomNum * extraRoomsNum;

                          setBooking({
                            ...booking,
                            roomPricePerUnit: value, // keep as string for input
                            extraRoomTotalPrice: extraRoomTotalPrice,
                          });
                        }}
                        value={booking.roomPricePerUnit}
                      />
                    </div>
                    <p className="text-sm font-medium text-[#c3ad6b] mt-1">
                      Total: ₹
                      {(() => {
                        const extraRoomsNum =
                          booking.extraRooms === ""
                            ? 0
                            : parseInt(booking.extraRooms, 10);
                        const pricePerRoomNum =
                          booking.roomPricePerUnit === ""
                            ? 0
                            : parseFloat(booking.roomPricePerUnit);
                        return pricePerRoomNum * extraRoomsNum;
                      })()}
                    </p>
                  </div>
                )}

              {/* Hall */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Hall Type
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="hall"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.hall}
                  >
                    <option value="Nirvana">Nirvana</option>
                    <option value="Mandala">Mandala</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>
              </div>

              {/* Food Type */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Food Type
                </label>
                <div className="relative">
                  <FaUtensils className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="foodType"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.foodType}
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Booking Status *
                </label>
                <div className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 px-3 text-gray-700">
                  {booking.bookingStatus}
                </div>
              </div>

              {/* Rate Plan */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Rate Plan
                </label>
                <select
                  name="ratePlan"
                  className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                  onChange={handleInputChange}
                  value={booking.ratePlan}
                  required
                >
                  <option value="">Select Rate Plan</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
              </div>
            </div>
          </section>

          {/* Menu Section - Only for Admin */}
          {
            <>
              <div className="border-t border-gray-200"></div>
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-[#c3ad6b]/20 p-2 rounded-full">
                      <FaUtensils className="text-[#c3ad6b] text-lg" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      Menu Selection
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowMenuModal(true)}
                    className={`flex items-center bg-[#c3ad6b] hover:bg-[#b39b5a] text-white py-2 px-4 rounded-lg ${
                      isStaffEditLimitReached
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={isStaffEditLimitReached}
                  >
                    <FaList className="mr-2" /> Select Menu Items
                  </button>
                  {isStaffEditLimitReached && (
                    <div className="text-red-500 text-sm ml-4">
                      Menu edit limit reached for staff.
                    </div>
                  )}
                </div>
                {/* Selected Menu Items (read-only textarea, like AddBooking) */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Selected Menu Items
                  </label>
                  <textarea
                    name="menuItems"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 px-3 h-24"
                    value={
                      booking.categorizedMenu
                        ? Object.entries(booking.categorizedMenu)
                            .filter(
                              ([key]) =>
                                ![
                                  "_id",
                                  "bookingRef",
                                  "createdAt",
                                  "updatedAt",
                                  "__v",
                                ].includes(key)
                            )
                            .map(([, arr]) => arr)
                            .flat()
                            .join(", ")
                        : ""
                    }
                    readOnly
                    placeholder="No menu items selected yet"
                  />
                </div>
                {/* Selected Menu Items Table */}
                {/* {booking.menuItems && booking.menuItems.length > 0 ? (
                  <div className="space-y-4 mt-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {booking.menuItems.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.category}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  <FaRupeeSign className="inline mr-1" />
                                  {item.price}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  name="quantity"
                                  min="1"
                                  className="w-20 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-1 px-2"
                                  value={isNaN(item.quantity) ? "" : item.quantity}
                                  onChange={(e) => handleMenuItemChange(e, index)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  <FaRupeeSign className="inline mr-1" />
                                  {item.price * item.quantity}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => removeMenuItem(index)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Remove item"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No menu items selected. Click "Select Menu Items" to add items.
                  </div>
                )} */}
              </section>
            </>
          }

          {/* Menu Selection Modal */}
          {showMenuModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Select Menu Items</h3>
                  <button
                    onClick={() => setShowMenuModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    &times;
                  </button>
                </div>
                <MenuSelector
                  initialItems={booking.menuItems}
                  foodType={booking.foodType}
                  ratePlan={booking.ratePlan}
                  onSave={handleMenuSelection}
                  onClose={() => setShowMenuModal(false)}
                />
              </div>
            </div>
          )}

          <div className="border-t border-gray-200"></div>

          {/* Financial Information Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#c3ad6b]/20 p-2 rounded-full">
                <FaMoneyBillWave className="text-[#c3ad6b] text-lg" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Financial Information
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Rate Per Pax */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Rate Per Pax *
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="ratePerPax"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleNumberInputChange}
                    value={booking.ratePerPax}
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* GST (manual input) */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  GST In Percentage
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="gst"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleInputChange}
                    value={booking.gst || ""}
                    placeholder="Enter GST manually"
                  />
                </div>
              </div>

              {/* Total */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Total Amount
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="total"
                    className={`pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 ${
                      role !== "Admin" ? "bg-gray-100" : ""
                    }`}
                    onChange={handleNumberInputChange}
                    value={booking.total !== "" ? booking.total : ""}
                    min="0"
                    readOnly={role !== "Admin"}
                  />
                </div>
              </div>

              {/* Advance */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Advance Payment
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="advance"
                    className="pl-10 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                    onChange={handleNumberInputChange}
                    value={booking.advance !== "" ? booking.advance : ""}
                    min="0"
                  />
                </div>
              </div>

              {/* Balance */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Balance
                </label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    name="balance"
                    className="pl-10 w-full rounded-lg border border-gray-300 bg-gray-100 py-2 px-3"
                    value={booking.balance !== "" ? booking.balance : ""}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="border-t border-gray-200"></div>

          {/* Notes Section */}
          <section className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-[#c3ad6b]/20 p-2 rounded-full">
                <FaInfoCircle className="text-[#c3ad6b] text-lg" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Additional Information
              </h2>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                className="w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 py-2 px-3 h-32"
                onChange={handleInputChange}
                value={booking.notes}
                placeholder="Any special requests or notes..."
              />
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-6 flex justify-center">
            <button
              disabled={loading}
              onClick={updateBooking}
              className={`w-full md:w-1/2 flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-[#c3ad6b] hover:bg-[#b39b5a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c3ad6b] transition-colors duration-300 ${
                loading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" /> Update Booking
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateBooking;
