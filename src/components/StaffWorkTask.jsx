// src/components/StaffWorkTask.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import Webcam from "react-webcam";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Home,
  Filter,
  Camera,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const StaffWorkTask = () => {
  const { axios } = useAppContext();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedTask, setExpandedTask] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadType, setUploadType] = useState("before");
  const [uploading, setUploading] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const fetchUserTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const currentUsername = localStorage.getItem("username");

      const { data } = await axios.get(
        "/api/housekeeping/tasks",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success && Array.isArray(data.tasks)) {
        const userTasks = data.tasks.filter(
          (task) => task.assignedTo && task.assignedTo.username === currentUsername
        );
        setTasks(userTasks);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError("Failed to load your tasks");
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    setActionLoading(taskId);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/housekeeping/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error("Error updating task status:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const startTask = async (taskId) => {
    await updateTaskStatus(taskId, "in-progress");
    setExpandedTask(taskId);
  };

  const completeTask = async (taskId) => {
    await updateTaskStatus(taskId, "completed");
    setExpandedTask(null);
  };

  const handleFileUpload = async (e, taskId, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const filename = `${taskId}_${type}_${Date.now()}_${file.name}`;
      const fileRef = ref(storage, `staff-work/photos/${filename}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      await updateTaskImage(taskId, type, url);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const captureWebcam = () => {
    const imgSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imgSrc);
    setShowWebcam(false);
  };

  const uploadCapturedImage = async () => {
    if (!capturedImage || !currentTaskId) return;
    setUploading(true);
    try {
      const blob = await fetch(capturedImage).then((res) => res.blob());
      const filename = `${currentTaskId}_${uploadType}_${Date.now()}.jpg`;
      const imageRef = ref(storage, `staff-work/photos/${filename}`);
      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);
      await updateTaskImage(currentTaskId, uploadType, url);
      setCapturedImage(null);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const updateTaskImage = async (taskId, type, imageUrl) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/housekeeping/tasks/${taskId}/images/${type}`,
        { imageUrls: [imageUrl] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Image upload response:', response.data);
      
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? {
                ...task,
                images: { ...task.images, [type]: [imageUrl] },
              }
            : task
        )
      );
    } catch (err) {
      console.error('Image upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload image');
    }
  };

  const addIssue = async () => {
    if (!issueText.trim() || !currentTaskId) return;

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/housekeeping/tasks/${currentTaskId}/issues`,
        { issue: issueText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Add issue response:', response.data);
      
      setTasks((prev) =>
        prev.map((task) =>
          task._id === currentTaskId
            ? {
                ...task,
                issues: [
                  ...(task.issues || []),
                  { description: issueText, resolved: false },
                ],
              }
            : task
        )
      );

      setIssueText("");
      setShowIssueModal(false);
    } catch (err) {
      console.error("Failed to add issue", err);
      setError(err.response?.data?.message || 'Failed to add issue');
    }
  };

  const filteredTasks = tasks.filter((task) =>
    filter === "all" ? true : task.status === filter
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-secondary text-text";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-primary text-text";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-accent text-text";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8 bg-background min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <span className="text-lg text-text">Loading your tasks...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-extrabold text-text">My Assigned Tasks</h1>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-text/70" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-border px-4 py-2 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-colors hover:shadow-md"
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-primary to-secondary">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Room
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Type
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Priority
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Images
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-text">
                Actions
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-text">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTasks.map((task) => (
              <React.Fragment key={task._id}>
                <tr
                  className={`transition-colors ${
                    hoveredRow === task._id
                      ? "bg-primary/10"
                      : "hover:bg-background/50"
                  } ${
                    expandedTask === task._id
                      ? "bg-primary/5 border-l-4 border-primary"
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredRow(task._id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div
                        className={`p-1 rounded-full mr-2 transition-colors ${
                          hoveredRow === task._id
                            ? "bg-primary/20"
                            : "bg-primary/10"
                        }`}
                      >
                        <Home className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-text">
                        Room {task.roomId?.room_number || "N/A"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-text/80">
                    {task.cleaningType || "Standard"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-colors hover:shadow-md ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority?.toUpperCase() || "MEDIUM"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={`flex items-center px-3 py-1 rounded-full transition-colors ${getStatusBadge(
                        task.status
                      )}`}
                    >
                      {getStatusIcon(task.status)}
                      <span className="ml-1 capitalize text-xs font-semibold">
                        {task.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="text-center group">
                        {task.images?.before?.[0] ? (
                          <img
                            src={task.images.before[0]}
                            alt="Before"
                            className="w-12 h-12 object-cover rounded-lg border-2 border-border shadow-sm group-hover:shadow-md transition-colors cursor-pointer"
                            onClick={() =>
                              window.open(task.images.before[0], "_blank")
                            }
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No</span>
                          </div>
                        )}
                        <p className="text-xs text-text/60 mt-1">Before</p>
                      </div>
                      <div className="text-center group">
                        {task.images?.after?.[0] ? (
                          <img
                            src={task.images.after[0]}
                            alt="After"
                            className="w-12 h-12 object-cover rounded-lg border-2 border-border shadow-sm group-hover:shadow-md transition-colors cursor-pointer"
                            onClick={() =>
                              window.open(task.images.after[0], "_blank")
                            }
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <span className="text-xs text-gray-400">No</span>
                          </div>
                        )}
                        <p className="text-xs text-text/60 mt-1">After</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {task.status === "pending" && (
                        <button
                          onClick={() => startTask(task._id)}
                          disabled={actionLoading === task._id}
                          className="px-3 py-1.5 bg-primary hover:bg-hover text-text text-xs font-semibold rounded-md transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === task._id ? (
                            <div className="w-3 h-3 border border-text border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Start"
                          )}
                        </button>
                      )}
                      {task.status === "in-progress" && (
                        <button
                          onClick={() => completeTask(task._id)}
                          disabled={actionLoading === task._id}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-md transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading === task._id ? (
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            "Complete"
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setCurrentTaskId(task._id);
                          setShowIssueModal(true);
                        }}
                        className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors shadow-sm hover:shadow-md"
                        title="Report Issue"
                      >
                        <AlertCircle className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        setExpandedTask(
                          expandedTask === task._id ? null : task._id
                        )
                      }
                      className={`p-2 rounded-full transition-colors ${
                        expandedTask === task._id
                          ? "bg-primary text-white shadow-md"
                          : "text-primary hover:bg-primary/10 hover:text-hover"
                      }`}
                      title={
                        expandedTask === task._id
                          ? "Hide details"
                          : "Show details"
                      }
                    >
                      {expandedTask === task._id ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedTask === task._id && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-6 bg-gradient-to-r from-background/50 to-background/30 border-t border-primary/20"
                    >
                      <div className="space-y-4 max-w-4xl">
                        {/* Notes & Issues */}
                        {/* <div className="bg-white p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-colors">
                          <h4 className="font-semibold text-text mb-3 flex items-center">
                            <div className="w-1 h-4 bg-primary rounded mr-2"></div>
                            Notes & Issues
                          </h4>
                          {task.notes && (
                            <p className="text-sm text-text/80 mb-2 p-2 bg-background/50 rounded">
                              {task.notes}
                            </p>
                          )}
                          {task.issues && task.issues.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-red-600 mb-2">
                                Issues:
                              </p>
                              {task.issues.map((issue, index) => (
                                <p
                                  key={index}
                                  className="text-xs text-red-500 bg-red-50 p-2 rounded mb-1 border-l-2 border-red-200"
                                >
                                  {typeof issue === "string"
                                    ? issue
                                    : issue.description}
                                </p>
                              ))}
                            </div>
                          )}
                        </div> */}

                        {/* Image Upload Section */}
                        <div className="bg-white p-4 rounded-lg border border-border shadow-sm hover:shadow-md transition-colors">
                          <h4 className="font-semibold mb-3 text-text flex items-center">
                            <div className="w-1 h-4 bg-primary rounded mr-2"></div>
                            Upload Photo
                          </h4>

                          {/* Upload Type Selector */}
                          <div className="flex space-x-2 mb-4">
                            <button
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                uploadType === "before"
                                  ? "bg-primary text-text shadow-md"
                                  : "bg-white border border-border text-text/70 hover:bg-background hover:shadow-sm"
                              }`}
                              onClick={() => setUploadType("before")}
                            >
                              Before
                            </button>
                            <button
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                uploadType === "after"
                                  ? "bg-primary text-text shadow-md"
                                  : "bg-white border border-border text-text/70 hover:bg-background hover:shadow-sm"
                              }`}
                              onClick={() => setUploadType("after")}
                            >
                              After
                            </button>
                          </div>

                          {/* File Upload */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, task._id, uploadType)
                            }
                            ref={fileInputRef}
                            className="mb-4 w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-secondary file:text-text hover:file:bg-primary file:transition-colors"
                          />

                          {/* Webcam Option */}
                          {!showWebcam ? (
                            <button
                              className="text-sm text-primary underline hover:text-hover mb-4 flex items-center gap-1 transition-colors"
                              onClick={() => {
                                setShowWebcam(true);
                                setCurrentTaskId(task._id);
                              }}
                            >
                              <Camera className="w-4 h-4" />
                              Use Webcam
                            </button>
                          ) : (
                            <div className="my-4 p-4 bg-background/50 rounded-lg">
                              <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                className="w-full h-40 rounded-lg border border-border shadow-sm"
                              />
                              <button
                                onClick={captureWebcam}
                                className="w-full mt-3 py-2 bg-primary text-text rounded-lg hover:bg-hover transition-colors font-medium shadow-sm hover:shadow-md"
                              >
                                Capture Photo
                              </button>
                            </div>
                          )}

                          {/* Captured Image Preview */}
                          {capturedImage && currentTaskId === task._id && (
                            <div className="my-4 p-4 bg-background/50 rounded-lg">
                              <img
                                src={capturedImage}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-lg border border-border shadow-sm mb-3"
                              />
                              <button
                                onClick={uploadCapturedImage}
                                disabled={uploading}
                                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-sm hover:shadow-md"
                              >
                                {uploading ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                  </div>
                                ) : (
                                  `Upload ${uploadType} Photo`
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-text mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              Report Issue
            </h3>

            {/* Show existing issues for this task */}
            {tasks.find((t) => t._id === currentTaskId)?.issues?.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg max-h-32 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  Previous Issues:
                </p>
                {tasks
                  .find((t) => t._id === currentTaskId)
                  .issues.map((issue, index) => (
                    <p
                      key={index}
                      className="text-xs text-gray-700 bg-white p-2 rounded mb-1 border-l-2 border-red-200"
                    >
                      {typeof issue === "string" ? issue : issue.description}
                    </p>
                  ))}
              </div>
            )}

            <textarea
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full p-3 border border-border rounded-lg resize-none h-24 focus:ring-2 focus:ring-primary focus:border-primary"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={addIssue}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors font-medium"
              >
                Report Issue
              </button>
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setIssueText("");
                }}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto border border-border hover:shadow-lg transition-colors">
            <AlertTriangle className="w-16 h-16 text-text/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">
              No Tasks Found
            </h3>
            <p className="text-text/60">
              {filter === "all"
                ? "You don't have any assigned tasks yet."
                : `No ${filter} tasks found.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffWorkTask;
