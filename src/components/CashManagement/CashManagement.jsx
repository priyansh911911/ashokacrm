import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import CashTransactionCard from '../CashTransaction/CashTransactionCard';

const CashManagement = () => {
  const { axios } = useAppContext();
  const [cashData, setCashData] = useState({
    todayRevenue: 0,
    cashInHand: 0,
    cardPayments: 0,
    upiPayments: 0,
    recentTransactions: [],
    expenses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashData = async () => {
      try {
        const cashAtReceptionRes = await axios.get('/api/cash-transactions/cash-at-reception');
        const data = cashAtReceptionRes.data;
        
        setCashData({
          todayRevenue: data.totalRevenue || 0,
          cashInHand: data.cashAtReception || 0,
          cardPayments: data.cardPayments || 0,
          upiPayments: data.upiPayments || 0,
          recentTransactions: data.recentTransactions || [],
          expenses: data.expenses || []
        });
      } catch (error) {
        console.error('Error fetching cash data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCashData();
  }, [axios]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 overflow-auto h-full bg-background flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 overflow-auto h-full bg-background">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1f2937]">
          CASH MANAGEMENT
        </h1>
      </div>

      {/* Cash Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Today's Revenue</h3>
          <div className="text-3xl font-bold text-green-600">₹{cashData.todayRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Today's total revenue</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Cash At Reception</h3>
          <div className={`text-3xl font-bold ${cashData.cashInHand >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
            ₹{Math.abs(cashData.cashInHand).toLocaleString()}
            {cashData.cashInHand < 0 && <span className="text-sm ml-1">(Deficit)</span>}
          </div>
          <div className="text-sm text-gray-500">
            {cashData.cashInHand >= 0 ? 'Available cash' : 'Cash deficit at reception'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Card Payments</h3>
          <div className="text-3xl font-bold text-blue-600">₹{cashData.cardPayments.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Digital transactions</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">UPI Payments</h3>
          <div className="text-3xl font-bold text-orange-600">₹{cashData.upiPayments.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Online payments</div>
        </div>
      </div>

      {/* Cash Transaction Form */}
      <CashTransactionCard onTransactionAdded={() => {
        // Refresh data after transaction is added
        setLoading(true);
        const fetchCashData = async () => {
          try {
            const cashAtReceptionRes = await axios.get('/api/cash-transactions/cash-at-reception');
            const data = cashAtReceptionRes.data;
            
            setCashData({
              todayRevenue: data.totalRevenue || 0,
              cashInHand: data.cashAtReception || 0,
              cardPayments: data.cardPayments || 0,
              upiPayments: data.upiPayments || 0,
              recentTransactions: data.recentTransactions || [],
              expenses: data.expenses || []
            });
          } catch (error) {
            console.error('Error fetching cash data:', error);
          } finally {
            setLoading(false);
          }
        };
        fetchCashData();
      }} />

      {/* Additional Cash Management Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {cashData.recentTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No recent transactions</div>
            ) : (
              cashData.recentTransactions.map((transaction, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{transaction.description || transaction.title}</p>
                    <p className="text-sm text-gray-500">{transaction.paymentMethod || transaction.type}</p>
                  </div>
                  <span className="text-green-600 font-bold">+₹{transaction.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Expenses Today</h3>
          <div className="space-y-3">
            {cashData.expenses.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No expenses today</div>
            ) : (
              cashData.expenses.map((expense, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{expense.description || expense.title}</p>
                    <p className="text-sm text-gray-500">{expense.category || expense.type}</p>
                  </div>
                  <span className="text-red-600 font-bold">-₹{expense.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashManagement;