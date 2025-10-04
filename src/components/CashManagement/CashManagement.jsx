import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { IndianRupee, CreditCard, Smartphone, TrendingUp, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';


const CashManagement = () => {
  const { axios } = useAppContext();
  const [cashData, setCashData] = useState({
    todayRevenue: 0,
    cashInHand: 0,
    cardPayments: 0,
    upiPayments: 0,
    recentTransactions: [],
    expenses: [],
    sentToOffice: 0
  });
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'KEEP',
    description: '',
    isCustomerPayment: false,
    keepPercentage: 30
  });
  const [formLoading, setFormLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const fetchCashData = async () => {
      try {
        console.log('🔄 Cash Management: Fetching data...');
        const cashAtReceptionRes = await axios.get('/api/cash-transactions/cash-at-reception');
        console.log('📡 Cash Management API Response:', cashAtReceptionRes.status, cashAtReceptionRes.data);
        
        const data = cashAtReceptionRes.data;
        
        console.log('📊 Cash Management Data Structure:');
        console.log('- totalRevenue:', data.totalRevenue);
        console.log('- cashAtReception:', data.cashAtReception);
        console.log('- cardPayments:', data.cardPayments);
        console.log('- upiPayments:', data.upiPayments);
        console.log('- recentTransactions:', data.recentTransactions?.length || 0);
        console.log('- expenses:', data.expenses?.length || 0);
        console.log('- sentToOffice from API:', data.sentToOffice);
        
        // Calculate sentToOffice from transactions if not provided by backend
        const calculatedSentToOffice = (data.recentTransactions || []).reduce((total, transaction) => {
          console.log('Transaction:', transaction.type, transaction.amount);
          return transaction.type === 'SENT' ? total + (parseFloat(transaction.amount) || 0) : total;
        }, 0);
        console.log('- calculated sentToOffice:', calculatedSentToOffice);
        console.log('- backend sentToOffice:', data.sentToOffice);
        
        setCashData({
          todayRevenue: data.totalRevenue || data.totalReceived || 0,
          cashInHand: data.cashAtReception || data.cashInReception || 0,
          cardPayments: data.cardPayments || 0,
          upiPayments: data.upiPayments || 0,
          recentTransactions: data.recentTransactions || [],
          expenses: data.expenses || [],
          sentToOffice: data.totalSentToOffice || data.sentToOffice || calculatedSentToOffice || 0
        });
        console.log('✅ Cash Management: Data loaded successfully');
      } catch (error) {
        console.error('🚨 Cash Management API Error:', error.response?.status, error.response?.data || error.message);
        // Set default data on error
        setCashData({
          todayRevenue: 0,
          cashInHand: 0,
          cardPayments: 0,
          upiPayments: 0,
          recentTransactions: [],
          expenses: [],
          sentToOffice: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCashData();
  }, [axios]);

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    setFormLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('🔄 Transaction Submit:', {
        amount: formData.amount,
        type: formData.type,
        isCustomerPayment: formData.isCustomerPayment,
        keepPercentage: formData.keepPercentage
      });
      
      if (formData.isCustomerPayment && Number(formData.amount) > 0) {
        const totalAmount = Number(formData.amount);
        const keepAmount = totalAmount * formData.keepPercentage / 100;
        const sendAmount = totalAmount * (100 - formData.keepPercentage) / 100;
        
        console.log('💰 Customer Payment Split:', { totalAmount, keepAmount, sendAmount });
        
        if (keepAmount > 0) {
          console.log('📤 Sending KEEP transaction...');
          const keepResponse = await axios.post('/api/cash-transactions/add-transaction', {
            amount: keepAmount,
            type: 'KEEP',
            description: `Customer Payment - Kept at Reception (${formData.keepPercentage}%)`
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ KEEP transaction response:', keepResponse.data);
        }
        
        if (sendAmount > 0) {
          console.log('📤 Sending SENT transaction...');
          const sentResponse = await axios.post('/api/cash-transactions/add-transaction', {
            amount: sendAmount,
            type: 'SENT',
            description: `Customer Payment - Sent to Office (${100 - formData.keepPercentage}%)`
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ SENT transaction response:', sentResponse.data);
        }
        
        toast.success(`Payment split: ₹${keepAmount.toFixed(0)} kept, ₹${sendAmount.toFixed(0)} sent to office`);
      } else {
        console.log('📤 Sending single transaction:', formData.type);
        const response = await axios.post('/api/cash-transactions/add-transaction', {
          ...formData,
          amount: Number(formData.amount)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Single transaction response:', response.data);
        
        if (formData.type === 'SENT') {
          toast.success(`₹${formData.amount} sent to office successfully!`);
        } else {
          toast.success('Transaction added successfully!');
        }
      }
      
      setFormData({ amount: '', type: 'KEEP', description: '', isCustomerPayment: false, keepPercentage: 30 });
      setShowTransactionForm(false);
      
      // Refresh data
      setLoading(true);
      const cashAtReceptionRes = await axios.get('/api/cash-transactions/cash-at-reception');
      const data = cashAtReceptionRes.data;
      const calculatedSentToOffice = (data.recentTransactions || []).reduce((total, transaction) => {
        return transaction.type === 'SENT' ? total + (parseFloat(transaction.amount) || 0) : total;
      }, 0);
      console.log('Refresh - calculated sentToOffice:', calculatedSentToOffice);
      
      setCashData({
        todayRevenue: data.totalRevenue || data.totalReceived || 0,
        cashInHand: data.cashAtReception || data.cashInReception || 0,
        cardPayments: data.cardPayments || 0,
        upiPayments: data.upiPayments || 0,
        recentTransactions: data.recentTransactions || [],
        expenses: data.expenses || [],
        sentToOffice: data.totalSentToOffice || data.sentToOffice || calculatedSentToOffice || 0
      });
      setLoading(false);
    } catch (error) {
      console.error('🚨 Transaction Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Please contact support.');
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Transaction failed: ${error.message}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const handleViewAnalytics = () => {
    setShowAnalytics(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, hsl(45, 100%, 95%), hsl(45, 100%, 90%)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{borderColor: 'hsl(45, 43%, 58%)'}}></div>
          <p className="text-lg font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Loading Cash Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{background: 'linear-gradient(to bottom right, hsl(45, 100%, 95%), hsl(45, 100%, 90%))'}}>      {/* Header */}
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3" style={{color: 'hsl(45, 100%, 20%)'}}>
            <IndianRupee className="h-10 w-10" style={{color: 'hsl(45, 43%, 58%)'}} />
            Cash Management
          </h1>
          <p style={{color: 'hsl(45, 100%, 30%)'}}>Monitor and manage your cash flow operations</p>
        </div>
        <button 
          onClick={() => setShowTransactionForm(true)}
          className="px-6 py-3 rounded-lg transition-colors hover:opacity-90 font-semibold flex items-center gap-2"
          style={{backgroundColor: 'hsl(45, 43%, 58%)', color: 'white'}}
        >
          💰 Add Transaction
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Today's Revenue</p>
              <p className="text-3xl font-bold text-green-600">₹{cashData.todayRevenue.toLocaleString()}</p>
              <p className="text-sm" style={{color: 'hsl(45, 100%, 40%)'}}>Total revenue today</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4" style={{borderLeftColor: 'hsl(45, 43%, 58%)'}}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Cash At Reception</p>
              <p className={`text-3xl font-bold ${cashData.cashInHand >= 0 ? '' : 'text-red-600'}`} style={cashData.cashInHand >= 0 ? {color: 'hsl(45, 43%, 58%)'} : {}}>
                ₹{Math.abs(cashData.cashInHand).toLocaleString()}
              </p>
              <p className="text-sm" style={{color: 'hsl(45, 100%, 40%)'}}>
                {cashData.cashInHand >= 0 ? 'Available cash' : 'Cash deficit'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${cashData.cashInHand >= 0 ? '' : 'bg-red-100'}`} style={cashData.cashInHand >= 0 ? {backgroundColor: 'hsl(45, 100%, 90%)'} : {}}>
              {cashData.cashInHand >= 0 ? 
                <IndianRupee className="h-6 w-6" style={{color: 'hsl(45, 43%, 58%)'}} /> :
                <AlertCircle className="h-6 w-6 text-red-600" />
              }
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Cash In Office</p>
              <p className="text-3xl font-bold text-purple-600">₹{cashData.sentToOffice.toLocaleString()}</p>
              <p className="text-sm" style={{color: 'hsl(45, 100%, 40%)'}}>Sent to office</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <IndianRupee className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>


      </div>

      {/* Management Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
          <h3 className="text-lg font-bold mb-3" style={{color: 'hsl(45, 100%, 20%)'}}>
            Cash Flow Analysis
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{color: 'hsl(45, 100%, 30%)'}}>Net Cash Flow:</span>
              <span className="font-bold text-green-600">
                ₹{(cashData.todayRevenue - (cashData.todayRevenue * 0.2)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{color: 'hsl(45, 100%, 30%)'}}>Digital vs Cash:</span>
              <span className="font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
                {cashData.todayRevenue > 0 ? Math.round(((cashData.cardPayments + cashData.upiPayments) / cashData.todayRevenue) * 100) : 0}% Digital
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{color: 'hsl(45, 100%, 30%)'}}>Cash Efficiency:</span>
              <span className="font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
                {cashData.todayRevenue > 0 ? Math.round((cashData.cashInHand / cashData.todayRevenue) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-xl shadow-lg p-4" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
          <h3 className="text-lg font-bold mb-3" style={{color: 'hsl(45, 100%, 20%)'}}>
            Cash Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm" style={{color: 'hsl(45, 100%, 30%)'}}>Reception Cash</span>
              </div>
              <span className="text-sm font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
                ₹{Math.abs(cashData.cashInHand).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm" style={{color: 'hsl(45, 100%, 30%)'}}>Office Cash</span>
              </div>
              <span className="text-sm font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
                ₹{cashData.sentToOffice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-2" style={{borderColor: 'hsl(45, 100%, 90%)'}}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: 'hsl(45, 43%, 58%)'}}></div>
                <span className="text-sm font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>Total Cash</span>
              </div>
              <span className="text-sm font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
                ₹{(Math.abs(cashData.cashInHand) + cashData.sentToOffice).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>



      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{color: 'hsl(45, 100%, 20%)'}}>
              Add Cash Transaction
            </h3>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 30%)'}}>Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{borderColor: 'hsl(45, 100%, 85%)', '--tw-ring-color': 'hsl(45, 43%, 58%)'}}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 30%)'}}>Transaction Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{borderColor: 'hsl(45, 100%, 85%)', '--tw-ring-color': 'hsl(45, 43%, 58%)'}}
                  disabled={formData.isCustomerPayment}
                >
                  <option value="KEEP">Keep at Reception</option>
                  <option value="SENT">Send to Office</option>
                </select>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isCustomerPayment}
                    onChange={(e) => setFormData({...formData, isCustomerPayment: e.target.checked, description: e.target.checked ? 'Customer Payment' : ''})}
                    className="h-4 w-4 rounded"
                    style={{color: 'hsl(45, 43%, 58%)', '--tw-ring-color': 'hsl(45, 43%, 58%)', borderColor: 'hsl(45, 100%, 85%)'}}
                  />
                  <label className="text-sm font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>
                    Customer Payment (Auto Split)
                  </label>
                </div>
              </div>
              {formData.isCustomerPayment && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 30%)'}}>
                    Keep at Reception: {formData.keepPercentage}% (₹{formData.amount ? (Number(formData.amount) * formData.keepPercentage / 100).toFixed(0) : 0})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.keepPercentage}
                    onChange={(e) => setFormData({...formData, keepPercentage: Number(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs mt-1" style={{color: 'hsl(45, 100%, 40%)'}}>
                    <span>0%</span>
                    <span>Send to Office: {100 - formData.keepPercentage}% (₹{formData.amount ? (Number(formData.amount) * (100 - formData.keepPercentage) / 100).toFixed(0) : 0})</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'hsl(45, 100%, 30%)'}}>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{borderColor: 'hsl(45, 100%, 85%)', '--tw-ring-color': 'hsl(45, 43%, 58%)'}}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formLoading || !formData.amount}
                  className="flex-1 text-white py-2 rounded-lg disabled:opacity-50 transition-opacity"
                  style={{background: 'linear-gradient(to right, hsl(45, 43%, 58%), hsl(45, 32%, 46%))'}}
                >
                  {formLoading ? 'Adding...' : 'Add Transaction'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setFormData({ amount: '', type: 'KEEP', description: '', isCustomerPayment: false, keepPercentage: 30 });
                  }}
                  className="flex-1 text-white py-2 rounded-lg transition-opacity"
                  style={{backgroundColor: 'hsl(45, 100%, 50%)'}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
                📈 Cash Management Report
              </h3>
              <button
                onClick={() => setShowReport(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800">Total Revenue</h4>
                  <p className="text-2xl font-bold text-green-600">₹{cashData.todayRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800">Cash at Reception</h4>
                  <p className="text-2xl font-bold text-blue-600">₹{Math.abs(cashData.cashInHand).toLocaleString()}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Payment Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Card Payments:</span>
                    <span className="font-semibold">₹{cashData.cardPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>UPI Payments:</span>
                    <span className="font-semibold">₹{cashData.upiPayments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash Payments:</span>
                    <span className="font-semibold">₹{(cashData.todayRevenue - cashData.cardPayments - cashData.upiPayments).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{color: 'hsl(45, 100%, 20%)'}}>
                📊 Cash Analytics
              </h3>
              <button
                onClick={() => setShowAnalytics(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Payment Method Distribution</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Digital Payments:</span>
                    <span className="font-bold">
                      {cashData.todayRevenue > 0 ? Math.round(((cashData.cardPayments + cashData.upiPayments) / cashData.todayRevenue) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cash Payments:</span>
                    <span className="font-bold">
                      {cashData.todayRevenue > 0 ? Math.round(((cashData.todayRevenue - cashData.cardPayments - cashData.upiPayments) / cashData.todayRevenue) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Cash Flow Efficiency</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reception Retention:</span>
                    <span className="font-bold">
                      {cashData.todayRevenue > 0 ? Math.round((Math.abs(cashData.cashInHand) / cashData.todayRevenue) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Office Transfer:</span>
                    <span className="font-bold">60%</span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Transaction Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Transactions:</span>
                    <span className="font-bold">{cashData.recentTransactions.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Transaction:</span>
                    <span className="font-bold">
                      ₹{cashData.recentTransactions.length > 0 ? Math.round(cashData.todayRevenue / cashData.recentTransactions.length).toLocaleString() : 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-3">Performance Metrics</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Revenue Growth:</span>
                    <span className="font-bold text-green-600">+12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Cash Utilization:</span>
                    <span className="font-bold">
                      {cashData.todayRevenue > 0 ? Math.round((cashData.todayRevenue / (cashData.todayRevenue + Math.abs(cashData.cashInHand))) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashManagement;