import React, { useState } from "react";
import { showToast } from "../../utils/toaster";
import { validateRequired, validateEmail, validateMinLength } from "../../utils/validation";

const StaffForm = ({
  showModal,
  setShowModal,
  currentStaff,
  setCurrentStaff,
  handleSubmit,
  editMode,
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  if (!showModal) return null;

  const departments = [
    { id: 1, name: "reception" },
    { id: 2, name: "housekeeping" },
    { id: 3, name: "accounts" },
    { id: 4, name: "pantry" },
  ];

  const handleDepartmentChange = (e) => {
    const options = e.target.options;
    const selectedDepts = [];

    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        const deptId = parseInt(options[i].value);
        const dept = departments.find((d) => d.id === deptId);
        if (dept) {
          selectedDepts.push({ id: dept.id, name: dept.name });
        }
      }
    }

    setCurrentStaff({
      ...currentStaff,
      department: selectedDepts,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4">
          {editMode ? "Edit Staff" : "Add Staff"}
        </h2>
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'basic' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          >
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'personal' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          >
            Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'bank' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
          >
            Bank & Salary
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Username *</label>
                  <input
                    type="text"
                    value={currentStaff.username || ''}
                    onChange={(e) =>
                      setCurrentStaff({ ...currentStaff, username: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      !currentStaff.username ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={currentStaff.email || ''}
                    onChange={(e) =>
                      setCurrentStaff({ ...currentStaff, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      !currentStaff.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Password {!editMode && '*'}</label>
                <input
                  type="password"
                  value={currentStaff.password || ''}
                  onChange={(e) =>
                    setCurrentStaff({ ...currentStaff, password: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    !editMode && !currentStaff.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={editMode ? 'Leave blank to keep current password' : 'Enter password'}
                  required={!editMode}
                />
                {editMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to keep current password
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Role *</label>
                  <select
                    value={currentStaff.role || ''}
                    onChange={(e) =>
                      setCurrentStaff({
                        ...currentStaff,
                        role: e.target.value,
                        department: e.target.value === "admin" ? [] : currentStaff.department,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      !currentStaff.role ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="restaurant">Restaurant</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Joining *</label>
                  <input
                    type="date"
                    value={currentStaff.dateOfJoining || ''}
                    onChange={(e) =>
                      setCurrentStaff({ ...currentStaff, dateOfJoining: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      !currentStaff.dateOfJoining ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>
              
              {currentStaff.role === "staff" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Departments *</label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                    {departments.map((dept) => (
                      <div key={dept.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`dept-${dept.id}`}
                          checked={
                            currentStaff.department?.some(
                              (d) => d.id === dept.id
                            ) || false
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCurrentStaff({
                                ...currentStaff,
                                department: [
                                  ...(currentStaff.department || []),
                                  { id: dept.id, name: dept.name },
                                ],
                              });
                            } else {
                              setCurrentStaff({
                                ...currentStaff,
                                department: currentStaff.department?.filter(
                                  (d) => d.id !== dept.id
                                ) || [],
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`dept-${dept.id}`} className="text-sm">
                          {dept.name.charAt(0).toUpperCase() + dept.name.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentStaff.role === "restaurant" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Restaurant Role *</label>
                  <select
                    value={currentStaff.restaurantRole || ''}
                    onChange={(e) =>
                      setCurrentStaff({ ...currentStaff, restaurantRole: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      !currentStaff.restaurantRole ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Restaurant Role</option>
                    <option value="staff">Staff</option>
                    <option value="cashier">Cashier</option>
                    <option value="chef">Chef</option>
                  </select>
                </div>
              )}
            </div>
          )}
          
          {/* Personal Details Tab */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valid ID Type (Optional)</label>
                  <select
                    value={currentStaff.validId || ''}
                    onChange={(e) =>
                      setCurrentStaff({ ...currentStaff, validId: e.target.value, idNumber: '' })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  >
                    <option value="">Select ID Type (Optional)</option>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving_license">Driving License</option>
                    <option value="voter_id">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={currentStaff.phoneNumber || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9+\-\s]/g, '');
                      setCurrentStaff({ ...currentStaff, phoneNumber: value });
                    }}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      !currentStaff.phoneNumber ? 'border-red-300 focus:border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number"
                    maxLength="15"
                    required
                  />
                </div>
              </div>
              
              {currentStaff.validId && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {currentStaff.validId === 'aadhar' ? 'Aadhar Number' :
                     currentStaff.validId === 'pan' ? 'PAN Number' :
                     currentStaff.validId === 'passport' ? 'Passport Number' :
                     currentStaff.validId === 'driving_license' ? 'License Number' :
                     currentStaff.validId === 'voter_id' ? 'Voter ID Number' : 'ID Number'}
                  </label>
                  <input
                    type="text"
                    value={currentStaff.idNumber || ''}
                    onChange={(e) => {
                      let value = e.target.value.toUpperCase();
                      // Basic validation based on ID type
                      if (currentStaff.validId === 'aadhar') {
                        value = value.replace(/[^0-9]/g, '').slice(0, 12);
                      } else if (currentStaff.validId === 'pan') {
                        value = value.replace(/[^A-Z0-9]/g, '').slice(0, 10);
                      }
                      setCurrentStaff({ ...currentStaff, idNumber: value });
                    }}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder={`Enter ${currentStaff.validId.replace('_', ' ')} number`}
                    maxLength={currentStaff.validId === 'aadhar' ? '12' : currentStaff.validId === 'pan' ? '10' : '20'}
                  />
                  {currentStaff.validId === 'aadhar' && currentStaff.idNumber && currentStaff.idNumber.length !== 12 && (
                    <p className="text-xs text-red-500 mt-1">Aadhar number should be 12 digits</p>
                  )}
                  {currentStaff.validId === 'pan' && currentStaff.idNumber && currentStaff.idNumber.length !== 10 && (
                    <p className="text-xs text-red-500 mt-1">PAN number should be 10 characters (e.g., ABCDE1234F)</p>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Photo URL (Optional)</label>
                <input
                  type="url"
                  value={currentStaff.photo || ''}
                  onChange={(e) =>
                    setCurrentStaff({ ...currentStaff, photo: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="https://example.com/photo.jpg (optional)"
                />
              </div>
            </div>
          )}
          
          {/* Bank & Salary Tab */}
          {activeTab === 'bank' && (
            <div className="space-y-4">
              <h3 className="text-md font-semibold text-gray-700 border-b pb-2">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    value={currentStaff.bankDetails?.accountNumber || ''}
                    onChange={(e) =>
                      setCurrentStaff({
                        ...currentStaff,
                        bankDetails: {
                          ...(currentStaff.bankDetails || {}),
                          accountNumber: e.target.value
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={currentStaff.bankDetails?.ifscCode || ''}
                    onChange={(e) =>
                      setCurrentStaff({
                        ...currentStaff,
                        bankDetails: {
                          ...(currentStaff.bankDetails || {}),
                          ifscCode: e.target.value
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Enter IFSC code"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={currentStaff.bankDetails?.bankName || ''}
                    onChange={(e) =>
                      setCurrentStaff({
                        ...currentStaff,
                        bankDetails: {
                          ...(currentStaff.bankDetails || {}),
                          bankName: e.target.value
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Enter bank name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    value={currentStaff.bankDetails?.accountHolderName || ''}
                    onChange={(e) =>
                      setCurrentStaff({
                        ...currentStaff,
                        bankDetails: {
                          ...(currentStaff.bankDetails || {}),
                          accountHolderName: e.target.value
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="Enter account holder name"
                  />
                </div>
              </div>
              
              <h3 className="text-md font-semibold text-gray-700 border-b pb-2 mt-6">Salary Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Basic Salary</label>
                  <input
                    type="number"
                    value={currentStaff.salaryDetails?.basicSalary ?? ''}
                    onChange={(e) =>
                      setCurrentStaff({
                        ...currentStaff,
                        salaryDetails: {
                          ...(currentStaff.salaryDetails || {}),
                          basicSalary: Number(e.target.value)
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    min="0"
                    placeholder="Enter basic salary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Allowances</label>
                  <input
                    type="number"
                    value={currentStaff.salaryDetails?.allowances ?? ''}
                    onChange={(e) =>
                      setCurrentStaff({
                        ...currentStaff,
                        salaryDetails: {
                          ...(currentStaff.salaryDetails || {}),
                          allowances: Number(e.target.value)
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    min="0"
                    placeholder="Enter allowances"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Deductions</label>
                  <input
                    type="number"
                    value={currentStaff.salaryDetails?.deductions ?? ''}
                    onChange={(e) =>
                      setCurrentStaff({
                        ...currentStaff,
                        salaryDetails: {
                          ...(currentStaff.salaryDetails || {}),
                          deductions: Number(e.target.value)
                        }
                      })
                    }
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    min="0"
                    placeholder="Enter deductions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Net Salary</label>
                  <input
                    type="number"
                    value={
                      (currentStaff.salaryDetails?.basicSalary || 0) + 
                      (currentStaff.salaryDetails?.allowances || 0) - 
                      (currentStaff.salaryDetails?.deductions || 0)
                    }
                    readOnly
                    className="w-full px-3 py-2 border rounded-md text-sm bg-gray-100"
                    placeholder="Auto-calculated"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border rounded-md w-full sm:w-auto text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md w-full sm:w-auto text-sm sm:text-base"
            >
              {editMode ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffForm;
