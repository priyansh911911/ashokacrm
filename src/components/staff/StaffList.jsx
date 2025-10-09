import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { showToast } from "../../utils/toaster";
import StaffForm from "../staff/StaffForm";
import Pagination from "../common/Pagination";
import DashboardLoader from "../DashboardLoader";

const StaffList = () => {
  const { axios } = useAppContext();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({
    _id: null,
    email: "",
    username: "",
    password: "",
    role: "staff",
    department: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      console.log('=== ALL API CALLS ===');
      console.log('1. GET /api/auth/all-users (filtering by role)');
      console.log('2. POST /api/auth/register (for adding staff)');
      console.log('3. PUT /api/auth/update/:id (for updating staff)');
      console.log('4. DELETE /api/auth/delete/:id (for deleting staff)');
      console.log('Base URL:', import.meta.env.VITE_BACKEND_URL);
      console.log('Token present:', !!token);
      console.log('==================');
      
      const { data } = await axios.get(
        "/api/auth/all-users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('=== STAFF API RESPONSE ===');
      console.log('Raw API Response:', data);
      console.log('Response Type:', typeof data);
      console.log('Is Array:', Array.isArray(data));
      
      let allUsers = [];
      if (Array.isArray(data)) {
        allUsers = data;
      } else if (data && data.users && Array.isArray(data.users)) {
        allUsers = data.users;
      } else if (data && data.data && Array.isArray(data.data)) {
        allUsers = data.data;
      }
      
      // Filter users to show only staff role
      const staffUsers = allUsers.filter(user => 
        user.role === 'staff'
      );
      
      console.log('All users count:', allUsers.length);
      console.log('Filtered staff count:', staffUsers.length);
      console.log('Staff users:', staffUsers);
      
      setStaff(staffUsers);
      setFilteredStaff(staffUsers);
      console.log('========================');

      setError(null);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000);
    fetchStaff();
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <DashboardLoader pageName="Staff Management" />;
  }

  const handleAddStaff = () => {
    setEditMode(false);
    setCurrentStaff({
      _id: null,
      email: "",
      username: "",
      password: "",
      role: "",
      department: [],
    });
    setShowModal(true);
  };

  const handleEditStaff = (staffMember) => {
    setEditMode(true);
    setCurrentStaff({
      _id: staffMember._id,
      email: staffMember.email,
      username: staffMember.username,
      password: "",
      role: staffMember.role,
      department: staffMember.department,
    });
    setShowModal(true);
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await axios.delete(`/api/auth/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        });
        setStaff(staff.filter((staffMember) => staffMember._id !== id));
        showToast.success("Staff member deleted successfully");
      } catch (err) {
        console.error("Error deleting staff:", err);
        showToast.error("Failed to delete staff member");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const staffData = { ...currentStaff };
      const config = {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      };

      if (editMode) {
        if (!staffData.password) {
          delete staffData.password;
        }

        const { data } = await axios.put(
          `/api/auth/update/${currentStaff._id}`,
          staffData,
          config
        );
        setStaff(
          staff.map((s) => (s._id === currentStaff._id ? data : s))
        );
        showToast.success("Staff member updated successfully");
      } else {
        if (staffData.role === "staff" && staffData.department.length === 0) {
          showToast.error("Please select a department for staff member");
          return;
        }

        if (staffData.role === "admin") {
          staffData.department = [];
        }

        const { data } = await axios.post(
          "/api/auth/register",
          staffData,
          config
        );

        if (data) {
          setStaff([...staff, data]);
          showToast.success("Staff member added successfully");
        }
      }

      setShowModal(false);
    } catch (err) {
      console.error("Error saving staff:", err);
      showToast.error(err.response?.data?.message || "Failed to save staff member");
    }
  };

  const getDepartmentName = (departments) => {
    if (!departments) return "None";
    
    // Handle different department formats
    let deptArray = [];
    
    if (Array.isArray(departments)) {
      deptArray = departments;
    } else if (typeof departments === 'string') {
      // Handle comma-separated string
      deptArray = departments.split(',').map(d => ({ name: d.trim() }));
    } else if (departments.name) {
      // Single department object
      deptArray = [departments];
    }
    
    if (deptArray.length === 0) return "None";
    
    const validDepartments = ['kitchen', 'laundry', 'reception', 'maintenance'];
    
    return deptArray
      .map((dept) => {
        const deptName = (dept.name || dept).toLowerCase();
        if (validDepartments.includes(deptName)) {
          return deptName.charAt(0).toUpperCase() + deptName.slice(1);
        }
        return null;
      })
      .filter(Boolean)
      .join(", ") || "None";
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query) {
      setFilteredStaff(staff);
    } else {
      const filtered = staff.filter(staffMember => 
        (staffMember.username || '').toLowerCase().includes(query) ||
        (staffMember.email || '').toLowerCase().includes(query) ||
        (staffMember.role || '').toLowerCase().includes(query) ||
        getDepartmentName(staffMember.department).toLowerCase().includes(query)
      );
      setFilteredStaff(filtered);
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = filteredStaff.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1f2937]">Staff</h1>
        <button
          onClick={handleAddStaff}
          className="bg-secondary text-dark px-3 sm:px-4 py-2 cursor-pointer rounded-lg hover:shadow-lg transition-shadow font-medium w-full sm:w-auto text-sm sm:text-base"
        >
          <Plus size={16} className="w-4 h-4 inline mr-1 sm:mr-2" /> Add Staff
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search staff by username, email, role, or department..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm sm:text-base">Loading staff...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 text-sm sm:text-base">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Password
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Department
                  </th>
                  <th className="px-2 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStaff.map((staffMember) => {
                  console.log('Rendering staff member:', staffMember);
                  return (
                  <tr key={staffMember._id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full bg-primary text-white flex items-center justify-center mr-2 sm:mr-3 text-xs sm:text-sm lg:text-base">
                          {staffMember.username
                            ? staffMember.username.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-xs sm:text-sm lg:text-base truncate">
                            {staffMember.username || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden truncate">
                            {staffMember.email}
                          </div>
                          <div className="text-xs text-gray-500 lg:hidden truncate">
                            {getDepartmentName(staffMember.department)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm lg:text-base hidden sm:table-cell">
                      <div className="truncate max-w-32 sm:max-w-48">{staffMember.email}</div>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm lg:text-base hidden md:table-cell">
                      {staffMember.password ? "••••••••" : "N/A"}
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap capitalize text-xs sm:text-sm lg:text-base">
                      {staffMember.role}
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm lg:text-base hidden lg:table-cell">
                      <div className="truncate max-w-32">
                        {staffMember.role === "admin"
                          ? "N/A"
                          : staffMember.department &&
                            staffMember.department.length > 0
                          ? staffMember.department
                              .map(
                                (dept) =>
                                  dept.name.charAt(0).toUpperCase() +
                                  dept.name.slice(1)
                              )
                              .join(", ")
                          : "None"}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleEditStaff(staffMember)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember._id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {paginatedStaff.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-500 text-xs sm:text-sm lg:text-base"
                    >
                      No staff found.
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
            totalItems={filteredStaff.length}
          />
        </div>
      )}

      <StaffForm
        showModal={showModal}
        setShowModal={setShowModal}
        currentStaff={currentStaff}
        setCurrentStaff={setCurrentStaff}
        handleSubmit={handleSubmit}
        editMode={editMode}
      />
    </div>
  );
};

export default StaffList;