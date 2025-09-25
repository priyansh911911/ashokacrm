import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Users, Calendar, DollarSign, Clock, UserPlus } from 'lucide-react';
import StaffForm from './StaffForm';
import AttendanceForm from './AttendanceForm';
import PayrollForm from './PayrollForm';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [currentStaff, setCurrentStaff] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    department: [],
    salary: ''
  });
  const [editMode, setEditMode] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: DollarSign }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://ashoka-backend.vercel.app/api/staff/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          username: currentStaff.username,
          email: currentStaff.email,
          password: currentStaff.password,
          role: currentStaff.role,
          department: currentStaff.department,
          salary: currentStaff.salary
        })
      });

      if (response.ok) {
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
        toast.error(error.message || 'Failed to add staff');
      }
    } catch (error) {
      toast.error('Error adding staff');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">


            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <UserPlus className="text-blue-600" size={24} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Add New Staff</p>
                    <p className="text-sm text-gray-600">Register new employee</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('attendance')}
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
                >
                  <Calendar className="text-green-600" size={24} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Mark Attendance</p>
                    <p className="text-sm text-gray-600">Daily attendance tracking</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setActiveTab('payroll')}
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  <DollarSign className="text-purple-600" size={24} />
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Generate Payroll</p>
                    <p className="text-sm text-gray-600">Monthly salary calculation</p>
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

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Users className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap border-b">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
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