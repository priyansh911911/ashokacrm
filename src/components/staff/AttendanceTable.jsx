import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AttendanceTable = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendance, setAttendance] = useState({});

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchAttendance();
    }
  }, [selectedStaff, selectedMonth, selectedYear]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ashoka-api.shineinfosolutions.in/api/staff/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStaff(Array.isArray(data) ? data : data.staff || []);
      }
    } catch (error) {
      toast.error('Failed to fetch staff');
    }
  };

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ashoka-api.shineinfosolutions.in/api/attendance/get', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const attendanceMap = {};
        
        data.forEach(record => {
          const date = new Date(record.date);
          if (date.getMonth() + 1 === selectedMonth && 
              date.getFullYear() === selectedYear &&
              record.staffId._id === selectedStaff) {
            attendanceMap[date.getDate()] = record.status;
          }
        });
        
        setAttendance(attendanceMap);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (day, status) => {
    try {
      const token = localStorage.getItem('token');
      const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      const response = await fetch('https://ashoka-api.shineinfosolutions.in/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          staffId: selectedStaff,
          date,
          status
        })
      });
      
      if (response.ok) {
        setAttendance(prev => ({ ...prev, [day]: status }));
        toast.success('Attendance marked');
      }
    } catch (error) {
      toast.error('Failed to mark attendance');
    }
  };

  const getDaysInMonth = () => new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: getDaysInMonth() }, (_, i) => i + 1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-500 text-white';
      case 'absent': return 'bg-red-500 text-white';
      case 'half-day': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Staff Attendance</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium mb-1">Select Staff</label>
            <select
              value={selectedStaff}
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Choose Staff</option>
              {staff.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.userId?.username || s.name} - {s.department}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedStaff ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-3 sm:p-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold">
              {staff.find(s => s._id === selectedStaff)?.userId?.username || 'Staff'} - {months[selectedMonth - 1]} {selectedYear}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {days.map(day => (
                    <th key={day} className="px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium border min-w-10 sm:min-w-12">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {days.map(day => (
                    <td key={day} className="px-1 sm:px-2 py-2 sm:py-3 text-center border">
                      <div className="relative group">
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded cursor-pointer mx-auto flex items-center justify-center text-xs font-bold ${getStatusColor(attendance[day])}`}
                        >
                          {attendance[day] ? attendance[day][0].toUpperCase() : '-'}
                        </div>
                        
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white border rounded shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                          <div className="p-2 min-w-20 sm:min-w-24">
                            <button
                              onClick={() => markAttendance(day, 'present')}
                              className="block w-full text-left px-2 py-1 text-xs hover:bg-green-100 rounded"
                            >
                              Present
                            </button>
                            <button
                              onClick={() => markAttendance(day, 'absent')}
                              className="block w-full text-left px-2 py-1 text-xs hover:bg-red-100 rounded"
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => markAttendance(day, 'half-day')}
                              className="block w-full text-left px-2 py-1 text-xs hover:bg-yellow-100 rounded"
                            >
                              Half Day
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 text-center">
          <p className="text-gray-500 text-sm sm:text-base">Please select a staff member to view attendance</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceTable;
