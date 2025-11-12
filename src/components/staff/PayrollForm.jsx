import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { DollarSign, Calculator, FileText, Download, Eye, X } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const PayrollForm = () => {
  const { axios } = useAppContext();
  const [staff, setStaff] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [generatedPayrolls, setGeneratedPayrolls] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayrollDetails, setSelectedPayrollDetails] = useState(null);

  useEffect(() => {
    fetchStaff();
    fetchGeneratedPayrolls();
  }, [selectedMonth, selectedYear]);

  const fetchGeneratedPayrolls = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`/api/salary/get?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setGeneratedPayrolls(Array.isArray(data) ? data : data.salaries || []);
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/auth/all-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const staffArray = Array.isArray(data) ? data : data.users || [];
      
      const formattedStaff = staffArray.map(staffMember => {
        const username = staffMember.username || 'Staff Member';
        const department = staffMember.role || 'Staff';
        
        return {
          _id: staffMember._id,
          username,
          department,
          basicSalary: staffMember.salaryDetails?.basicSalary || 0,
          salaryDetails: staffMember.salaryDetails
        };
      });
      
      setStaff(formattedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error loading staff data');
    }
  };



  const generatePayroll = async (staffId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const staffMember = staff.find(s => s._id === staffId);
      
      if (!staffMember) {
        toast.error('Staff member not found');
        setLoading(false);
        return;
      }
      
      const basicSalary = staffMember.salaryDetails?.basicSalary || staffMember.basicSalary || 0;
      
      const { data } = await axios.post('/api/salary/generate', {
        staffId,
        month: selectedMonth,
        year: selectedYear,
        basicSalary
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast.success('Salary generated successfully');
      fetchGeneratedPayrolls();
    } catch (error) {
      console.error('Error generating salary:', error);
      toast.error(error.response?.data?.message || 'Failed to generate salary');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month, 0).getDate();
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-4 sm:p-6 bg-background min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <DollarSign className="text-green-600" size={20} />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Payroll Management</h1>
        </div>

        {/* Month/Year Selection */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Generate Payroll Form */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4">Generate Payroll</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose staff member ({staff.length} available)</option>
                {staff.map((member) => {
                  const staffName = member.username || 'No Name';
                  const department = member.department || 'No Department';
                  const salary = member.salaryDetails?.basicSalary || member.basicSalary || 0;
                  
                  return (
                    <option key={member._id} value={member._id}>
                      {staffName} - {department} (Salary: ₹{salary.toLocaleString()})
                    </option>
                  );
                })}
                {staff.length === 0 && (
                  <option disabled>No staff members found</option>
                )}
              </select>
            </div>
            
            <button
              onClick={() => {
                if (selectedStaff) {
                  generatePayroll(selectedStaff);
                  setSelectedStaff('');
                } else {
                  toast.error('Please select a staff member');
                }
              }}
              disabled={loading || !selectedStaff}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Calculator size={16} />
              {loading ? 'Generating...' : 'Generate Payroll'}
            </button>
          </div>
        </div>

        {/* Generated Payrolls */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-blue-600" size={16} />
            <h2 className="text-base sm:text-lg font-semibold">Generated Payrolls</h2>
          </div>

          {generatedPayrolls.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calculator size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Payrolls Generated</p>
              <p className="text-sm">Generate payroll for staff members above to see results here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedPayrolls.map(payroll => {
                // Handle case where staffId is an object containing staff data
                const staffData = typeof payroll.staffId === 'object' && payroll.staffId !== null 
                  ? payroll.staffId 
                  : staff.find(s => s._id === (payroll.staffId?.$oid || payroll.staffId));
                
                const staffName = staffData?.username || 'Unknown Staff';
                const staffDept = staffData?.role || staffData?.department || 'Unknown Dept';
                
                return (
                  <div key={payroll._id?.$oid || payroll._id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{staffName}</h3>
                        <p className="text-sm text-gray-600">{staffDept} • {months[payroll.month - 1]} {payroll.year}</p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPayrollDetails(payroll);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                      <div>
                        <p className="text-gray-600">Total Salary</p>
                        <p className="font-semibold text-green-600">₹{(payroll.grossSalary || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Paid Days</p>
                        <p className="font-semibold">{payroll.attendanceData?.presentDays || 0}/{payroll.attendanceData?.totalDays || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Deductions</p>
                        <p className="font-semibold text-red-600">₹{(payroll.totalDeductions || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Net Salary</p>
                        <p className={`font-bold ${payroll.netSalary < 0 ? 'text-red-600' : 'text-blue-600'}`}>₹{(payroll.netSalary || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payroll Details Modal */}
        {showDetailsModal && selectedPayrollDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-3 sm:p-4 border-b">
                <h3 className="text-base sm:text-lg font-semibold">Payroll Details - {months[selectedPayrollDetails.month - 1]} {selectedPayrollDetails.year}</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
                {/* Summary */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-green-600">₹{selectedPayrollDetails.totalSalary?.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Total Salary</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{selectedPayrollDetails.paidDays}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Paid Days</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-red-600">₹{selectedPayrollDetails.deductions?.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Deductions</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg sm:text-2xl font-bold text-purple-600">₹{selectedPayrollDetails.netSalary?.toLocaleString()}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Net Salary</p>
                  </div>
                </div>

                {/* Daily Breakdown */}
                <h4 className="text-sm sm:text-base font-semibold mb-3">Daily Attendance Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 sm:px-3 py-2 text-left border">Date</th>
                        <th className="px-2 sm:px-3 py-2 text-center border">Status</th>
                        <th className="px-2 sm:px-3 py-2 text-center border">Leave Type</th>
                        <th className="px-2 sm:px-3 py-2 text-right border">Deduction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPayrollDetails.details?.map(detail => (
                        <tr key={detail._id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-3 py-2 border">
                            {new Date(detail.date).toLocaleDateString('en-IN', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-center border">
                            <span className={`px-1 sm:px-2 py-1 rounded-full text-xs ${
                              detail.status === 'present' 
                                ? 'bg-green-100 text-green-800' 
                                : detail.status === 'leave'
                                ? 'bg-blue-100 text-blue-800'
                                : detail.status === 'half-day'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {detail.status}
                            </span>
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-center border">
                            {detail.leaveType ? (
                              <span className="text-xs bg-gray-100 px-1 sm:px-2 py-1 rounded">
                                {detail.leaveType}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-2 sm:px-3 py-2 text-right border">
                            {detail.deduction > 0 ? (
                              <span className="text-red-600">₹{detail.deduction}</span>
                            ) : (
                              <span className="text-green-600">₹0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayrollForm;
