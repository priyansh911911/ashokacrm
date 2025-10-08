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
    sentToOffice: 0,
    sourceBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'KEEP',
    source: 'OTHER',
    description: '',
    isCustomerPayment: false,
    keepPercentage: 30
  });
  const [formLoading, setFormLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [dateFilter, setDateFilter] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  const fetchCashData = async (filter = dateFilter, date = customDate, source = sourceFilter) => {
    setLoading(true);
    try {
      let url = `/api/cash-transactions/cash-at-reception?filter=${filter}`;
      if (filter === 'date' && date) {
        url += `&date=${date}`;
      }
      if (source && source !== 'all') {
        url += `&source=${source}`;
      }
      
      const response = await axios.get(url);
      const data = response.data;
      console.log('🔍 Cash Management - Raw API Data:', data);
      
      // Calculate totals from all sources
      let totalReceived = 0;
      let totalSent = 0;
      let cashInReception = 0;
      let allTransactions = [];
      let sourceBreakdown = [];
      
      Object.entries(data.cards || {}).forEach(([source, sourceData]) => {
        console.log(`📊 Processing ${source}:`, sourceData.summary);
        totalReceived += sourceData.summary?.totalReceived || 0;
        totalSent += sourceData.summary?.totalSent || 0;
        cashInReception += sourceData.summary?.cashInReception || 0;
        allTransactions = [...allTransactions, ...(sourceData.transactions || [])];
        
        // Add to source breakdown (show all sources)
        const receivedTotal = sourceData.summary?.totalReceived || 0;
        sourceBreakdown.push({ _id: source, total: receivedTotal });
      });
      
      const finalData = {
        todayRevenue: totalReceived,
        cashInHand: cashInReception,
        cardPayments: 0,
        upiPayments: 0,
        recentTransactions: allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        expenses: [],
        sentToOffice: totalSent,
        sourceBreakdown
      };
      
      console.log('💰 Final Cash Data:', finalData);
      setCashData(finalData);
    } catch (error) {
      console.error('Cash Management API Error:', error);
      setCashData({
        todayRevenue: 0,
        cashInHand: 0,
        cardPayments: 0,
        upiPayments: 0,
        recentTransactions: [],
        expenses: [],
        sentToOffice: 0,
        sourceBreakdown: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      if (formData.isCustomerPayment && Number(formData.amount) > 0) {
        const totalAmount = Number(formData.amount);
        const keepAmount = totalAmount * formData.keepPercentage / 100;
        const sendAmount = totalAmount * (100 - formData.keepPercentage) / 100;
        
        if (keepAmount > 0) {
          await axios.post('/api/cash-transactions/add-transaction', {
            amount: keepAmount,
            type: 'KEEP',
            source: formData.source,
            description: `Customer Payment - Kept (${formData.keepPercentage}%)`
          });
        }
        
        if (sendAmount > 0) {
          await axios.post('/api/cash-transactions/add-transaction', {
            amount: sendAmount,
            type: 'SENT',
            source: formData.source,
            description: `Customer Payment - Sent (${100 - formData.keepPercentage}%)`
          });
        }
        
        toast.success(`Payment split: ₹${keepAmount.toFixed(0)} kept, ₹${sendAmount.toFixed(0)} sent`);
      } else {
        await axios.post('/api/cash-transactions/add-transaction', {
          amount: Number(formData.amount),
          type: formData.type,
          source: formData.source,
          description: formData.description
        });
        
        toast.success(formData.type === 'SENT' ? `₹${formData.amount} sent to office` : 'Transaction added');
      }
      
      setFormData({ amount: '', type: 'KEEP', source: 'OTHER', description: '', isCustomerPayment: false, keepPercentage: 30 });
      setShowTransactionForm(false);
      
      // Refresh data
      await fetchCashData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading Cash Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{backgroundColor: 'hsl(45, 43%, 58%)'}}>
                  <IndianRupee className="h-8 w-8 text-white" />
                </div>
                Cash Management
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage your cash flow operations</p>
            </div>
            <button 
              onClick={() => setShowTransactionForm(true)}
              className="text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
              style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'hsl(45, 32%, 46%)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'hsl(45, 43%, 58%)'}
            >
              <IndianRupee className="h-5 w-5" />
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {dateFilter === 'today' ? "Today's Revenue" : 
                   dateFilter === 'week' ? "This Week's Revenue" :
                   dateFilter === 'month' ? "This Month's Revenue" :
                   dateFilter === 'year' ? "This Year's Revenue" : "Revenue"}
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹{cashData.todayRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Total received</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash At Reception</p>
                <p className="text-3xl font-bold mt-2" style={{
                  color: cashData.cashInHand >= 0 ? 'hsl(45, 43%, 58%)' : '#dc2626'
                }}>
                  ₹{Math.abs(cashData.cashInHand).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {cashData.cashInHand >= 0 ? 'Available cash' : 'Cash deficit'}
                </p>
              </div>
              <div className="p-3 rounded-full" style={{
                backgroundColor: cashData.cashInHand >= 0 ? 'hsl(45, 100%, 90%)' : '#fef2f2'
              }}>
                {cashData.cashInHand >= 0 ? 
                  <IndianRupee className="h-6 w-6" style={{color: 'hsl(45, 43%, 58%)'}} /> :
                  <AlertCircle className="h-6 w-6 text-red-600" />
                }
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cash In Office</p>
                <p className="text-3xl font-bold mt-2" style={{color: 'hsl(45, 43%, 58%)'}}>₹{cashData.sentToOffice.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">Sent to office</p>
              </div>
              <div className="p-3 rounded-full" style={{backgroundColor: 'hsl(45, 100%, 90%)'}}>
                <IndianRupee className="h-6 w-6" style={{color: 'hsl(45, 43%, 58%)'}} />
              </div>
            </div>
          </div>
        </div>

        {/* Source Breakdown Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {['RESTAURANT', 'ROOM_BOOKING', 'BANQUET + PARTY', 'OTHER'].map(source => {
            const sourceData = (cashData.sourceBreakdown || []).find(s => s._id === source) || { total: 0 };
            const colors = {
              'RESTAURANT': { bg: 'hsl(45, 100%, 90%)', text: 'hsl(45, 43%, 58%)', border: 'hsl(45, 43%, 58%)' },
              'ROOM_BOOKING': { bg: 'hsl(45, 100%, 90%)', text: 'hsl(45, 43%, 58%)', border: 'hsl(45, 43%, 58%)' },
              'BANQUET + PARTY': { bg: 'hsl(45, 100%, 90%)', text: 'hsl(45, 43%, 58%)', border: 'hsl(45, 43%, 58%)' },
              'OTHER': { bg: 'hsl(45, 100%, 90%)', text: 'hsl(45, 43%, 58%)', border: 'hsl(45, 43%, 58%)' }
            };
            const color = colors[source];
            
            return (
              <div key={source} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {source.replace('_', ' ').replace(' + ', ' & ')}
                    </p>
                    <p className="text-2xl font-bold mt-2" style={{color: color.text}}>
                      ₹{sourceData.total.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Revenue from {source.toLowerCase().replace('_', ' ')}
                    </p>
                  </div>
                  <div className="p-3 rounded-full" style={{backgroundColor: color.bg}}>
                    <IndianRupee className="h-5 w-5" style={{color: color.text}} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <div className="flex gap-2 items-center">
              <select 
                value={dateFilter} 
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  fetchCashData(e.target.value, customDate, sourceFilter);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="date">Custom Date</option>
              </select>
              {dateFilter === 'date' && (
                <input 
                  type="date" 
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    fetchCashData('date', e.target.value, sourceFilter);
                  }}
                  className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
                />
              )}
              <select 
                value={sourceFilter} 
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  fetchCashData(dateFilter, customDate, e.target.value);
                }}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
                <option value="all">All Sources</option>
                <option value="RESTAURANT">Restaurant</option>
                <option value="ROOM_BOOKING">Room Booking</option>
                <option value="BANQUET + PARTY">Banquet + Party</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {cashData.recentTransactions.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                    <th className="text-left p-3 font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Amount</th>
                    <th className="text-left p-3 font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Type</th>
                    <th className="text-left p-3 font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Source</th>
                    <th className="text-left p-3 font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Description</th>
                    <th className="text-left p-3 font-medium" style={{color: 'hsl(45, 100%, 30%)'}}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {cashData.recentTransactions
                    .filter(transaction => sourceFilter === 'all' || transaction.source === sourceFilter)
                    .slice(0, 10).map((transaction, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="p-3">
                        <span className="font-semibold" style={{color: transaction.type === 'KEEP' ? '#16a34a' : 'hsl(45, 43%, 58%)'}}>
                          ₹{transaction.amount?.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                          backgroundColor: transaction.type === 'KEEP' ? '#dcfce7' : 'hsl(45, 100%, 90%)',
                          color: transaction.type === 'KEEP' ? '#166534' : 'hsl(45, 100%, 20%)'
                        }}>
                          {transaction.type === 'KEEP' ? 'Keep' : 'Sent'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">
                        {transaction.source?.replace('_', ' ')}
                      </td>
                      <td className="p-3 text-gray-500">
                        {transaction.description || '-'}
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No transactions found</p>
                <p className="text-sm">{sourceFilter !== 'all' ? `No transactions found for ${sourceFilter.replace('_', ' ')}` : 'Add your first transaction to get started'}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Add Cash Transaction</h3>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Transaction Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={formData.isCustomerPayment}
                >
                  <option value="KEEP">Keep at Reception</option>
                  <option value="SENT">Send to Office</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="RESTAURANT">Restaurant</option>
                  <option value="ROOM_BOOKING">Room Booking</option>
                  <option value="BANQUET + PARTY">Banquet + Party</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.isCustomerPayment}
                    onChange={(e) => setFormData({...formData, isCustomerPayment: e.target.checked, description: e.target.checked ? 'Customer Payment' : ''})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Customer Payment (Auto Split)
                  </label>
                </div>
              </div>
              {formData.isCustomerPayment && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
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
                  <div className="flex justify-between text-xs mt-1 text-gray-500">
                    <span>0%</span>
                    <span>Send to Office: {100 - formData.keepPercentage}% (₹{formData.amount ? (Number(formData.amount) * (100 - formData.keepPercentage) / 100).toFixed(0) : 0})</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={formLoading || !formData.amount}
                  className="flex-1 text-white py-2 rounded-lg disabled:opacity-50 transition-colors"
                  style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                  onMouseEnter={(e) => !e.target.disabled && (e.target.style.backgroundColor = 'hsl(45, 32%, 46%)')}
                  onMouseLeave={(e) => !e.target.disabled && (e.target.style.backgroundColor = 'hsl(45, 43%, 58%)')}
                >
                  {formLoading ? 'Adding...' : 'Add Transaction'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionForm(false);
                    setFormData({ amount: '', type: 'KEEP', source: 'OTHER', description: '', isCustomerPayment: false, keepPercentage: 30 });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashManagement;