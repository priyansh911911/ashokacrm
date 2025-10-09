import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Calendar, DollarSign, Clock, UserPlus } from 'lucide-react';
import StaffForm from './StaffForm';
import AttendanceForm from './AttendanceForm';
import PayrollForm from './PayrollForm';
import DashboardLoader from '../DashboardLoader';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStaff, setCurrentStaff] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    department: [],
    salary: ''
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: DollarSign }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('role');
      
      console.log('Staff Add Debug:', { 
        token: token ? 'Present' : 'Missing', 
        userId, 
        userRole,
        staffData: currentStaff 
      });
      
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const payload = {
        username: currentStaff.username,
        email: currentStaff.email,
        password: currentStaff.password,
        role: currentStaff.role,
        department: currentStaff.department,
        salary: currentStaff.salary
      };
      
      console.log('Staff Add Payload:', payload);

      const response = await fetch('https://ashoka-backend.vercel.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Staff Add Response Status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Staff Added Successfully:', result);
        toast.success('Staff added successfully!');
        setShowStaffForm(false);
        setCurrentStaff({
          username: '',
          email: '',
          password: '',
          role: '',
          department: [],
          salary: ''
        });
      } else {
        const error = await response.json();
        console.error('Staff Add Error:', error);
        
        if (response.status === 401) {
          toast.error('Authentication failed. Please login again.');
          localStorage.clear();
          window.location.href = '/login';
        } else if (response.status === 403) {
          toast.error('Access denied. You do not have permission to add staff.');
        } else if (response.status === 400) {
          toast.error(error.message || 'Invalid data provided.');
        } else {
          toast.error(error.message || 'Failed to add staff');
        }
      }
    } catch (error) {
      console.error('Network Error:', error);
      toast.error('Network error. Please check your connection.');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">


            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setCurrentStaff({
                      username: '',
                      email: '',
                      password: '',
                      role: '',
                      department: [],
                      salary: ''
                    });
                    setEditMode(false);
                    setShowStaffForm(true);
                  }}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <UserPlus className="text-blue-600" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Add New Staff</p>
                    <p className="text-xs sm:text-sm text-gray-600">Register new employee</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Calendar className="text-green-600" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Mark Attendance</p>
                    <p className="text-xs sm:text-sm text-gray-600">Daily attendance tracking</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('payroll')}
                  className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <DollarSign className="text-purple-600" size={20} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">Generate Payroll</p>
                    <p className="text-xs sm:text-sm text-gray-600">Monthly salary calculation</p>
                  </div>
                </button>
              </div>
            </div>


          </div>
        );
      
      case 'attendance':
        return <AttendanceForm />;
      
      case 'payroll':
        return <PayrollForm />;
      
      default:
        return null;
    }
  };

  if (isLoading) {
    return <DashboardLoader pageName="Staff Management" />;
  }

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Users className="text-blue-600" size={24} />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">Staff Management</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-4 sm:mb-6">
          <div className="flex flex-wrap border-b">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 font-medium transition-colors text-sm sm:text-base ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Staff Form Modal */}
        <StaffForm
          showModal={showStaffForm}
          setShowModal={setShowStaffForm}
          currentStaff={currentStaff}
          setCurrentStaff={setCurrentStaff}
          handleSubmit={handleSubmit}
          editMode={editMode}
        />
      </div>
    </div>
  );
};

export default StaffDashboard;