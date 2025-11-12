import React, { useState, useEffect } from 'react';
import { Clock, Calendar, DollarSign, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';

const StaffClockDashboard = () => {
  const { axios } = useAppContext();
  const [staffData, setStaffData] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [liveHours, setLiveHours] = useState(0);
  const [selectedShift, setSelectedShift] = useState('morning');

  const staffId = localStorage.getItem('userId'); // Assuming staff ID is stored in localStorage

  useEffect(() => {
    if (staffId) {
      fetchDashboardData();
    }
  }, [staffId]);

  // Live counter for hours worked
  useEffect(() => {
    let interval;
    if (todayAttendance?.time_in && !todayAttendance?.time_out) {
      interval = setInterval(() => {
        const now = new Date();
        const checkInTime = new Date(todayAttendance.time_in);
        const hoursWorked = (now - checkInTime) / (1000 * 60 * 60);
        setLiveHours(hoursWorked);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [todayAttendance]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Use basic staff data from localStorage
      const username = localStorage.getItem('username') || 'Staff Member';
      setStaffData({ username });

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayResponse = await axios.get('/api/attendance/get', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          staffId: staffId,
          date: today
        }
      });
      const todayData = Array.isArray(todayResponse.data) ? todayResponse.data[0] : todayResponse.data;
      setTodayAttendance(todayData);

      // Fetch monthly report
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const monthlyResponse = await axios.get('/api/attendance/get', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          staffId: staffId,
          month: currentMonth,
          year: currentYear
        }
      });
      const monthlyData = Array.isArray(monthlyResponse.data) ? monthlyResponse.data : [];
      const summary = {
        presentDays: monthlyData.filter(r => r.status === 'Present').length,
        absentDays: monthlyData.filter(r => r.status === 'Absent').length,
        halfDays: monthlyData.filter(r => r.status === 'Half Day').length,
        leaveDays: monthlyData.filter(r => r.status === 'Leave').length
      };
      setMonthlyReport(summary);

      // Skip salary history for now
      setSalaryHistory([]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const token = localStorage.getItem('token');
      const requestData = {
        staffId,
        shift: selectedShift
      };
      console.log('Frontend sending:', requestData); // Debug log
      const response = await axios.post('/api/attendance/clock-in', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTodayAttendance(response.data.attendance);
      showToast.success(`Clocked in for ${selectedShift} shift successfully!`);
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to clock in');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/attendance/clock-out', {
        staffId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTodayAttendance(response.data.attendance);
      showToast.success('Clocked out successfully!');
      // Refresh data to get updated total hours
      fetchDashboardData();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setClockLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--:--';
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const displaySeconds = seconds.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes}:${displaySeconds} ${ampm}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatHours = (totalHours) => {
    if (!totalHours) return '0h 0m 0s';
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    const seconds = Math.floor(((totalHours - hours) * 60 - minutes) * 60);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <User className="text-blue-600" size={24} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {staffData?.username}</h1>
            <p className="text-gray-600">{formatDate(new Date())}</p>
          </div>
        </div>

        {/* Clock In/Out Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-green-600" size={20} />
            <h2 className="text-lg font-semibold">Today's Attendance</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Check In</p>
              <p className="text-xl font-bold text-green-600">
                {formatTime(todayAttendance?.time_in)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Check Out</p>
              <p className="text-xl font-bold text-red-600">
                {formatTime(todayAttendance?.time_out)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Hours</p>
              <p className="text-xl font-bold text-blue-600">
                {todayAttendance?.time_in && !todayAttendance?.time_out 
                  ? formatHours(liveHours) 
                  : formatHours(todayAttendance?.total_hours)
                }
              </p>
            </div>
          </div>
          
          {!todayAttendance?.time_in && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Shift:
              </label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
                className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="morning">Morning Shift (10 AM - 4 PM)</option>
                <option value="evening">Evening Shift (4:00 PM - 10 PM)</option>
              </select>
            </div>
          )}
          
          <div className="flex gap-4 mt-6 justify-center">
            {!todayAttendance?.time_in ? (
              <button
                onClick={handleClockIn}
                disabled={clockLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <CheckCircle size={20} />
                {clockLoading ? 'Checking In...' : `Check In (${selectedShift.charAt(0).toUpperCase() + selectedShift.slice(1)} Shift)`}
              </button>
            ) : !todayAttendance?.time_out ? (
              <button
                onClick={handleClockOut}
                disabled={clockLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <XCircle size={20} />
                {clockLoading ? 'Checking Out...' : 'Check Out'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="font-medium">Day Complete</span>
              </div>
            )}
          </div>
          
          {todayAttendance?.status && (
            <div className="mt-4 text-center space-y-2">
              <div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  todayAttendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                  todayAttendance.status === 'Late' ? 'bg-orange-100 text-orange-800' :
                  todayAttendance.status === 'Half Day' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Status: {todayAttendance.status}
                </span>
              </div>
              {todayAttendance.shift && (
                <div>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {todayAttendance.shift.charAt(0).toUpperCase() + todayAttendance.shift.slice(1)} Shift
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold">This Month's Summary</h2>
          </div>
          
          {monthlyReport ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{monthlyReport.presentDays}</p>
                <p className="text-sm text-gray-600">Present Days</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">{monthlyReport.absentDays}</p>
                <p className="text-sm text-gray-600">Absent Days</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{monthlyReport.halfDays}</p>
                <p className="text-sm text-gray-600">Half Days</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{monthlyReport.leaveDays}</p>
                <p className="text-sm text-gray-600">Leave Days</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No attendance data available</p>
          )}
        </div>


      </div>
    </div>
  );
};

export default StaffClockDashboard;
