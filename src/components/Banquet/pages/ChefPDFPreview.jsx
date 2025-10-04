import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from "react-to-print";
import Logo from "/src/assets/logo.png";

const ChefPDFPreview = ({ booking }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef();

  const fetchMenuData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://ashoka-backend.vercel.app/api/banquet-menus/${booking._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('Chef Menu API Response:', response.data);
      console.log('Menu data structure:', response.data.data);
      console.log('Categories:', response.data.data?.categories);
      
      const menuData = response.data.data?.categories || response.data.data || response.data || {};
      console.log('Final menu data:', menuData);
      setMenuData(menuData);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setMenuData({});
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    await fetchMenuData();
    setShowPreview(true);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Chef_Instructions_${booking.customerRef || booking.name}_${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => console.log('Print completed')
  });

  return (
    <>
      <button
        onClick={handlePreview}
        className="inline-flex items-center gap-1 bg-orange-600 text-white rounded-lg shadow hover:bg-orange-700 transition-colors font-semibold px-3 py-1.5 text-xs"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">Chef Instructions Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
                  <span className="ml-2">Loading menu...</span>
                </div>
              ) : (
                <div ref={printRef} className="bg-white shadow-lg rounded-2xl overflow-hidden print:pt-0 print:mt-0 print:shadow-none print:p-8 print:m-0">
                  <div className="px-4 py-5 sm:px-4 bg-gradient-to-r from-[#f7f5ef] to-[#c3ad6b]/30 print:rounded-none print:flex print:items-center print:justify-between">
                    <img
                      src={Logo}
                      alt="ASHOKA HOTEL Logo"
                      className="hidden print:block print:mr-4 print:w-12"
                      style={{ maxWidth: "120px" }}
                    />
                    <h3 className="text-lg leading-6 font-bold text-gray-900 text-center flex-1 print:text-black print:text-center">
                      ASHOKA HOTEL - CHEF INSTRUCTIONS
                    </h3>
                    <div className="hidden print:block print:w-24"></div>
                  </div>
                  <div className="h-3 print:h-2"></div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-0 print:px-0 print:py-0">
                    <div className="p-6 print:p-0 print:pl-0">
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-[#c3ad6b] print:text-black mb-3 border-b border-[#c3ad6b]/30 print:border-gray-300 pb-2">
                          BOOKING DETAILS
                        </h2>
                        <div className="grid grid-cols-2 gap-4 text-sm print:text-black">
                          <div><strong>Customer:</strong> {booking.name || 'N/A'}</div>
                          <div><strong>Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</div>
                          <div><strong>Time:</strong> {booking.time || 'N/A'}</div>
                          <div><strong>Pax:</strong> {booking.pax || 'N/A'}</div>
                          <div><strong>Food Type:</strong> {booking.foodType || 'N/A'}</div>
                          <div><strong>Rate Plan:</strong> {booking.ratePlan || 'N/A'}</div>
                          <div><strong>Hall:</strong> {booking.hall || 'N/A'}</div>
                          <div><strong>Ref:</strong> {booking.customerRef || 'N/A'}</div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-[#c3ad6b] print:text-black mb-3 border-b border-[#c3ad6b]/30 print:border-gray-300 pb-2">
                          MENU ITEMS TO PREPARE
                        </h2>
                        {(() => {
                          console.log('Rendering menu data:', menuData);
                          console.log('Menu data keys:', Object.keys(menuData || {}));
                          return menuData && Object.keys(menuData).length > 0;
                        })() ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid print:grid-cols-2 print:gap-4">
                            {Object.entries(menuData).map(([category, items]) => {
                              console.log(`Processing category: ${category}, items:`, items);
                              const skip = ["_id", "createdAt", "updatedAt", "__v", "bookingRef", "customerRef"];
                              if (skip.includes(category)) return null;
                              if (Array.isArray(items) && items.length > 0) {
                                return (
                                  <div key={category} className="bg-[#c3ad6b]/10 rounded-lg p-4 shadow-sm border border-[#c3ad6b]/30 print:shadow-none print:border print:bg-white print:p-2">
                                    <h4 className="text-lg font-semibold text-[#c3ad6b] mb-3 pb-2 border-b border-[#c3ad6b]/30 print:text-black print:border-b print:border-gray-300">
                                      {category.replaceAll("_", " ").split(" ").map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                      ).join(" ")}
                                    </h4>
                                    <ul className="space-y-2">
                                      {items.map((item, i) => (
                                        <li key={i} className="flex items-start print:text-black">
                                          <span className="flex-shrink-0 h-5 w-5 text-[#c3ad6b] mr-2 print:text-black">•</span>
                                          <span className="text-gray-700 print:text-black">{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-500 print:text-black text-center py-4">No menu items available</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChefPDFPreview;