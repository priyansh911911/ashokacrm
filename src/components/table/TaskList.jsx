import React, { useState, useEffect } from "react";
import { Loader, Edit, Trash2 } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  // const [staffMembers, setStaffMembers] = useState([]);
  // const [editTask, setEditTask] = useState(null);
  // const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [staffMembers, setStaffMembers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const { axios } = useAppContext();

  const fetchTasks = async (bookingsData = bookings) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get("/api/housekeeping/tasks", config);

      const tasksArray = Array.isArray(response.data)
        ? response.data
        : response.data.tasks || [];

      const formattedTasks = tasksArray.map((task) => {
        const booking = bookingsData.find(b => b._id === task.bookingId);
        return {
          id: task._id,
          roomId: task.roomId,
          bookingId: task.bookingId,
          grcNo: task.grcNo || booking?.grcNo || booking?.guestRegistrationCardNo || 'No GRC',
          roomNumber: task.roomNumber || booking?.roomNumber || booking?.room_number || "Unknown",
          cleaningType: task.cleaningType || "standard",
          department: task.department || "Housekeeping",
          notes: task.notes || "",
          priority: task.priority || "medium",
          staff: task.assignedTo?.username || "Unassigned",
          status: task.status || "pending",
        };
      });

      setTasks(formattedTasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      throw err;
    }
  };

  const fetchStaffMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/housekeeping/available-staff", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.availableStaff) {
        setStaffMembers(response.data.availableStaff);
      }
    } catch (error) {
      console.error("Error fetching staff members:", error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/bookings/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookings(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchStaffMembers();
        const bookingsData = await fetchBookings();
        setBookings(bookingsData);
        await fetchTasks(bookingsData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.patch(
        `/api/housekeeping/tasks/${taskToEdit.id}/status`,
        { status: newStatus },
        config
      );

      // Update the task in the local state
      setTasks(
        tasks.map((task) =>
          task.id === taskToEdit.id ? { ...task, status: newStatus } : task
        )
      );

      setShowStatusModal(false);
    } catch (err) {
      console.error("Error updating task status:", err);
      alert("Failed to update task status");
    }
  };

  const handleEditStatus = (task) => {
    setTaskToEdit(task);
    setNewStatus(task.status);
    setShowStatusModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/housekeeping/tasks/${taskId}`, config);

      setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = filter === "all" || task.status === filter;
    const deptMatch =
      departmentFilter === "all" || task.department === departmentFilter;
    return statusMatch && deptMatch;
  });

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Filters */}
      <div className="flex p-4 border-b">
        <div className="mr-4">
          <label
            htmlFor="departmentFilter"
            className="mr-2 text-sm font-medium"
          >
            Department:
          </label>
          <select
            id="departmentFilter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border rounded px-3 py-1.5"
          >
            <option value="all">All Departments</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Laundry">Laundry</option>
          </select>
        </div>

        <div>
          <label htmlFor="statusFilter" className="mr-2 text-sm font-medium">
            Status:
          </label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-3 py-1.5"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader className="animate-spin mr-2" />
          <span>Loading tasks...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 p-8 text-center">{error}</div>
      ) : (
        /* Task Table */
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GRC Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cleaning Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    Room {task.roomNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.grcNo || 'No GRC'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {task.cleaningType || "Standard"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {task.department}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">
                    {task.notes || "No notes"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.priority === "high"
                          ? "bg-red-100 text-red-800"
                          : task.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <span>{task.staff}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : task.status === "in-progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {task.status === "pending"
                        ? "Pending"
                        : task.status === "in-progress"
                        ? "In Progress"
                        : "Completed"}
                    </span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditStatus(task)}
                        className="p-1 rounded-full text-blue-600 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded-full text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Task Modal */}
      {showStatusModal && taskToEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Update Task Status</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Room: {taskToEdit.roomNumber || "Unknown"}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                GRC: {taskToEdit.grcNo || 'No GRC'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Notes: {taskToEdit.notes || "No notes"}
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
