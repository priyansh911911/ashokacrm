import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAppContext } from "../../../../context/AppContext";
import { useEffect, useRef, useState } from "react";

import { AiFillFileExcel } from "react-icons/ai";
import { CSVLink } from "react-csv";
import { FiSearch, FiX, FiPlus, FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
// import noimg from "../../assets/noimg.png";
import SlideToggle from "../toggle/SlideToggle";

const MenuViewModal = ({ booking, onClose }) => {
  const { axios } = useAppContext();
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get(`/api/banquet-menus/${booking._id}`);
        console.log('Menu API Response:', response.data);
        
        if (response.data && response.data.categories) {
          setMenu(response.data.categories);
        } else {
          setMenu({ message: 'No menu items selected for this booking' });
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        setError("Failed to load menu.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [booking, axios]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Menu for {booking.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c3ad6b]"></div>
            <span className="ml-2">Loading menu...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium">Rate Plan:</span> {booking.ratePlan}
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <span className="font-medium">Food Type:</span> {booking.foodType}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menu && menu.message ? (
                <div className="col-span-full text-center text-gray-500 py-8">
                  {menu.message}
                </div>
              ) : menu && Object.entries(menu).map(([category, items]) => {
                const skip = ["_id", "createdAt", "updatedAt", "__v", "bookingRef", "customerRef", "message"];
                if (skip.includes(category)) return null;
                if (Array.isArray(items) && items.length > 0) {
                  return (
                    <div key={category} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {category.replaceAll("_", " ").split(" ").map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(" ")}
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {items.map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  );
                }
                return null;
              })}
              {(!menu || (Object.keys(menu || {}).length === 0)) && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No menu items found for this booking.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const EditBookingModal = ({ booking, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: booking.name || '',
    number: booking.number || '',
    ratePlan: booking.ratePlan || 'Silver',
    foodType: booking.foodType || 'Veg',
    pax: booking.pax || 1,
    hall: booking.hall || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Edit Booking</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded-lg" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="text" 
                value={formData.number} 
                onChange={(e) => setFormData({...formData, number: e.target.value})}
                className="w-full p-2 border rounded-lg" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rate Plan</label>
              <select 
                value={formData.ratePlan} 
                onChange={(e) => setFormData({...formData, ratePlan: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Food Type</label>
              <select 
                value={formData.foodType} 
                onChange={(e) => setFormData({...formData, foodType: e.target.value})}
                className="w-full p-2 border rounded-lg"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pax</label>
              <input 
                type="number" 
                value={formData.pax} 
                onChange={(e) => setFormData({...formData, pax: parseInt(e.target.value) || 1})}
                className="w-full p-2 border rounded-lg" 
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hall</label>
              <input 
                type="text" 
                value={formData.hall} 
                onChange={(e) => setFormData({...formData, hall: e.target.value})}
                className="w-full p-2 border rounded-lg" 
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button 
              type="submit"
              disabled={saving}
              className="text-white px-4 py-2 rounded transition-colors disabled:opacity-50" 
              style={{backgroundColor: 'hsl(45, 43%, 58%)'}} 
              onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = 'hsl(45, 32%, 46%)')}
              onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = 'hsl(45, 43%, 58%)')}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};
const ListBooking = () => {
  const { axios } = useAppContext();
  const tableRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const [allData, setAllData] = useState([]);
  const [editingBooking, setEditingBooking] = useState(null);
  const [viewingMenu, setViewingMenu] = useState(null);
  // Detect mobile view
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 600 : false
  );
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Get user role from localStorage
  const userRole = localStorage.getItem("role") || "Staff";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/banquet-bookings`);
      
      if (res.data) {
        const dataArray = Array.isArray(res.data) ? res.data : res.data.bookings || [];
        const processedData = dataArray.map((item) => ({
          ...item,
          _id: item._id || item.id,
          number: item.phoneNo || item.number || item.phone || '',
          advance: item.advance ?? 0,
          total: item.total ?? 0,
          balance: item.balance ?? 0,
          ratePlan: item.ratePlan || 'Standard',
          foodType: item.foodType || 'Veg',
          hall: item.hall || 'Main Hall',
          bookingStatus: item.bookingStatus || item.status || 'Confirmed',
          startDate: item.checkInDate || new Date().toISOString(),
          pax: item.noOfAdults || 1
        }));

        console.table(processedData);
        setUserData(processedData);
        setTotalPages(processedData.length);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast.error('Failed to fetch bookings');
      setUserData([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchAllData = async () => {
    try {
      const res = await axios.get('/api/banquet-bookings');
      
      if (res.data) {
        const dataArray = Array.isArray(res.data) ? res.data : (res.data.bookings || []);
        setAllData(dataArray);
      }
    } catch (error) {
      console.error("Failed to fetch all bookings:", error);
      setAllData([]);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchUsers();
  }, [currentPage]);

  //   DELETE
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/banquet-bookings/${id}`);
      toast.success('Booking deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete booking');
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteModal = (product) => {
    // Find the product to delete based on productId
    console.log(product);
    // Set the product to delete and open the modal
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    // Call your delete function here with productToDelete
    // ...
    if (productToDelete == "delete-all") {
      handleDelete("delete-all");
    }
    handleDelete(productToDelete._id);
    // Close the modal
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    // Close the modal without deleting
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };
  // handle toggle

  const handleToggleStatus = (id, currentStatus) => {
    // Toggle the status from true to false or false to true
    const updatedStatus = !currentStatus;

    // Optimistic UI update - update the status immediately in the UI
    setUserData((prevData) =>
      prevData.map((user) =>
        user._id === id ? { ...user, status: updatedStatus } : user
      )
    );

    // Send API request to update status in backend
    axios
      .put(
        `/little/achiver/update-status/${id}`,
        {
          status: updatedStatus, // Boolean status value
        }
      )
      .then((res) => {
        if (res.data) {
          console.log("Status updated successfully:", res.data); // Log the successful response
          toast.success("Status updated successfully");
        }
      })
      .catch((error) => {
        console.log("Error updating status:", error); // Log the error response
        toast.error("Failed to update status");
        // Revert the status change if the update failed
        setUserData((prevData) =>
          prevData.map((user) =>
            user._id === id ? { ...user, status: currentStatus } : user
          )
        );
      });
  };
  //   DELETE

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const renderPagination = () => {
    const itemsPerPage = 10;
    const totalItems = userData.length;
    const maxPage = Math.ceil(totalItems / itemsPerPage);
    
    if (maxPage <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;

    for (let i = 1; i <= maxPage; i++) {
      pageNumbers.push(i);
    }

    let startPage, endPage;

    if (maxPage <= maxPagesToShow) {
      startPage = 1;
      endPage = maxPage;
    } else {
      if (currentPage <= maxPagesToShow - 2) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + 1 >= maxPage) {
        startPage = maxPage - maxPagesToShow + 1;
        endPage = maxPage;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }

    const visiblePages = pageNumbers.slice(startPage - 1, endPage);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === maxPage;

    return (
      <nav className="mt-8 flex justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isFirstPage 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
            disabled={isFirstPage}
          >
            Previous
          </button>
          
          {visiblePages.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentPage === number
                  ? "bg-[#c3ad6b] text-white border-[#c3ad6b]"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }`}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isLastPage
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
            disabled={isLastPage}
          >
            Next
          </button>
        </div>
      </nav>
    );
  };
  const handleSearch = () => {
    if (searchQuery != "") {
      setLoading(true);
      try {
        axios
          .get(
            `/api/bookings/search?q=${searchQuery}`
          )
          .then((res) => {
            console.log(res);
            if (res.data) {
              setUserData(res.data.data || []); // Ensure it's always an array
              setTotalPages(res.data.total);
              setLoading(false);
            }
          })
          .catch((error) => {
            console.log(error);
            toast.error(error.response?.data?.message || "Error fetching data");
            setUserData([]); // Reset to an empty array on error
            setLoading(false);
            setTotalPages(1);
          })
          .finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.log(error);
        setUserData([]); // Reset to an empty array on error
        setLoading(false);
        setTotalPages(1);
      }
    } else {
      fetchUsers(); // Reset the search and show all users
    }
  };

  const debouncedSearch = debounce(handleSearch, 300);
  const handleChange = (e) => {
    const { value } = e.target;
    setSearchQuery(value);
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => debouncedSearch(value), 800);
  };
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery]);

  // Function to handle CSV download
  const handleDownloadCSV = () => {
    const table = tableRef.current;
    if (!table) return;

    // Extract table data
    const rows = Array.from(table.querySelectorAll("tr"));
    const csvData = rows
      .map((row) =>
        Array.from(row.querySelectorAll("th, td"))
          .map((cell) => cell.innerText)
          .join(",")
      )
      .join("\n");

    // Trigger download
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Staff-Detail.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV export headers and data transformation
  const csvHeaders = [
    { label: "Name", key: "name" },
    { label: "Number", key: "number" },
    { label: "Email", key: "email" },
    { label: "WhatsApp Number", key: "whatsapp" },
    { label: "Paxs", key: "pax" },
    { label: "Booking Date", key: "startDate" },
    { label: "Food Type", key: "foodType" },
    { label: "Rate Plan", key: "ratePlan" },
    { label: "Advance", key: "advance" },
    { label: "GST", key: "gst" },
    { label: "Total Amount", key: "total" },
    { label: "Balance", key: "balance" },
    { label: "Rate Per Pax", key: "ratePerPax" },
    { label: "Hall", key: "hall" },
    { label: "Time", key: "time" },
    { label: "Discount", key: "discount" },
    { label: "Customer Reference", key: "customerRef" },
    { label: "Status", key: "bookingStatus" },
  ];
  const csvData = allData.map((item) => ({
    name: item.name || "",
    number: item.number || "",
    whatsapp: item.whatsapp || "",
    pax: item.pax || "",
    startDate: item.startDate
      ? new Date(item.startDate).toLocaleDateString()
      : "",
    foodType: item.foodType || "",
    ratePlan: item.ratePlan || "",
    advance: item.advance || "",
    gst: item.gst || "",
    total: item.total || "",
    balance: item.balance || "",
    ratePerPax: item.ratePerPax || "",
    hall: item.hall || "",
    time: item.time || "",
    discount: item.discount || "",
    customerRef: item.customerRef || "",
    bookingStatus: item.bookingStatus || "",
  }));

  return (
    <>
      {/* Show user role at top on mobile, above all content */}
      {isMobile && (
        <div className="w-full flex justify-center items-center mb-2 mt-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c3ad6b]/10 text-[#c3ad6b] font-semibold text-sm shadow">
            {userRole === "Admin" ? "👑 Admin" : "👤 Staff"}
          </span>
        </div>
      )}
      <Toaster />
      <div className="flex items-end flex-col mb-4">
        <Link
          to={"/banquet/add-booking"}
          className="inline-flex items-center gap-2 px-5 py-2 mb-2 text-white rounded-lg shadow transition-colors font-semibold"
          style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
        >
          <FiPlus className="text-lg" />
          Add Booking
        </Link>
        <CSVLink
          data={csvData}
          headers={csvHeaders}
          filename="Booking_Customer_Details.csv"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600 transition-colors font-semibold"
        >
          <AiFillFileExcel className="text-lg" />
          Download CSV
        </CSVLink>
      </div>
      <div className="form-control relative flex items-center max-w-md mx-auto mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{color: 'hsl(45, 43%, 58%)'}} />
        <input
          className="pl-10 pr-10 py-3 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2"
          style={{
            border: '1px solid hsl(45, 100%, 85%)',
            backgroundColor: 'white'
          }}
          onFocus={(e) => e.target.style.borderColor = 'hsl(45, 43%, 58%)'}
          onBlur={(e) => e.target.style.borderColor = 'hsl(45, 100%, 85%)'}
          type="text"
          value={searchQuery}
          onChange={handleChange}
          placeholder="Search By Name, Phone"
        />
        {searchQuery && (
          <span
            onClick={() => {
              setSearchQuery("");
              fetchUsers();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-lg hover:opacity-70 transition-opacity"
            style={{color: 'hsl(0, 60%, 50%)'}}
          >
            <FiX />
          </span>
        )}
      </div>
      {/* <div className="flex justify-end mb-4">
       
      </div> */}
      <div className="mt-6 rounded-2xl overflow-x-auto p-2 sm:p-4" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
        {loading ? (
          <div className="flex items-center justify-center m-auto py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#c3ad6b]"></div>
          </div>
        ) : userData && userData.length > 0 ? (
          <>
            {/* Card view for mobile */}
            <div className="block sm:hidden">
              <div className="grid grid-cols-1 gap-4">
                {userData?.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow p-4 flex flex-col border border-gray-100"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg" style={{backgroundColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)'}}>
                        {item.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-bold text-lg">{item.name}</div>
                        <div className="text-gray-500 text-sm">
                          {item.number}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm mb-2">
                      <div>
                        <span className="font-semibold">Start Date:</span>{" "}
                        {new Date(item.startDate).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-semibold">Rate Plan:</span>{" "}
                        {item.ratePlan}
                      </div>
                      <div>
                        <span className="font-semibold">Type:</span>{" "}
                        {item.foodType}
                      </div>
                      <div>
                        <span className="font-semibold">Advance:</span>{" "}
                        {item?.advance !== null && item?.advance !== undefined
                          ? item?.advance
                          : 0}
                      </div>
                      <div>
                        <span className="font-semibold">Total Amount:</span>{" "}
                        {item.total}
                      </div>
                      <div>
                        <span className="font-semibold">Status:</span>{" "}
                        {item.bookingStatus}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setEditingBooking(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1 text-white px-3 py-2 rounded shadow text-xs font-semibold transition-colors"
                        style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
                      >
                        <FiEdit /> Edit
                      </button>
                      <button
                        onClick={() => setViewingMenu(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600 transition-colors font-semibold px-3 py-2 text-xs"
                      >
                        <FiEye /> View Menu
                      </button>
                      <button
                        onClick={() => handleDeleteModal(item)}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors font-semibold px-3 py-2 text-xs"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Table view for desktop/tablet */}
            <div className="hidden sm:block">
              <table
                ref={tableRef}
                className="w-full table-auto text-sm text-left border-separate border-spacing-y-2"
              >
                <thead className="font-semibold sticky top-0 z-10" style={{backgroundColor: 'hsl(45, 43%, 58%)', color: 'white'}}>
                  <tr>
                    <th className="py-3 px-6 rounded-tl-xl">Name</th>
                    <th className="py-3 px-6">Number</th>
                    <th className="py-3 px-6">Booking Date</th>
                    <th className="py-3 px-6">Rate Plan</th>
                    <th className="py-3 px-6">Type</th>
                    <th className="py-3 px-6">Advance</th>
                    <th className="py-3 px-6">Total Amount</th>
                    <th className="py-3 px-6">Hall</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 rounded-tr-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {userData?.map((item, idx) => (
                    <tr
                      key={item._id}
                      className={
                        idx % 2 === 0
                          ? "bg-white hover:transition-colors"
                          : "hover:transition-colors"
                      }
                      style={{
                        backgroundColor: idx % 2 === 0 ? 'white' : 'hsl(45, 100%, 98%)'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 100%, 90%)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = idx % 2 === 0 ? 'white' : 'hsl(45, 100%, 98%)'}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-base" style={{backgroundColor: 'hsl(45, 100%, 85%)', color: 'hsl(45, 100%, 20%)'}}>
                          {item.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(item.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.ratePlan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.foodType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.advance}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.total || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.hall}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {item.bookingStatus}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                        <button
                          onClick={() => setEditingBooking(item)}
                          className="inline-flex items-center gap-1 text-white px-3 py-1.5 rounded shadow text-xs font-semibold transition-colors"
                          style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
                        >
                          <FiEdit /> Edit
                        </button>
                        <button
                          onClick={() => setViewingMenu(item)}
                          className="inline-flex items-center gap-1 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-600 transition-colors font-semibold px-3 py-1.5 text-xs"
                        >
                          <FiEye /> View Menu
                        </button>
                        <button
                          onClick={() => {
                            let raw = String(item.number || "").replace(
                              /[^\d]/g,
                              ""
                            );
                            raw = raw.replace(/^0+/, "");
                            let phoneNumber = "";
                            if (raw.length === 10) {
                              phoneNumber = `91${raw}`;
                            } else if (
                              raw.length === 12 &&
                              raw.startsWith("91")
                            ) {
                              phoneNumber = raw;
                            } else {
                              toast.error(
                                "Invalid phone number for WhatsApp. Must be 10 digits (India) or 12 digits with country code."
                              );
                              return;
                            }
                            const message =
                              `🌟 *Welcome to Hotal Buddha Avenue!* 🌟\n\n` +
                              `Here's your booking confirmation:\n\n` +
                              `📅 *Date:* ${new Date(
                                item.startDate
                              ).toLocaleDateString("en-IN", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}\n` +
                              `⏰ *Time:* ${item.time || "To be confirmed"}\n` +
                              `👨‍👩‍👧‍👦 *Guest Name:* ${item.name}\n` +
                              `📞 *Contact:* ${item.number}\n` +
                              `🍽️ *Plan:* ${item.ratePlan}\n` +
                              `🥗 *Food Type:* ${item.foodType}\n` +
                              `🏛️ *Hall/Area:* ${item.hall}\n` +
                              `📝 *Special Requests:* ${
                                item.specialRequests || "None"
                              }\n` +
                              `🔄 *Status:* ${item.bookingStatus}\n\n` +
                              `💵 *Estimated Total:* ₹${
                                item.total || "To be confirmed"
                              }\n\n` +
                              `📍 *Venue Address:* Medical Road ,Gorakhpur\n\n` +
                              `📌 *Important Notes:*\n` +
                              `- Please arrive 15 minutes before your booking time\n` +
                              `- 'Bring your ID proof for verification'\n\n` +
                              `Thank you for choosing us! We look forward to serving you. 🙏\n\n`;
                            const urls = [
                              `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
                                message
                              )}`,
                              `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(
                                message
                              )}`,
                              `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(
                                message
                              )}`,
                            ];

                            window.open(urls[0], "_blank");
                          }}
                          className="inline-flex items-center gap-1 bg-green-500 text-white rounded-lg shadow hover:bg-green-600 transition-colors font-semibold px-3 py-1.5 text-xs"
                          title="Send WhatsApp Message"
                        >
                          <FaWhatsapp />
                        </button>
                        <button
                          onClick={() => handleDeleteModal(item)}
                          className="inline-flex items-center gap-1 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors font-semibold px-3 py-1.5 text-xs"
                          title="Delete Booking"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center w-full m-auto">
            <svg
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-gray-300 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 17v-2a4 4 0 014-4h3m4 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h6a3 3 0 013 3v1"
              />
            </svg>
            <p className="font-semibold text-gray-400 text-lg">
              No Booking Found!
            </p>
          </div>
        )}
      </div>
      {renderPagination()}
      {/* MODAL */}
      {isDeleteModalOpen && productToDelete && (
        <>
          <div className="fixed z-50 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  {productToDelete == "delete-all" ? (
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete All Ros
                    </h3>
                  ) : (
                    <h3 className="text-lg font-medium text-gray-900">
                      Delete User
                    </h3>
                  )}

                  {productToDelete == "delete-all" ? (
                    <p>Are you sure you want to delete all ros ?</p>
                  ) : (
                    <p>Are you sure you want to delete the user?</p>
                  )}
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={confirmDelete}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Yes, Delete
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    No, Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit Booking Modal */}
      {editingBooking && (
        <EditBookingModal 
          booking={editingBooking} 
          onClose={() => setEditingBooking(null)}
          onSave={async (updatedData) => {
            try {
              const token = localStorage.getItem('token');
              await axios.put(`/api/bookings/update/${editingBooking._id}`, updatedData);
              toast.success('Booking updated successfully');
              setEditingBooking(null);
              fetchUsers();
            } catch (error) {
              console.error('Error updating booking:', error);
              toast.error('Failed to update booking');
            }
          }}
        />
      )}

      {/* View Menu Modal */}
      {viewingMenu && (
        <MenuViewModal 
          booking={viewingMenu} 
          onClose={() => setViewingMenu(null)}
        />
      )}
    </>
  );
};

export default ListBooking;
