import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Send, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CashTransactionCard = ({ onTransactionAdded }) => {
  const [cashData, setCashData] = useState({
    cashInReception: 0,
    totalReceived: 0,
    totalSentToOffice: 0,
    transactions: []
  });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'KEEP',
    description: '',
    isCustomerPayment: false,
    keepPercentage: 30
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCashData();
  }, []);

  const fetchCashData = async () => {
    try {
      const response = await fetch('https://ashoka-api.shineinfosolutions.in/api/cash-transactions/cash-at-reception');
      console.log('Cash transactions API response:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Cash transactions API data:', data);
        setCashData(data);
      } else {
        console.log('Cash transactions API failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching cash data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://ashoka-api.shineinfosolutions.in/api/cash-transactions/add-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: Number(formData.amount)
        })
      });

      if (response.ok) {
        if (formData.isCustomerPayment && Number(formData.amount) > 0) {
          const keepAmount = Number(formData.amount) * formData.keepPercentage / 100;
          const sendAmount = Number(formData.amount) * (100 - formData.keepPercentage) / 100;
          
          // Add KEEP transaction for the amount kept at reception
          if (keepAmount > 0) {
            await fetch('https://ashoka-api.shineinfosolutions.in/api/cash-transactions/add-transaction', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: keepAmount,
                type: 'KEEP',
                description: `Customer Payment - Kept at Reception (${formData.keepPercentage}%)`
              })
            });
          }
          
          // Add SENT transaction for the amount sent to office
          if (sendAmount > 0) {
            await fetch('https://ashoka-api.shineinfosolutions.in/api/cash-transactions/add-transaction', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: sendAmount,
                type: 'SENT',
                description: `Customer Payment - Sent to Office (${100 - formData.keepPercentage}%)`
              })
            });
          }
          toast.success(`Payment split: ₹${keepAmount.toFixed(0)} kept, ₹${sendAmount.toFixed(0)} sent to office`);
        } else {
          toast.success('Transaction added successfully!');
        }
        setFormData({ amount: '', type: 'KEEP', description: '', isCustomerPayment: false, keepPercentage: 30 });
        setShowForm(false);
        fetchCashData();
        if (onTransactionAdded) onTransactionAdded();
      } else {
        toast.error('Failed to add transaction');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error adding transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-extrabold text-[#1f2937] flex items-center gap-2">
          <Wallet className="text-green-600" size={24} />
          Cash Management
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Cash at Reception</p>
              <p className="text-2xl font-bold">₹{cashData.cashInReception?.toLocaleString() || 0}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Received</p>
              <p className="text-2xl font-bold">₹{cashData.totalReceived?.toLocaleString() || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Total Sent</p>
              <p className="text-2xl font-bold">₹{cashData.totalSentToOffice?.toLocaleString() || 0}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Transaction Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Add Cash Transaction</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={formData.isCustomerPayment}
                >
                  <option value="KEEP">Keep at Reception</option>
                  <option value="SENT">Send to Office</option>
                </select>
              </div>
            </div>
            
            {/* Customer Payment Toggle */}
            <div className="col-span-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isCustomerPayment}
                  onChange={(e) => setFormData({...formData, isCustomerPayment: e.target.checked, description: e.target.checked ? 'Customer Payment' : ''})}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Customer Payment (Auto Split)
                </label>
              </div>
            </div>

            {/* Keep Percentage for Customer Payment */}
            {formData.isCustomerPayment && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>Send to Office: {100 - formData.keepPercentage}% (₹{formData.amount ? (Number(formData.amount) * (100 - formData.keepPercentage) / 100).toFixed(0) : 0})</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            <div className={formData.isCustomerPayment ? 'col-span-2' : ''}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus size={16} />
                )}
                {loading ? 'Adding...' : 'Add Transaction'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recent Transactions */}
      {cashData.transactions && cashData.transactions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {cashData.transactions.slice(0, 5).map((transaction, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {transaction.type === 'KEEP' ? (
                    <Wallet className="w-5 h-5 text-green-600" />
                  ) : (
                    <Send className="w-5 h-5 text-orange-600" />
                  )}
                  <div>
                    <p className="font-medium">₹{transaction.amount?.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{transaction.description || transaction.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${transaction.type === 'KEEP' ? 'text-green-600' : 'text-orange-600'}`}>
                    {transaction.type === 'KEEP' ? 'Kept' : 'Sent'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CashTransactionCard;
