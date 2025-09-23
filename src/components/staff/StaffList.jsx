import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import { showToast } from "../../utils/toaster";
import StaffForm from "../staff/StaffForm";
import Pagination from "../common/Pagination";

const StaffList = () => {
  const { axios } = useAppContext();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Add this after your useState declarations
  useEffect(() => {
    // Use dummy data if API fails
    const dummyStaff = [
      {
        _id: "1",
        username: "admin123",
        email: "admin@example.com",
        role: "admin",
        department: [],
      },
      {
        _id: "2",
        username: "kitchen1",
        email: "kitchen@example.com",
        role: "staff",
        department: [{ id: 1, name: "kitchen" }],
      },
      {
        _id: "3",
        username: "maintenance1",
        email: "maintenance@example.com",
        role: "staff",
        department: [
          { id: 4, name: "maintenance" },
          { id: 5, name: "other" },
        ],
      },
      {
        _id: "4",
        username: "reception1",
        email: "reception@example.com",
        role: "staff",
        department: [{ id: 3, name: "reception" }],
      },
    ];

    // Try to fetch from API first
    fetchStaff().catch(() => {
      // If API fails, use dummy data
      setStaff(dummyStaff);
      setLoading(false);
    });
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        "/api/housekeeping/available-staff",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the response has the expected structure
      if (data && data.availableStaff) {
        setStaff(data.availableStaff);
      } else {
        setStaff(data || []);
      }

      setError(null);
    } catch (err) {
      console.error("Error fetching staff:", err);
      setError("Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditMode(false);
    setCurrentStaff({
      _id: null,
      email: "",
      username: "",
      password: "",
      role: "", // Set to empty string instead of "staff"
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
        // If password is empty, remove it from the request
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
        // Make sure department is properly formatted for staff role
        if (staffData.role === "staff" && staffData.department.length === 0) {
          showToast.error("Please select a department for staff member");
          return;
        }

        // For admin role, ensure department is an empty array
        if (staffData.role === "admin") {
          staffData.department = [];
        }

        const { data } = await axios.post(
          "/api/auth/register",
          staffData,
          config
        );

        // Add the new staff member to the list
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
    if (!departments || departments.length === 0) return "None";
    return departments
      .map((dept) => dept.name.charAt(0).toUpperCase() + dept.name.slice(1))
      .join(", ");
  };

  const totalPages = Math.ceil(staff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStaff = staff.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 mt-4 sm:mt-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">Staff</h1>
        <button
          onClick={handleAddStaff}
          className="bg-secondary text-dark px-4 py-2 cursor-pointer rounded-lg hover:shadow-lg transition-shadow font-medium w-full sm:w-auto"
        >
          <Plus size={18} className="w-4 h-4 inline mr-2" /> Add Staff
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading staff...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">{error}</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Email
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Password
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Department
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedStaff.map((staffMember) => (
                  <tr key={staffMember._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center mr-2 sm:mr-3 text-sm sm:text-base">
                          {staffMember.username
                            ? staffMember.username.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div>
                          <div className="font-medium text-sm sm:text-base">
                            {staffMember.username || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {staffMember.email}
                          </div>
                          <div className="text-xs text-gray-500 lg:hidden">
                            {getDepartmentName(staffMember.department)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base hidden sm:table-cell">
                      {staffMember.email}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base hidden md:table-cell">
                      {staffMember.password ? "••••••••" : "N/A"}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap capitalize text-sm sm:text-base">
                      {staffMember.role}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm sm:text-base hidden lg:table-cell">
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
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEditStaff(staffMember)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 sm:p-2"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staffMember._id)}
                          className="text-red-600 hover:text-red-900 p-1 sm:p-2"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedStaff.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-3 sm:px-6 py-8 text-center text-gray-500 text-sm sm:text-base"
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
            totalItems={staff.length}
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
