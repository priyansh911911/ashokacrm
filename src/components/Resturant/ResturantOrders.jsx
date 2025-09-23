import { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import AllBookings from './Allorders';
import Order from './Order';

const BookTable = () => {
  const { axios } = useAppContext();
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <>
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-text">Order Management</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-border">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'bg-primary text-text border-b-2 border-primary'
                    : 'text-gray-500 hover:text-text hover:bg-accent'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7" />
                </svg>
                Create Order
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-4 text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'bookings'
                    ? 'bg-primary text-text border-b-2 border-primary'
                    : 'text-gray-500 hover:text-text hover:bg-accent'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                All Orders
              </button>
            </nav>
          </div>
          
          <div className="p-0">
            {activeTab === 'orders' && <Order />}
            {activeTab === 'bookings' && <AllBookings setActiveTab={setActiveTab} />}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default BookTable;