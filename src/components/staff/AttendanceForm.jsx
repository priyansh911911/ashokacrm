import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';

const AttendanceForm = () => {
  const [staff, setStaff] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [recentActions, setRecentActions] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (staff.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, staff]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      
      console.log('Auth Debug:', { token: token ? 'Present' : 'Missing', userId, role });
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch('https://ashoka-backend.vercel.app/api/staff/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Staff API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Staff Data:', data);
        setStaff(data || []);
      } else {
        const errorData = await response.json();
        console.error('Staff API Error:', errorData);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          localStorage.clear();
          window.location.href = '/login';
        } else if (response.status === 403) {
          toast.error('Access denied. You do not have permission to view staff data.');
        } else {
          toast.error(errorData.message || 'Failed to fetch staff members');
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Network error. Please check your connection.');
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`https://ashoka-backend.vercel.app/api/attendance/get?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const attendanceMap = {};
        data.forEach(record => {
          attendanceMap[record.staffId] = record;
        });
        setAttendance(attendanceMap);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (staffId, status, leaveType = null) => {
    console.log('Marking attendance:', { staffId, status, leaveType });
    setLoading(true);
    
    // Show immediate feedback
    const staffName = staff.find(s => s._id === staffId)?.userId?.username || 'Staff';
    const statusText = status === 'present' ? '✅ Present' : 
                      status === 'absent' ? '❌ Absent' : 
                      status === 'half-day' ? '⏰ Half Day' : 
                      status === 'leave' ? `🏖️ ${leaveType} Leave` : status;
    
    toast.loading(`Marking ${staffName} as ${statusText}...`, { id: staffId });
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('No authentication token. Please login again.', { id: staffId });
        setLoading(false);
        return;
      }

      const payload = {
        staffId,
        date: selectedDate,
        status,
        leaveType,
        checkIn: status === 'present' ? new Date() : null
      };

      console.log('Attendance Payload:', payload);
      const response = await fetch('https://ashoka-backend.vercel.app/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Attendance API Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Attendance marked:', result);
        
        // Show in-page notification
        setNotification({
          type: 'success',
          message: `${staffName} marked as ${statusText}`,
          timestamp: new Date().toLocaleTimeString()
        });
        
        // Add to recent actions
        setRecentActions(prev => [{
          id: Date.now(),
          staffName,
          status: statusText,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev.slice(0, 4)]);
        
        // Clear notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
        
        toast.success(`${staffName} marked as ${statusText} ✓`, { id: staffId });
        fetchAttendance();
      } else {
        const error = await response.json();
        console.error('Failed to mark attendance:', error);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.', { id: staffId });
          localStorage.clear();
          window.location.href = '/login';
        } else if (response.status === 403) {
          toast.error('Access denied. You do not have permission to mark attendance.', { id: staffId });
        } else {
          toast.error(error.message || 'Failed to mark attendance', { id: staffId });
        }
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Network error. Please try again.', { id: staffId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 lg:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Users className="text-blue-600" size={24} />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Staff Attendance</h1>
        </div>

        {/* In-Page Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg border-l-4 animate-pulse ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-800'
              : 'bg-red-50 border-red-400 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              <div>
                <p className="font-semibold">{notification.message}</p>
                <p className="text-xs opacity-75">at {notification.timestamp}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Actions Panel */}
        {recentActions.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>🕒</span> Recent Actions
              </h3>
              <button
                onClick={() => setRecentActions([])}
                className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                title="Clear all recent actions"
              >
                ❌ Clear
              </button>
            </div>
            <div className="space-y-1">
              {recentActions.map(action => (
                <div key={action.id} className="flex items-center justify-between text-xs text-gray-600 bg-white px-2 py-1 rounded">
                  <span>{action.staffName} → {action.status}</span>
                  <span>{action.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Selection */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-green-600" size={18} />
              <label className="text-sm sm:text-base font-medium text-gray-700">Select Date:</label>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>



        {/* Staff Attendance Grid */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={18} />
            Mark Today's Attendance
          </h2>
          
          <div className="grid gap-3 sm:gap-4">
            {staff.map(member => {
              const currentAttendance = attendance[member._id];
              return (
                <div key={member._id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-medium text-gray-800 truncate">{member.userId?.username || member.username}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{member.department}</p>
                      <p className="text-xs text-gray-500">Salary: ₹{member.salary?.toLocaleString()}</p>
                    </div>
                    
                    <div className="w-full lg:w-auto">
                      {/* Current Status Display */}
                      {currentAttendance && (
                        <div className="mb-2 p-2 rounded-lg border-2 border-dashed ${
                          currentAttendance.status === 'present' ? 'border-green-300 bg-green-50' :
                          currentAttendance.status === 'absent' ? 'border-red-300 bg-red-50' :
                          currentAttendance.status === 'half-day' ? 'border-yellow-300 bg-yellow-50' :
                          'border-blue-300 bg-blue-50'
                        }">
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-600">Current Status:</span>
                            <div className={`text-sm font-bold mt-1 ${
                              currentAttendance.status === 'present' ? 'text-green-700' :
                              currentAttendance.status === 'absent' ? 'text-red-700' :
                              currentAttendance.status === 'half-day' ? 'text-yellow-700' :
                              'text-blue-700'
                            }`}>
                              {currentAttendance.status === 'present' && '✅ PRESENT'}
                              {currentAttendance.status === 'absent' && '❌ ABSENT'}
                              {currentAttendance.status === 'half-day' && '⏰ HALF DAY'}
                              {currentAttendance.status === 'leave' && `🏖️ ${currentAttendance.leaveType?.toUpperCase()} LEAVE`}
                            </div>
                            {currentAttendance.checkIn && (
                              <div className="text-xs text-gray-500 mt-1">
                                Check-in: {new Date(currentAttendance.checkIn).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Mobile: Stack buttons vertically */}
                      <div className="grid grid-cols-2 sm:hidden gap-2 mb-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Present button clicked for:', member._id);
                            markAttendance(member._id, 'present');
                          }}
                          disabled={loading}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                            currentAttendance?.status === 'present'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span>✅</span>
                          {loading ? 'Loading...' : 'Present'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Absent button clicked for:', member._id);
                            markAttendance(member._id, 'absent');
                          }}
                          disabled={loading}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                            currentAttendance?.status === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span>❌</span>
                          {loading ? 'Loading...' : 'Absent'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Half Day button clicked for:', member._id);
                            markAttendance(member._id, 'half-day');
                          }}
                          disabled={loading}
                          className={`px-2 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                            currentAttendance?.status === 'half-day'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 active:bg-yellow-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loading ? 'Loading...' : 'Half Day'}
                        </button>
                        
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              console.log('Leave type selected:', e.target.value, 'for:', member._id);
                              markAttendance(member._id, 'leave', e.target.value);
                              setTimeout(() => {
                                e.target.value = '';
                              }, 100);
                            }
                          }}
                          value={currentAttendance?.status === 'leave' ? currentAttendance.leaveType || '' : ''}
                          disabled={loading}
                          className="px-2 py-1.5 border border-gray-300 rounded text-xs cursor-pointer"
                        >
                          <option value="" disabled>
                            {currentAttendance?.status === 'leave' && currentAttendance.leaveType
                              ? `${currentAttendance.leaveType.charAt(0).toUpperCase() + currentAttendance.leaveType.slice(1)} Leave`
                              : 'Leave Type'
                            }
                          </option>
                          <option value="casual">Casual</option>
                          <option value="sick">Sick</option>
                          <option value="paid">Paid</option>
                          <option value="unpaid">Unpaid</option>
                        </select>
                      </div>
                      
                      {/* Desktop: Horizontal layout */}
                      <div className="hidden sm:flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Present button clicked for:', member._id);
                            markAttendance(member._id, 'present');
                          }}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                            currentAttendance?.status === 'present'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loading ? 'Loading...' : 'Present'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Absent button clicked for:', member._id);
                            markAttendance(member._id, 'absent');
                          }}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                            currentAttendance?.status === 'absent'
                              ? 'bg-red-600 text-white'
                              : 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loading ? 'Loading...' : 'Absent'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Half Day button clicked for:', member._id);
                            markAttendance(member._id, 'half-day');
                          }}
                          disabled={loading}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors cursor-pointer ${
                            currentAttendance?.status === 'half-day'
                              ? 'bg-yellow-600 text-white'
                              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 active:bg-yellow-300'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {loading ? 'Loading...' : 'Half Day'}
                        </button>
                        
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              console.log('Leave type selected:', e.target.value, 'for:', member._id);
                              markAttendance(member._id, 'leave', e.target.value);
                              setTimeout(() => {
                                e.target.value = '';
                              }, 100);
                            }
                          }}
                          value={currentAttendance?.status === 'leave' ? currentAttendance.leaveType || '' : ''}
                          disabled={loading}
                          className="px-2 py-1 border border-gray-300 rounded text-sm cursor-pointer"
                        >
                          <option value="" disabled>
                            {currentAttendance?.status === 'leave' && currentAttendance.leaveType
                              ? `${currentAttendance.leaveType.charAt(0).toUpperCase() + currentAttendance.leaveType.slice(1)} Leave`
                              : 'Select Leave Type'
                            }
                          </option>
                          <option value="casual">Casual Leave</option>
                          <option value="sick">Sick Leave</option>
                          <option value="paid">Paid Leave</option>
                          <option value="unpaid">Unpaid Leave</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {currentAttendance && (
                    <div className="mt-2 sm:mt-3 p-2 bg-gray-50 rounded">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-xs sm:text-sm text-gray-600">Status:</span>
                        <span className={`text-xs sm:text-sm font-medium px-2 py-1 rounded inline-block ${
                          currentAttendance.status === 'present' 
                            ? 'bg-green-100 text-green-800'
                            : currentAttendance.status === 'leave'
                            ? 'bg-blue-100 text-blue-800'
                            : currentAttendance.status === 'half-day'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {currentAttendance.status === 'leave' && currentAttendance.leaveType 
                            ? `${currentAttendance.leaveType} Leave`
                            : currentAttendance.status
                          }
                        </span>
                      </div>
                      {currentAttendance.checkIn && (
                        <div className="mt-1 text-xs text-gray-500">
                          Check-in: {new Date(currentAttendance.checkIn).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;