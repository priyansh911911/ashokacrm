import React from "react";
import { PlusCircle, CheckCircle, LogOut } from "lucide-react";

const QuickActions = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-extrabold text-[#1f2937] mb-8">
        Quick Actions
      </h2>
      <div className="flex flex-wrap gap-5">
        <button className="bg-red-600 text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-4 focus:ring-red-600 focus:ring-offset-2">
          <PlusCircle className="w-5 h-5" /> New Booking
        </button>
        <button className="bg-primary text-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm hover:bg-primary-dark transition-colors focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-2">
          <CheckCircle className="w-5 h-5" /> Check In Guest
        </button>
        <button className="bg-gray-100 text-text px-6 py-4 rounded-xl flex items-center gap-3 shadow-sm hover:bg-gray-200 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2">
          <LogOut className="w-5 h-5" /> Check Out Guest
        </button>
        {/* Add more buttons as needed */}
      </div>
    </div>
  );
};

export default QuickActions;
