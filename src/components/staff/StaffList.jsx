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
    restaurantRole: "",
    validId: "",
    idNumber: "",
    phoneNumber: "",
    photo: "",
    bankDetails: {
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      accountHolderName: ""
    },
    salaryDetails: {
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      netSalary: 0
    }
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
      
      // Use same endpoint as Users.jsx with fallback handling
      let endpoint = `/api/auth/all-users`;
      
      const fallbackEndpoints = [
        `/api/users`,
        `/api/auth/users`,
        `/api/search/universal?query=&type=users`,
        `/api/search/field?model=users&field=role&value=staff`
      ];
      
      let response;
      try {
        response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        if (error.response?.status === 403) {
          // Try fallback endpoints
          for (const fallback of fallbackEndpoints) {
            try {
              response = await axios.get(fallback, {
                headers: { Authorization: `Bearer ${token}` }
              });
              break;
            } catch (fallbackError) {
              console.log(`Fallback ${fallback} failed:`, fallbackError.response?.status);
            }
          }
        }
        if (!response) throw error;
      }
      
      // Handle different response structures (same as Users.jsx)
      let allUsers = [];
      if (Array.isArray(response.data)) {
        allUsers = response.data;
      } else if (response.data.users && Array.isArray(response.data.users)) {
        allUsers = response.data.users;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        allUsers = response.data.data;
      }
      
      // Show all users instead of filtering by staff role
      setStaff(allUsers);
      setFilteredStaff(allUsers);
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
      restaurantRole: "",
      validId: "",
      idNumber: "",
      phoneNumber: "",
      photo: "",
      bankDetails: {},
      salaryDetails: {}
    });
    setShowModal(true);
  };

  const handleEditStaff = (staffMember) => {
    console.log('Editing staff member:', staffMember);
    setEditMode(true);
    setCurrentStaff({
      _id: staffMember._id,
      email: staffMember.email || "",
      username: staffMember.username || "",
      password: "",
      role: staffMember.role || "",
      department: staffMember.department || [],
      restaurantRole: staffMember.restaurantRole || "",
      validId: staffMember.validId || "",
      idNumber: staffMember.idNumber || "",
      phoneNumber: staffMember.phoneNumber || "",
      dateOfJoining: staffMember.dateOfJoining ? new Date(staffMember.dateOfJoining).toISOString().split('T')[0] : "",
      photo: staffMember.photo || "",
      bankDetails: {
        accountNumber: staffMember.bankDetails?.accountNumber || "",
        ifscCode: staffMember.bankDetails?.ifscCode || "",
        bankName: staffMember.bankDetails?.bankName || "",
        accountHolderName: staffMember.bankDetails?.accountHolderName || ""
      },
      salaryDetails: {
        basicSalary: staffMember.salaryDetails?.basicSalary || 0,
        allowances: staffMember.salaryDetails?.allowances || 0,
        deductions: staffMember.salaryDetails?.deductions || 0,
        netSalary: staffMember.salaryDetails?.netSalary || 0
      }
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

    // Validate required fields
    if (!currentStaff.username || !currentStaff.email || !currentStaff.password || !currentStaff.role) {
      showToast.error('Please fill in all required fields: Username, Email, Password, and Role');
      return;
    }

    try {
      // Prepare data in the correct format for the backend - start with required fields only
      const staffData = {
        username: currentStaff.username.trim(),
        email: currentStaff.email.trim(),
        password: currentStaff.password,
        role: currentStaff.role,
        department: currentStaff.department || []
      };
      
      // Add restaurantRole if role is restaurant
      if (currentStaff.role === 'restaurant' && currentStaff.restaurantRole) {
        staffData.restaurantRole = currentStaff.restaurantRole;
      }
      
      // Add optional fields only if they have values
      if (currentStaff.validId) {
        staffData.validId = currentStaff.validId;
      }
      if (currentStaff.idNumber) {
        staffData.idNumber = currentStaff.idNumber;
      }
      if (currentStaff.phoneNumber) {
        staffData.phoneNumber = currentStaff.phoneNumber;
      }
      if (currentStaff.dateOfJoining) {
        staffData.dateOfJoining = currentStaff.dateOfJoining;
      }
      if (currentStaff.photo) {
        staffData.photo = currentStaff.photo;
      }
      
      // Add bank details if any field is filled
      if (currentStaff.bankDetails && Object.values(currentStaff.bankDetails).some(val => val)) {
        staffData.bankDetails = {};
        if (currentStaff.bankDetails.accountNumber) staffData.bankDetails.accountNumber = currentStaff.bankDetails.accountNumber;
        if (currentStaff.bankDetails.ifscCode) staffData.bankDetails.ifscCode = currentStaff.bankDetails.ifscCode;
        if (currentStaff.bankDetails.bankName) staffData.bankDetails.bankName = currentStaff.bankDetails.bankName;
        if (currentStaff.bankDetails.accountHolderName) staffData.bankDetails.accountHolderName = currentStaff.bankDetails.accountHolderName;
      }
      
      // Add salary details if any field is filled
      if (currentStaff.salaryDetails && (currentStaff.salaryDetails.basicSalary || currentStaff.salaryDetails.allowances || currentStaff.salaryDetails.deductions)) {
        staffData.salaryDetails = {
          basicSalary: currentStaff.salaryDetails.basicSalary || 0,
          allowances: currentStaff.salaryDetails.allowances || 0,
          deductions: currentStaff.salaryDetails.deductions || 0,
          netSalary: (currentStaff.salaryDetails.basicSalary || 0) + (currentStaff.salaryDetails.allowances || 0) - (currentStaff.salaryDetails.deductions || 0)
        };
      }
      
      console.log('Staff data being sent:', staffData);
      
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
        setFilteredStaff(
          filteredStaff.map((s) => (s._id === currentStaff._id ? data : s))
        );
        showToast.success("Staff member updated successfully");
      } else {
        if (staffData.role === "staff" && (!staffData.department || staffData.department.length === 0)) {
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
          setFilteredStaff([...filteredStaff, data]);
          showToast.success("Staff member added successfully");
        }
      }

      setShowModal(false);
    } catch (err) {
      console.error("Error saving staff:", err);
      console.error("Error response:", err.response?.data);
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
    
    const validDepartments = ['kitchen', 'laundry', 'reception', 'maintenance', 'housekeeping', 'accounts', 'pantry'];
    
    return deptArray
      .map((dept) => {
        const deptName = (dept.name || dept).toLowerCase();
        if (validDepartments.includes(deptName)) {
          return deptName.charAt(0).toUpperCase() + deptName.slice(1);
        }
        // If not in valid list, still show it
        return typeof dept === 'string' ? dept.charAt(0).toUpperCase() + dept.slice(1) : 
               dept.name ? dept.name.charAt(0).toUpperCase() + dept.name.slice(1) : null;
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
        (staffMember.phoneNumber || '').toLowerCase().includes(query) ||
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
          placeholder="Search staff by username, email, role, phone, or department..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading staff...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
          <button 
            onClick={fetchStaff}
            className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact & ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Joining
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedStaff.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        {searchQuery ? 'No staff found matching your search.' : 'No staff members found.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedStaff.map((staffMember) => (
                      <tr key={staffMember._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {staffMember.photo ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={staffMember.photo}
                                  alt={staffMember.username}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className={`h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center ${staffMember.photo ? 'hidden' : 'flex'}`}
                              >
                                <User className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {staffMember.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {staffMember.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                Role: {staffMember.role}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {staffMember.phoneNumber || 'No phone'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {staffMember.validId ? (
                              <>
                                {staffMember.validId.replace('_', ' ').toUpperCase()}
                                {staffMember.idNumber && (
                                  <div className="text-xs text-gray-400">
                                    {staffMember.idNumber}
                                  </div>
                                )}
                              </>
                            ) : (
                              'ID: Not provided'
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getDepartmentName(staffMember.department)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {staffMember.dateOfJoining ? new Date(staffMember.dateOfJoining).toLocaleDateString() : 'Not set'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            ₹{staffMember.salaryDetails?.netSalary || staffMember.salaryDetails?.basicSalary || 'Not set'}
                          </div>
                          {staffMember.salaryDetails?.basicSalary && (
                            <div className="text-xs text-gray-500">
                              Basic: ₹{staffMember.salaryDetails.basicSalary}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditStaff(staffMember)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                              title="Edit staff"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(staffMember._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete staff"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
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
