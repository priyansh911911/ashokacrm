import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ChefHat, Utensils } from 'lucide-react';
import Order from './Order';

const BookTable = () => {
  const { axios } = useAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="w-full">
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-orange-200 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-orange-500 to-red-500">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Create Order
              </h1>
              <p className="text-gray-600 mt-1">Manage restaurant orders and menu items</p>
            </div>
          </div>
        </div>
        
        <div className="w-full p-4 sm:p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100">
            <Order />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookTable;
