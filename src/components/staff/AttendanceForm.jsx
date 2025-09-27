import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Users, CheckCircle } from 'lucide-react';

const AttendanceForm = () => {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchMonthlyAttendance();
    }
  }, [selectedMonth, selectedYear, selectedStaff]);

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://ashoka-backend.vercel.app/api/staff/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const staffArray = Array.isArray(data) ? data : data.staff || [];
        
        console.log('Raw staff data:', staffArray); // Debug log
        
        const formattedStaff = staffArray.map(staffMember => {
          console.log('Processing staff member:', JSON.stringify(staffMember, null, 2));
          
          // Extract username with proper type checking
          let username = 'Staff Member';
          if (typeof staffMember.userId?.username === 'string') {
            username = staffMember.userId.username;
          } else if (typeof staffMember.username === 'string') {
            username = staffMember.username;
          } else if (typeof staffMember.name === 'string') {
            username = staffMember.name;
          } else if (staffMember.userId?.username?.name) {
            username = staffMember.userId.username.name;
          }
          
          // Extract department - handle array of departments
          let department = 'General';
          if (staffMember.department) {
            if (typeof staffMember.department === 'string') {
              department = staffMember.department;
            } else if (Array.isArray(staffMember.department)) {
              // Join all department names with comma
              department = staffMember.department.map(dept => dept.name).join(', ');
            } else if (staffMember.department.name) {
              department = staffMember.department.name;
            }
          }
          
          console.log('Department extraction:', {
            raw: staffMember.department,
            extracted: department
          });
          
          console.log('Final extracted values:', { username, department });
          
          return {
            _id: staffMember._id,
            userId: staffMember.userId,
            username,
            department,
            salary: staffMember.salary || 0
          };
        });
        
        setStaff(formattedStaff);
      }
    } catch (error) {
      toast.error('Failed to fetch staff data');
    }
  };

  const fetchMonthlyAttendance = async () => {
    try {
      const response = await fetch(`https://ashoka-backend.vercel.app/api/attendance/get`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const attendanceMap = {};
        
        data.forEach(record => {
          const recordDate = new Date(record.date);
          if (recordDate.getMonth() + 1 === selectedMonth && 
              recordDate.getFullYear() === selectedYear &&
              record.staffId._id === selectedStaff) {
            const key = `${selectedStaff}-${recordDate.getDate()}`;
            attendanceMap[key] = {
              status: record.status,
              leaveType: record.leaveType,
              _id: record._id
            };
          }
        });
        
        setAttendanceData(attendanceMap);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (staffId, day, status, leaveType = null) => {
    setLoading(true);
    const date = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    try {
      const token = localStorage.getItem('token');
      const key = `${staffId}-${day}`;
      const existingAttendance = attendanceData[key];
      
      if (existingAttendance) {
        const response = await fetch('https://ashoka-backend.vercel.app/api/attendance/status', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            attendanceId: existingAttendance._id,
            status,
            leaveType
          })
        });
        
        if (response.ok) {
          setAttendanceData(prev => ({
            ...prev,
            [key]: { ...existingAttendance, status, leaveType }
          }));
          toast.success('Attendance updated');
        }
      } else {
        const response = await fetch('https://ashoka-backend.vercel.app/api/attendance/mark', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            staffId,
            date,
            status,
            leaveType,
            checkIn: status === 'present' ? new Date() : null
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          setAttendanceData(prev => ({
            ...prev,
            [key]: { status, leaveType, _id: result._id }
          }));
          toast.success('Attendance marked');
        }
      }
    } catch (error) {
      toast.error('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status, leaveType) => {
    if (status === 'present') return 'bg-green-100 text-green-800';
    if (status === 'absent') return 'bg-red-100 text-red-800';
    if (status === 'half-day') return 'bg-yellow-100 text-yellow-800';
    if (status === 'leave') {
      if (leaveType === 'casual') return 'bg-blue-100 text-blue-800';
      if (leaveType === 'sick') return 'bg-orange-100 text-orange-800';
      if (leaveType === 'paid') return 'bg-purple-100 text-purple-800';
      if (leaveType === 'unpaid') return 'bg-gray-100 text-gray-800';
    }
    return 'bg-gray-50 text-gray-500';
  };

  const getStatusText = (status, leaveType) => {
    if (status === 'present') return 'P';
    if (status === 'absent') return 'A';
    if (status === 'half-day') return 'H';
    if (status === 'leave') return leaveType ? leaveType.charAt(0).toUpperCase() : 'L';
    return '-';
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Users className="text-blue-600" size={20} />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Staff Attendance</h1>
        </div>

        {/* Staff, Month/Year Selection */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4 mb-4">
            <Calendar className="text-green-600" size={16} />
            <h3 className="text-sm sm:text-base font-medium text-gray-700">Select Period & Staff</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose Staff Member</option>
                {staff.map((staffMember) => (
                  <option key={staffMember._id} value={staffMember._id}>
                    {staffMember.username} - {staffMember.department}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month, index) => (
                  <option key={index} value={index + 1}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Staff Info & Salary Update */}
        {selectedStaff && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  {staff.find(s => s._id === selectedStaff)?.username}
                </h3>
                <p className="text-sm text-gray-600">
                  {staff.find(s => s._id === selectedStaff)?.department}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Salary: ₹</span>
                <input
                  type="number"
                  value={staff.find(s => s._id === selectedStaff)?.salary || ''}
                  onChange={(e) => {
                    const newSalary = parseInt(e.target.value) || 0;
                    setStaff(prev => prev.map(s => 
                      s._id === selectedStaff ? {...s, salary: newSalary} : s
                    ));
                  }}
                  onBlur={async (e) => {
                    const selectedStaffMember = staff.find(s => s._id === selectedStaff);
                    const newSalary = parseInt(e.target.value) || 0;
                    if (newSalary !== selectedStaffMember?.salary) {
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`https://ashoka-backend.vercel.app/api/staff/update/${selectedStaff}`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({ 
                            salary: newSalary, 
                            department: selectedStaffMember?.department 
                          })
                        });
                        if (response.ok) {
                          toast.success(`Salary updated for ${selectedStaffMember?.username}`);
                        } else {
                          toast.error('Failed to update salary');
                        }
                      } catch (error) {
                        toast.error('Error updating salary');
                      }
                    }
                  }}
                  className="w-20 sm:w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}



        {/* Attendance Table */}
        {selectedStaff ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-3 sm:p-4 border-b">
              <h2 className="text-base sm:text-lg font-semibold">
                {months[selectedMonth - 1]} {selectedYear} Attendance
              </h2>
            </div>
            
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {days.map(day => (
                      <th key={day} className="px-1 sm:px-3 py-2 sm:py-3 text-center font-medium text-gray-700 border min-w-10 sm:min-w-16">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-50">
                    {days.map(day => {
                      const key = `${selectedStaff}-${day}`;
                      const attendance = attendanceData[key];
                      
                      return (
                        <td key={day} className="px-1 sm:px-3 py-2 sm:py-3 border text-center">
                          <div
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center cursor-pointer mx-auto border-2 ${
                              getStatusColor(attendance?.status, attendance?.leaveType)
                            }`}
                            title={attendance ? `${attendance.status}${attendance.leaveType ? ` (${attendance.leaveType})` : ''}` : 'Click to mark attendance'}
                            onClick={() => {
                              setOpenDropdown({ staffId: selectedStaff, day: day });
                            }}
                          >
                            {getStatusText(attendance?.status, attendance?.leaveType)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
            <p className="text-gray-500 text-sm sm:text-lg">Please select a staff member to view their attendance sheet</p>
          </div>
        )}

        {/* Attendance Marking Modal */}
        {openDropdown && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 max-w-sm w-full">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-center">
                Mark Attendance - Day {openDropdown.day}
              </h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    markAttendance(openDropdown.staffId, openDropdown.day, 'present');
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-xs sm:text-sm"
                  disabled={loading}
                >
                  ✅ Present
                </button>
                <button
                  onClick={() => {
                    markAttendance(openDropdown.staffId, openDropdown.day, 'absent');
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                  disabled={loading}
                >
                  ❌ Absent
                </button>
                <button
                  onClick={() => {
                    markAttendance(openDropdown.staffId, openDropdown.day, 'half-day');
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                  disabled={loading}
                >
                  ⏰ Half Day
                </button>
                <button
                  onClick={() => {
                    markAttendance(openDropdown.staffId, openDropdown.day, 'leave', 'casual');
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  disabled={loading}
                >
                  🏖️ Casual
                </button>
                <button
                  onClick={() => {
                    markAttendance(openDropdown.staffId, openDropdown.day, 'leave', 'sick');
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
                  disabled={loading}
                >
                  🤒 Sick
                </button>
                <button
                  onClick={() => {
                    markAttendance(openDropdown.staffId, openDropdown.day, 'leave', 'paid');
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors"
                  disabled={loading}
                >
                  💰 Paid
                </button>
                <button
                  onClick={() => {
                    markAttendance(openDropdown.staffId, openDropdown.day, 'leave', 'unpaid');
                    setOpenDropdown(null);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  🚫 Unpaid
                </button>
              </div>
              <button
                onClick={() => setOpenDropdown(null)}
                className="w-full mt-3 sm:mt-4 px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
          <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">Attendance Status Legend:</h3>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4 justify-center text-sm sm:text-base">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 text-green-800 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center border-2 border-green-200">P</div>
              <span className="font-medium text-xs sm:text-sm">Present</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 text-red-800 rounded-lg text-sm font-bold flex items-center justify-center border-2 border-red-200">A</div>
              <span className="font-medium">Absent</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-bold flex items-center justify-center border-2 border-yellow-200">H</div>
              <span className="font-medium">Half Day</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold flex items-center justify-center border-2 border-blue-200">C</div>
              <span className="font-medium">Casual Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 text-orange-800 rounded-lg text-sm font-bold flex items-center justify-center border-2 border-orange-200">S</div>
              <span className="font-medium">Sick Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-lg text-xs font-bold flex items-center justify-center border-2 border-purple-200">PL</div>
              <span className="font-medium">Paid Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold flex items-center justify-center border-2 border-gray-200">U</div>
              <span className="font-medium">Unpaid Leave</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-50 text-gray-500 rounded-lg text-sm font-bold flex items-center justify-center border-2 border-gray-300">-</div>
              <span className="font-medium">Not Marked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;