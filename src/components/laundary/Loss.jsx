import React, { useState, useEffect } from "react";
import { Plus, AlertTriangle, Search, Filter, X, Save } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast, { Toaster } from 'react-hot-toast';

const Loss = () => {
  const { axios } = useAppContext();
  const [lossReports, setLossReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoss, setEditingLoss] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [formData, setFormData] = useState({
    orderId: '',
    itemId: '',
    itemName: '',
    quantity: 1,
    lossReason: '',
    notes: ''
  });

  const getAuthToken = () => localStorage.getItem("token");

  useEffect(() => {
    fetchLossReports();
  }, []);

  const fetchLossReports = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await axios.get('/api/laundry/loss-reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reports = Array.isArray(response.data) ? response.data : response.data?.data || [];
      setLossReports(reports);
    } catch (error) {
      console.error("Error fetching loss reports:", error);
      toast.error('Failed to fetch loss reports');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) {
      toast.error('Authentication token not found');
      return;
    }

    const loadingToast = toast.loading('Reporting damage/loss...');
    try {
      await axios.post(`/api/laundry/damage-loss/${formData.orderId}/${formData.itemId}`, {
        damageReported: formData.lossReason !== 'lost_item',
        damageNotes: formData.notes,
        isLost: formData.lossReason === 'lost_item',
        lossNote: formData.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Damage/Loss reported successfully!', { id: loadingToast });
      
      setShowForm(false);
      setEditingLoss(null);
      resetForm();
      fetchLossReports();
    } catch (error) {
      console.error("Error reporting damage/loss:", error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`, { id: loadingToast });
    }
  };



  const resetForm = () => {
    setFormData({
      orderId: '',
      itemId: '',
      itemName: '',
      quantity: 1,
      lossReason: '',
      notes: ''
    });
  };

  const filteredReports = lossReports.filter(report => {
    const matchesSearch = report.guestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report._id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.roomNumber?.toString().includes(searchQuery);
    const matchesFilter = filterStatus === "All" || 
                         (filterStatus === "lost" && report.lostItems?.length > 0);
    return matchesSearch && matchesFilter;
  });



  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{backgroundColor: 'hsl(45, 100%, 95%)', fontFamily: 'sans-serif', color: 'hsl(45, 100%, 20%)'}}>
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
          <h1 className="text-3xl font-extrabold mb-4 sm:mb-0 flex items-center" style={{color: 'hsl(45, 100%, 20%)'}}>
            <AlertTriangle className="mr-3 text-red-500" size={32} />
            Loss Management
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full shadow-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
          >
            <Plus size={18} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Report Loss</span>
            <span className="sm:hidden">Report</span>
          </button>
        </header>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by guest name, order ID, or room number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="All">All Reports</option>
                <option value="damaged">Damaged Items</option>
                <option value="lost">Lost Items</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loss Reports Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
          {filteredReports.length === 0 ? (
            <div className="p-8 text-center text-text">
              No loss reports found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{backgroundColor: 'hsl(45, 100%, 80%)'}}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Order / Guest
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Damaged Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Lost Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                  {filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {report.orderId?._id?.toString().slice(-6) || report._id?.toString().slice(-6) || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">{report.guestName || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {report.roomNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-red-600 mb-1">Lost Items:</div>
                          {report.lostItems?.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="font-medium text-gray-900">{item.itemName}</div>
                              <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                              <div className="text-xs text-green-600">₹{item.calculatedAmount}</div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {report.status || 'Reported'}
                          </span>
                          {report.lossNote && (
                            <div className="text-xs text-gray-500 mt-1">{report.lossNote}</div>
                          )}
                          <div className="text-xs text-orange-600 mt-1">Total Loss: ₹{report.totalLossAmount}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingLoss ? 'Edit Loss Report' : 'Report New Loss'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingLoss(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                  <input
                    type="text"
                    value={formData.orderId}
                    onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter laundry order ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                  <input
                    type="text"
                    value={formData.itemId}
                    onChange={(e) => setFormData({...formData, itemId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter item ID from order"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={formData.lossReason}
                    onChange={(e) => setFormData({...formData, lossReason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="damaged">Damaged Item</option>
                    <option value="lost_item">Lost Item</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Report Damage/Loss
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingLoss(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default Loss;
