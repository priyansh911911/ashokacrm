import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { axios } = useAppContext();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    totalSalary: 0,
    presentToday: 0,
    absentToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentStaff, setRecentStaff] = useState([]);
  const [presentStaff, setPresentStaff] = useState([]);
  const [absentStaff, setAbsentStaff] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch staff data
      const { data: staffData } = await axios.get('/api/auth/all-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const staffArray = Array.isArray(staffData) ? staffData : staffData.users || [];
      const totalStaff = staffArray.length;
      const activeStaff = staffArray.filter(s => s.status !== 'inactive').length;
      
      // Fetch attendance data for today
      let presentToday = 0;
      let absentToday = 0;
      const presentList = [];
      const absentList = [];
      
      for (const staff of staffArray) {
        try {
          const { data: attendanceData } = await axios.get(`/api/attendance/dashboard/${staff._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (attendanceData.todayStatus === 'present') {
            presentToday++;
            presentList.push(staff);
          } else {
            absentToday++;
            absentList.push(staff);
          }
        } catch (err) {
          // If no attendance data, consider absent
          absentToday++;
          absentList.push(staff);
        }
      }
      
      setPresentStaff(presentList);
      setAbsentStaff(absentList);
      
      // Fetch salary data
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: salaryData } = await axios.get(`/api/salary/get?month=${currentMonth}&year=${currentYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const salaries = Array.isArray(salaryData) ? salaryData : salaryData.salaries || [];
      const totalSalary = salaries.reduce((sum, s) => sum + (s.netSalary || 0), 0);
      
      setStats({
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff,
        totalSalary,
        presentToday,
        absentToday
      });
      
      setRecentStaff(staffArray.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {loading ? '...' : typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-blue-600" size={24} />
          <h1 className="text-2xl font-bold text-gray-800">Staff Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Staff"
            value={stats.totalStaff}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            icon={UserCheck}
            title="Active Staff"
            value={stats.activeStaff}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={UserX}
            title="Inactive Staff"
            value={stats.inactiveStaff}
            color="text-red-600"
            bgColor="bg-red-50"
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Salary"
            value={`₹${stats.totalSalary.toLocaleString()}`}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            icon={Calendar}
            title="Present Today"
            value={stats.presentToday}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            icon={TrendingUp}
            title="Absent Today"
            value={stats.absentToday}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => navigate('/staff')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
              >
                <Users className="h-5 w-5 text-blue-600 mb-1" />
                <h3 className="font-medium text-sm">Manage Staff</h3>
              </button>
              <button 
                onClick={() => navigate('/staff/payroll')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
              >
                <DollarSign className="h-5 w-5 text-green-600 mb-1" />
                <h3 className="font-medium text-sm">Payroll</h3>
              </button>
              <button 
                onClick={() => navigate('/staff/attendance')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
              >
                <Calendar className="h-5 w-5 text-purple-600 mb-1" />
                <h3 className="font-medium text-sm">Attendance</h3>
              </button>
            </div>
          </div>

          {/* Present Staff */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-green-600">Present Today ({stats.presentToday})</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : presentStaff.length > 0 ? (
                presentStaff.map((staff, index) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                    <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">{staff.username}</h3>
                      <p className="text-xs text-gray-600">{staff.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No staff present</div>
              )}
            </div>
          </div>

          {/* Absent Staff */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Absent Today ({stats.absentToday})</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading...</div>
              ) : absentStaff.length > 0 ? (
                absentStaff.map((staff, index) => (
                  <div key={index} className="flex items-center p-2 bg-red-50 rounded-lg">
                    <UserX className="h-4 w-4 text-red-600 mr-2" />
                    <div>
                      <h3 className="font-medium text-sm text-gray-900">{staff.username}</h3>
                      <p className="text-xs text-gray-600">{staff.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No staff absent</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
