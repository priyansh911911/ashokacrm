import React, { useState, useEffect } from "react";
import { useAppContext } from "../../../context/AppContext";

const HousekeepingForm = ({
  onClose,
  onTaskAdded,
  editMode = false,
  currentTask = null,
}) => {
  const { axios } = useAppContext();
  const [housekeepingTask, setHousekeepingTask] = useState({
    roomId: "",
    grcNo: "",
    cleaningType: "daily",
    notes: "",
    priority: "medium",
    assignedTo: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (editMode && currentTask) {
      setHousekeepingTask({
        _id: currentTask._id,
        roomId: currentTask.roomId,
        cleaningType: currentTask.cleaningType || "daily",
        notes: currentTask.notes || "",
        priority: currentTask.priority || "medium",
        assignedTo: currentTask.assignedTo || "",
        status: currentTask.status || "pending",
      });
    }
  }, [editMode, currentTask]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data: roomsData } = await axios.get(
          "/api/rooms/all",
          config
        );
        setRooms(roomsData);

        const { data: bookingsData } = await axios.get(
          "/api/bookings/all",
          config
        );
        setBookings(bookingsData);

        const { data: staffData } = await axios.get(
          "/api/housekeeping/available-staff",
          config
        );
        console.log("Staff response:", staffData);

        if (
          staffData &&
          staffData.success &&
          Array.isArray(staffData.availableStaff)
        ) {
          setStaff(staffData.availableStaff);
        }

        if (editMode && currentTask?._id) {
          const { data: taskData } = await axios.get(
            `/api/housekeeping/tasks/${currentTask._id}`,
            config
          );

          setHousekeepingTask({
            _id: taskData._id,
            roomId: taskData.roomId,
            cleaningType: taskData.cleaningType || "daily",
            notes: taskData.notes || "",
            priority: taskData.priority || "medium",
            assignedTo: taskData.assignedTo || "",
            status: taskData.status || "pending",
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load form data");
      }
    };

    fetchData();
  }, [editMode, currentTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHousekeepingTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    console.log("HousekeepingForm mounted with props:", {
      editMode,
      currentTask,
    });

    if (editMode && currentTask) {
      console.log("Current task data:", currentTask);
    }
  }, []);

  useEffect(() => {
    console.log("Rooms loaded:", rooms);
    console.log("Bookings loaded:", bookings);
    console.log("Staff loaded:", staff);
    console.log("Current housekeepingTask state:", housekeepingTask);
  }, [rooms, bookings, staff, housekeepingTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const selectedRoom = rooms.find(
        (room) => room._id === housekeepingTask.roomId
      );
      const booking = bookings.find(b => 
        (b.grcNo || b.guestRegistrationCardNo) === housekeepingTask.grcNo
      );

      const taskData = {
        roomId: housekeepingTask.roomId,
        bookingId: booking?._id,
        roomNumber: selectedRoom?.room_number || booking?.roomNumber || booking?.room_number,
        grcNo: housekeepingTask.grcNo,
        cleaningType: housekeepingTask.cleaningType,
        priority: housekeepingTask.priority,
        notes: housekeepingTask.notes,
        assignedTo: housekeepingTask.assignedTo || undefined,
        status: housekeepingTask.status || "pending",
      };

      let response;

      if (editMode && housekeepingTask._id) {
        const { data } = await axios.put(
          `/api/housekeeping/tasks/${housekeepingTask._id}`,
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onTaskAdded(data);
      } else {
        const { data } = await axios.post(
          "/api/housekeeping/tasks",
          taskData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        onTaskAdded(data);
      }
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
      setError(error.response?.data?.error || "Failed to save task");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {editMode ? "Edit Housekeeping Task" : "Add Housekeeping Task"}
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room
            </label>
            <select
              name="roomId"
              value={housekeepingTask.roomId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Room</option>
              {rooms.map((room) => (
                <option key={room._id} value={room._id}>
                  Room {room.room_number}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GRC Number
            </label>
            <select
              name="grcNo"
              value={housekeepingTask.grcNo || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select GRC</option>
              {bookings.map((booking) => (
                <option key={booking._id} value={booking.grcNo || booking.guestRegistrationCardNo}>
                  {booking.grcNo || booking.guestRegistrationCardNo} - Room {booking.roomNumber || booking.room_number}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cleaning Type
            </label>
            <select
              name="cleaningType"
              value={housekeepingTask.cleaningType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="daily">Daily Cleaning</option>
              <option value="checkout">Checkout Cleaning</option>
              <option value="standard">Standard Cleaning</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={housekeepingTask.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              placeholder="Add any special instructions here"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={housekeepingTask.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              name="assignedTo"
              value={housekeepingTask.assignedTo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select Staff</option>
              {staff && staff.length > 0 ? (
                staff.map((person) => (
                  <option key={person._id} value={person._id}>
                    {person.username}
                  </option>
                ))
              ) : (
                <option value="default-staff">No staff available</option>
              )}
            </select>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              {loading ? "Saving..." : "Save Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HousekeepingForm;
