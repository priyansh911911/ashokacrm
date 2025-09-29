import toast, { Toaster } from "react-hot-toast";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useRef, useState } from "react";

import { AiFillFileExcel } from "react-icons/ai";
import { CSVLink } from "react-csv";
import { FiSearch, FiX, FiPlus, FiEdit, FiEye, FiFileText } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
// import noimg from "../../assets/noimg.png";
import SlideToggle from "../toggle/SlideToggle";
import ChefPDFPreview from "../ChefPDFPreview";
const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};
const ListBooking = () => {
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

  const fetchUsers = () => {
    setLoading(true);
    try {
      axios
        .get(
          `https://ashoka-b.vercel.app/api/bookings/pg?page=${currentPage}`
        )
        .then((res) => {
          if (res.data) {
            const processedData = res.data.data.map((item) => ({
              ...item,
              advance: item.advance ?? 0,
              total: item.total ?? 0,
              balance: item.balance ?? 0,
            }));

            console.log(processedData);
            setUserData(processedData);
            setTotalPages(res.data.total);
            setLoading(false);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
  const fetchAllData = () => {
    try {
      axios
        .get(`https://ashoka-b.vercel.app/api/bookings`)
        .then((res) => {
          if (res.data) {
            console.log("All Data:", res.data);
            setAllData(res.data); // All record
          }
        })
        .catch((err) => {
          console.log("All Data Error:", err);
        });
    } catch (error) {
      console.log("All Data Try-Catch Error:", error);
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
      axios
        .delete(`https://ashoka-b.vercel.app/little/achiver/${id}`)
        .then((res) => {
          console.log(res);
          if (res.data) {
            fetchUsers();
          }
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response.data.message);
          setLoading(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.log(error);
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
        `https://ashoka-b.vercel.app/little/achiver/update-status/${id}`,
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
    const pageNumbers = [];
    const maxPagesToShow = 5; // Adjust this value to change the number of visible pages
    const maxPage = Math.ceil(totalPages / 10);

    for (let i = 1; i <= maxPage; i++) {
      pageNumbers.push(i);
    }

    let startPage;
    let endPage;

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
        startPage = currentPage - 2; // Adjust the number of pages to show before and after the current page
        endPage = currentPage + 2; // Adjust the number of pages to show before and after the current page
      }
    }

    const visiblePages = pageNumbers.slice(startPage - 1, endPage);
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === maxPage;

    return (
      <nav className="mt-12 flex justify-center">
        <ul className="join ">
          <li className="page-item">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className={`px-4 py-2 cursor-pointer rounded-md  mx-1 ${
                isFirstPage ? "disabled" : ""
              }`}
              disabled={isFirstPage}
            >
              Previous
            </button>
          </li>
          {visiblePages?.map((number) => (
            <li key={number} className="page-item">
              <button
                onClick={() => handlePageChange(number)}
                className={`${
                  currentPage === number ? "bg-gray-400 text-white" : ""
                } px-4 py-2 mx-1 rounded-md`}
              >
                {number}
              </button>
            </li>
          ))}
          <li className="page-item">
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className={`px-4 py-2 cursor-pointer mx-1 bg-black rounded-md text-white ${
                isLastPage ? "disabled" : ""
              }`}
              disabled={isLastPage}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  const handleSearch = () => {
    if (searchQuery != "") {
      setLoading(true);
      try {
        axios
          .get(
            `https://ashoka-b.vercel.app/api/bookings/search?q=${searchQuery}`
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
    <div className="min-h-screen" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
      <Toaster />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
            Booking List
          </h1>
          {isMobile && (
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c3ad6b]/10 text-[#c3ad6b] font-semibold text-sm shadow">
              {userRole === "Admin" ? "👑 Admin" : "👤 Staff"}
            </span>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-[#c3ad6b]/20 p-2 rounded-full">
                  <FiPlus className="text-[#c3ad6b] text-lg" />
                </div>
                <h2 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>
                  Manage Bookings
                </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={"/add-booking"}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow transition-colors font-semibold"
                  style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                >
                  <FiPlus className="text-lg" />
                  Add Booking
                </Link>
                <CSVLink
                  data={csvData}
                  headers={csvHeaders}
                  filename="Booking_Customer_Details.csv"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition-colors font-semibold"
                >
                  <AiFillFileExcel className="text-lg" />
                  Download CSV
                </CSVLink>
              </div>
            </div>
      <div className="form-control relative flex items-center max-w-md mx-auto mb-6">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        <input
          className="input input-bordered pl-10 pr-10 py-2 rounded-full w-full shadow-sm focus:ring-2 focus:ring-[#c3ad6b]"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-red-500 hover:text-red-700 text-lg"
          >
            <FiX />
          </span>
        )}
      </div>
      {/* <div className="flex justify-end mb-4">
       
      </div> */}
      <div className="mt-6 bg-gold/10 shadow-xl rounded-2xl overflow-x-auto p-2 sm:p-4">
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
                      <div className="w-10 h-10 bg-#c3ad6b rounded-full flex items-center justify-center text-black font-bold text-lg">
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
                      <Link
                        to={`/banquet/update-booking/${item._id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white px-3 py-2 rounded shadow text-xs font-semibold transition-colors"
                      >
                        <FiEdit /> Edit
                      </Link>
                      <Link to={`/banquet/menu-view/${item._id}`} className="flex-1">
                        <button className="w-full inline-flex items-center justify-center gap-1 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition-colors font-semibold px-3 py-2 text-xs">
                          <FiEye /> View Menu
                        </button>
                      </Link>
                    </div>
                    <div className="flex gap-2 mt-2">

                      <Link to={`/banquet/invoice/${item._id}`} className="flex-1">
                        <button className="w-full inline-flex items-center justify-center gap-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold px-3 py-2 text-xs">
                          <FiFileText /> Invoice
                        </button>
                      </Link>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <ChefPDFPreview booking={item} />
                      </div>
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
                <thead className="bg-gold text-black font-semibold sticky top-0 z-10">
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
                          ? "bg-gray-50 hover:bg-[#c3ad6b]/20 transition-colors"
                          : "bg-white hover:bg-[#c3ad6b]/20 transition-colors"
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-bold flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#c3ad6b]/20 rounded-full flex items-center justify-center text-[#c3ad6b] font-bold text-base">
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
                        <Link
                          to={`/banquet/update-booking/${item._id}`}
                          className="inline-flex items-center gap-1 bg-[#c3ad6b] hover:bg-[#b39b5a] text-white px-3 py-1.5 rounded shadow text-xs font-semibold transition-colors"
                        >
                          <FiEdit /> Edit
                        </Link>
                        <Link to={`/banquet/menu-view/${item._id}`}>
                          <button className="inline-flex items-center gap-1 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition-colors font-semibold px-3 py-1.5 text-xs">
                            <FiEye /> View Menu
                          </button>
                        </Link>

                        <Link to={`/banquet/invoice/${item._id}`}>
                          <button className="inline-flex items-center gap-1 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-semibold px-3 py-1.5 text-xs">
                            <FiFileText /> Invoice
                          </button>
                        </Link>
                        <ChefPDFPreview booking={item} />
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
                              `🌟 *Welcome to Hotal ASHOKA HOTEL!* 🌟\n\n` +
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
            {/* Pagination */}
            <div className="mt-6">
              <nav className="flex justify-center">
                <ul className="flex items-center space-x-2">
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        currentPage === 1 
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" 
                          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                      }`}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  
                  {(() => {
                    const maxPage = Math.ceil(totalPages / 10);
                    const pages = [];
                    for (let i = 1; i <= Math.min(maxPage, 5); i++) {
                      pages.push(
                        <li key={i}>
                          <button
                            onClick={() => handlePageChange(i)}
                            className={`px-4 py-2 rounded-md border transition-colors ${
                              currentPage === i
                                ? "bg-[#c3ad6b] text-white border-[#c3ad6b]"
                                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                            }`}
                          >
                            {i}
                          </button>
                        </li>
                      );
                    }
                    return pages;
                  })()}
                  
                  <li>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        currentPage === Math.ceil(totalPages / 10)
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                      }`}
                      disabled={currentPage === Math.ceil(totalPages / 10)}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default ListBooking;
