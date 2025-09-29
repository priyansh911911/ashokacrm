import React from 'react';
import CashTransactionCard from '../CashTransaction/CashTransactionCard';

const CashManagement = () => {
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
          <div className="text-3xl font-bold text-green-600">₹45,000</div>
          <div className="text-sm text-gray-500">+12% from yesterday</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Cash In Hand</h3>
          <div className="text-3xl font-bold text-purple-600">₹25,000</div>
          <div className="text-sm text-gray-500">Available cash</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Card Payments</h3>
          <div className="text-3xl font-bold text-blue-600">₹15,000</div>
          <div className="text-sm text-gray-500">Digital transactions</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">UPI Payments</h3>
          <div className="text-3xl font-bold text-orange-600">₹5,000</div>
          <div className="text-sm text-gray-500">Online payments</div>
        </div>
      </div>

      {/* Cash Transaction Form */}
      <CashTransactionCard />

      {/* Additional Cash Management Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Room 101 Payment</p>
                <p className="text-sm text-gray-500">Cash Payment</p>
              </div>
              <span className="text-green-600 font-bold">+₹3,500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Restaurant Bill</p>
                <p className="text-sm text-gray-500">Card Payment</p>
              </div>
              <span className="text-green-600 font-bold">+₹1,200</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Laundry Service</p>
                <p className="text-sm text-gray-500">UPI Payment</p>
              </div>
              <span className="text-green-600 font-bold">+₹500</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Expenses Today</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Staff Salary</p>
                <p className="text-sm text-gray-500">Monthly Payment</p>
              </div>
              <span className="text-red-600 font-bold">-₹8,000</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Utilities</p>
                <p className="text-sm text-gray-500">Electricity Bill</p>
              </div>
              <span className="text-red-600 font-bold">-₹2,500</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">Supplies</p>
                <p className="text-sm text-gray-500">Kitchen Items</p>
              </div>
              <span className="text-red-600 font-bold">-₹1,500</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashManagement;