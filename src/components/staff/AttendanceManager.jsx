import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Download, Filter, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { showToast } from '../../utils/toaster';

const AttendanceManager = () => {
  const { axios } = useAppContext();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    staffId: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStaff();
    fetchAttendance();
  }, [filters]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/auth/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const staffArray = Array.isArray(response.data) ? response.data : response.data.users || [];
      setStaff(staffArray);
    } catch (error) {
      showToast.error('Failed to fetch staff data');
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await axios.get(`/api/attendance/get?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAttendanceRecords(response.data.attendance || response.data);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      showToast.error('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceStatus = async (attendanceId, status, leaveType = null) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch('/api/attendance/update', {
        attendanceId,
        status,
        leaveType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast.success('Attendance updated successfully');
      fetchAttendance();
    } catch (error) {
      showToast.error('Failed to update attendance');
    }
  };

  const markAttendance = async (staffId, date, status, leaveType = null) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/attendance/mark', {
        staffId,
        date,
        status,
        leaveType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      showToast.success('Attendance marked successfully');
      fetchAttendance();
    } catch (error) {
      showToast.error('Failed to mark attendance');
    }
  };

  const exportAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && key !== 'page' && key !== 'limit') {
          queryParams.append(key, value);
        }
      });

      const response = await axios.get(`/api/attendance/export?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast.success('Attendance report exported successfully');
    } catch (error) {
      showToast.error('Failed to export attendance report');
    }
  };

  const getStatusColor = (status, leaveType) => {
    if (status === 'Present') return 'bg-green-100 text-green-800';
    if (status === 'Absent') return 'bg-red-100 text-red-800';
    if (status === 'Half Day') return 'bg-yellow-100 text-yellow-800';
    if (status === 'Late') return 'bg-orange-100 text-orange-800';
    if (status === 'Leave') {
      if (leaveType === 'casual') return 'bg-blue-100 text-blue-800';
      if (leaveType === 'sick') return 'bg-purple-100 text-purple-800';
      if (leaveType === 'paid') return 'bg-indigo-100 text-indigo-800';
      if (leaveType === 'unpaid') return 'bg-gray-100 text-gray-800';
      if (leaveType === 'emergency') return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-50 text-gray-500';
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
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (!searchQuery) return true;
    const staffName = record.staffId?.username || '';
    return staffName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600" size={24} />
            <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          </div>
          <button
            onClick={exportAttendance}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Download size={16} />
            Export
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Staff Member</label>
              <select
                value={filters.staffId}
                onChange={(e) => setFilters({...filters, staffId: e.target.value, page: 1})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Staff</option>
                {staff.map(member => (
                  <option key={member._id} value={member._id}>
                    {member.username}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Late">Late</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value, page: 1})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value, page: 1})}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by staff name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Attendance Records</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading attendance records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Staff</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Clock In</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Clock Out</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total Hours</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Leave Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No attendance records found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-blue-600">
                                {record.staffId?.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                            <span className="font-medium">{record.staffId?.username || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatDate(record.date)}</td>
                        <td className="px-4 py-3 text-sm">{formatTime(record.time_in)}</td>
                        <td className="px-4 py-3 text-sm">{formatTime(record.time_out)}</td>
                        <td className="px-4 py-3 text-sm">
                          {record.total_hours ? `${record.total_hours.toFixed(2)} hrs` : '--'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status, record.leaveType)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {record.leaveType ? (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                              {record.leaveType}
                            </span>
                          ) : (
                            '--'
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {record.notes || '--'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {filters.page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({...filters, page: Math.max(1, filters.page - 1)})}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setFilters({...filters, page: Math.min(totalPages, filters.page + 1)})}
                  disabled={filters.page === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceManager;
