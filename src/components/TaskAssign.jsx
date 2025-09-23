import React, { useState } from "react";
import {
  ClipboardList,
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import {
  departments,
  staffMembers,
  initialTasks,
} from "../components/dashboardData.js";
// In TaskAssign.jsx, at the top of the file:
import TaskList from "../components/table/TaskList";
import HousekeepingCard from "../components/taskcard/housekeeping/HousekeepingCard.jsx";
// import LaundryCard from "../components/taskcard/laundry/LaundryCard.jsx";
// import MaintenanceCard from "../components/taskcard/MaintenanceCard.jsx";
// import RoomServiceCard from "../components/taskcard/RoomServiceCard.jsx";
// import ReceptionCard from "../components/taskcard/ReceptionCard.jsx";

import HousekeepingForm from "../components/taskcard/housekeeping/HousekeepingForm.jsx";

const TaskAssign = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [showHousekeepingForm, setShowHousekeepingForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    department: "",
    staff: "",
    priority: "medium",
  });

  const departmentTaskCounts = {
    Housekeeping: tasks.filter((t) => t.department === "Housekeeping").length,
    Laundry: tasks.filter((t) => t.department === "Laundry").length,
  };
  const handleTaskAdded = (newTask) => {
    // Format the new task to match the structure expected in the task list
    const formattedTask = {
      id: newTask._id,
      title: newTask.title || `Task ${newTask._id?.slice(-4) || "New"}`,
      roomId: newTask.roomId,
      roomNumber: newTask.roomNumber || "Unknown",
      department: newTask.department || "Housekeeping",
      staff: newTask.assignedTo?.username || "Unassigned",
      priority: newTask.priority || "medium",
      status: newTask.status || "pending",
    };

    // Add the new task to the existing tasks
    setTasks((prevTasks) => [...prevTasks, formattedTask]);
  };

  // const openAddTaskModal = (department) => {
  //   setSelectedDepartment(department);
  //   setNewTask({
  //     ...newTask,
  //     department: department,
  //   });
  //   setShowAddModal(true);
  // };

  // Add this function to your TaskAssign component
  const handleStatusChange = (taskId, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  // Also add the handleDeleteTask function if it's missing
  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  // Rest of your component code...

  return (
    <div className="p-6 overflow-auto h-full bg-background">
      <div className="flex justify-between items-center mb-8 mt-6">
        <h1 className="text-3xl font-extrabold text-[#1f2937]">
          Task Assignment
        </h1>
      </div>

      {/* Status Summary */}
      {/* ... */}

      {/* Department Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        <HousekeepingCard
          taskCount={departmentTaskCounts["Housekeeping"]}
          onClick={() => setShowHousekeepingForm(true)}
        />
        {showHousekeepingForm && (
          <HousekeepingForm
            onClose={() => setShowHousekeepingForm(false)}
            onTaskAdded={handleTaskAdded}
          />
        )}
        {/* <LaundryCard
          taskCount={departmentTaskCounts["Laundry"]}
          onClick={() => openAddTaskModal("Laundry")}
        /> */}
        {/* <MaintenanceCard
          taskCount={departmentTaskCounts["Maintenance"]}
          onClick={() => openAddTaskModal("Maintenance")}
        />
        <RoomServiceCard
          taskCount={departmentTaskCounts["Room Service"]}
          onClick={() => openAddTaskModal("Room Service")}
        />
        <ReceptionCard
          taskCount={departmentTaskCounts["Reception"]}
          onClick={() => openAddTaskModal("Reception")}
        /> */}
      </div>

      {/* Task List Component */}
      <TaskList
        tasks={tasks}
        filter={filter}
        setFilter={setFilter}
        handleStatusChange={handleStatusChange}
        handleDeleteTask={handleDeleteTask}
      />

      {/* Add Task Modal */}
      {/* ... */}
    </div>
  );
};

export default TaskAssign;
