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

  const staffId = localStorage.getItem('userId'); // Assuming staff ID is stored in localStorage

  useEffect(() => {
    if (staffId) {
      fetchDashboardData();
    }
  }, [staffId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch staff profile
      const profileResponse = await axios.get('/api/auth/staff-profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaffData(profileResponse.data);

      // Fetch today's attendance
      const todayResponse = await axios.get(`/api/attendance/today/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayAttendance(todayResponse.data);

      // Fetch monthly report
      const monthlyResponse = await axios.get(`/api/attendance/monthly-report/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMonthlyReport(monthlyResponse.data);

      // Fetch salary history
      const salaryResponse = await axios.get(`/api/salary/history/${staffId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalaryHistory(salaryResponse.data);

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
      const response = await axios.post('/api/attendance/clock-in', {
        staffId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTodayAttendance(response.data);
      showToast.success('Clocked in successfully!');
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
      
      setTodayAttendance(response.data);
      showToast.success('Clocked out successfully!');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to clock out');
    } finally {
      setClockLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
              <p className="text-sm text-gray-600 mb-1">Clock In</p>
              <p className="text-xl font-bold text-green-600">
                {formatTime(todayAttendance?.time_in)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Clock Out</p>
              <p className="text-xl font-bold text-red-600">
                {formatTime(todayAttendance?.time_out)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Hours</p>
              <p className="text-xl font-bold text-blue-600">
                {todayAttendance?.total_hours?.toFixed(2) || '0.00'} hrs
              </p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6 justify-center">
            {!todayAttendance?.time_in ? (
              <button
                onClick={handleClockIn}
                disabled={clockLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <CheckCircle size={20} />
                {clockLoading ? 'Clocking In...' : 'Clock In'}
              </button>
            ) : !todayAttendance?.time_out ? (
              <button
                onClick={handleClockOut}
                disabled={clockLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2"
              >
                <XCircle size={20} />
                {clockLoading ? 'Clocking Out...' : 'Clock Out'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle size={20} />
                <span className="font-medium">Day Complete</span>
              </div>
            )}
          </div>
          
          {todayAttendance?.status && (
            <div className="mt-4 text-center">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                todayAttendance.status === 'Present' ? 'bg-green-100 text-green-800' :
                todayAttendance.status === 'Late' ? 'bg-orange-100 text-orange-800' :
                todayAttendance.status === 'Half Day' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Status: {todayAttendance.status}
              </span>
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-blue-600" size={20} />
              <h2 className="text-lg font-semibold">This Month's Summary</h2>
            </div>
            
            {monthlyReport ? (
              <div className="grid grid-cols-2 gap-4">
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

          {/* Salary Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="text-green-600" size={20} />
              <h2 className="text-lg font-semibold">Salary Information</h2>
            </div>
            
            {staffData?.salaryDetails ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Basic Salary:</span>
                  <span className="font-semibold">₹{staffData.salaryDetails.basicSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Allowances:</span>
                  <span className="font-semibold">₹{staffData.salaryDetails.allowances?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deductions:</span>
                  <span className="font-semibold text-red-600">₹{staffData.salaryDetails.deductions?.toLocaleString()}</span>
                </div>
                <hr />
                <div className="flex justify-between">
                  <span className="text-gray-600 font-medium">Net Salary:</span>
                  <span className="font-bold text-green-600">₹{staffData.salaryDetails.netSalary?.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Salary information not available</p>
            )}
          </div>
        </div>

        {/* Recent Salary History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Salary History</h2>
          
          {salaryHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Month/Year</th>
                    <th className="px-4 py-2 text-right">Gross Salary</th>
                    <th className="px-4 py-2 text-right">Deductions</th>
                    <th className="px-4 py-2 text-right">Net Salary</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryHistory.slice(0, 5).map((salary) => (
                    <tr key={salary._id} className="border-t">
                      <td className="px-4 py-2">
                        {new Date(salary.year, salary.month - 1).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-2 text-right">₹{salary.grossSalary?.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-red-600">₹{salary.totalDeductions?.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right font-semibold">₹{salary.netSalary?.toLocaleString()}</td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          salary.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          salary.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {salary.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No salary history available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffClockDashboard;