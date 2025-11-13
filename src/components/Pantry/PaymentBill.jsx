import React, { useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";

const PaymentBill = ({ order, orders, vendor, onClose, onBillUpdate }) => {
  if ((!order && !orders) || !vendor) return null;

  const [currentOrders, setCurrentOrders] = useState(orders || [order]);
  const [billData, setBillData] = useState(null);

  // Function to consolidate items and calculate totals
  const calculateBillData = (allOrders) => {
    const consolidatedItems = [];
    const itemMap = new Map();
    
    allOrders.forEach(ord => {
      ord.items?.forEach(item => {
        const itemKey = `${item.name || item.itemName || item.product}-${item.unit || item.unitType || 'pcs'}`;
        const price = item.unitPrice || item.price || item.rate || 0;
        const qty = item.quantity || item.qty || 0;
        
        if (itemMap.has(itemKey)) {
          const existing = itemMap.get(itemKey);
          existing.quantity += qty;
        } else {
          itemMap.set(itemKey, {
            name: item.name || item.itemName || item.product || 'N/A',
            quantity: qty,
            unit: item.unit || item.unitType || 'pcs',
            unitPrice: price
          });
        }
      });
    });
    
    consolidatedItems.push(...itemMap.values());
    
    const subtotal = allOrders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
    const packagingCharge = allOrders.reduce((sum, ord) => sum + (ord.packagingCharge || 0), 0);
    const labourCharge = allOrders.reduce((sum, ord) => sum + (ord.labourCharge || 0), 0);
    const tax = subtotal * 0.18;
    const total = subtotal + packagingCharge + labourCharge + tax;
    const orderIds = allOrders.map(ord => ord._id?.slice(-8)).join(', ');
    
    return {
      consolidatedItems,
      subtotal,
      packagingCharge,
      labourCharge,
      tax,
      total,
      orderIds,
      allOrders
    };
  };

  // Update bill when orders change
  useEffect(() => {
    const newOrders = orders || [order];
    setCurrentOrders(newOrders);
    const newBillData = calculateBillData(newOrders);
    setBillData(newBillData);
    
    // Notify parent component of bill update
    if (onBillUpdate) {
      onBillUpdate(newBillData);
    }
  }, [order, orders]);

  if (!billData) return null;

  const { consolidatedItems, subtotal, packagingCharge, labourCharge, tax, total, orderIds, allOrders } = billData;

  const handlePayNow = () => {
    const upiUrl = `upi://pay?pa=${vendor.UpiID}&pn=${encodeURIComponent(vendor.name)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Pantry Order Payment')}`;
    
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Mobile: Try UPI app first
      window.location.href = upiUrl;
    } else {
      // Desktop: Open Google Pay web
      const webUrl = `https://pay.google.com/gp/p/ui/pay?pa=${vendor.UpiID}&pn=${encodeURIComponent(vendor.name)}&am=${total.toFixed(2)}&cu=INR`;
      window.open(webUrl, '_blank');
    }
  };

  return (
    <>
      <style>{`
        @media print {
          * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible !important; }
          .print-content { 
            position: static !important; 
            left: auto !important; 
            top: auto !important; 
            width: 100% !important;
            overflow: visible !important;
            max-height: none !important;
            height: auto !important;
            page-break-inside: auto !important;
          }
          .no-print { display: none !important; }
          .overflow-x-auto { overflow: visible !important; }
          table { page-break-inside: auto !important; }
          tr { page-break-inside: avoid !important; }
          @page { 
            margin: 0.5in; 
            size: A4; 
          }
          body { 
            margin: 0; 
            padding: 0; 
            background: white !important;
            overflow: visible !important;
          }
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print-content">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <button
                onClick={onClose}
                className="flex items-center hover:opacity-80 transition-opacity no-print text-primary"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div className="text-center flex-1">
                <h2 className="text-3xl font-bold mb-2 text-gray-900">ASHOKA HOTEL</h2>
                <p className="text-lg text-gray-600">Pantry Order Payment Bill</p>
              </div>
              <button 
                onClick={() => window.print()} 
                className="flex items-center px-4 py-2 rounded-lg border hover:bg-gray-50 no-print border-gray-300 text-gray-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Order Details</h3>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Order ID{allOrders.length > 1 ? 's' : ''}:</span>
                  <span>#{orderIds}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Total Orders:</span>
                  <span>{allOrders.length}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Order Type:</span>
                  <span>{allOrders[0]?.orderType}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Status:</span>
                  <span className="capitalize">{allOrders[0]?.status}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Vendor Details</h3>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Vendor Name:</span>
                  <span>{vendor.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">UPI ID:</span>
                  <span className="font-mono text-sm">{vendor.UpiID}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Time:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Last Updated:</span>
                  <span className="text-green-600 font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Items Ordered</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Item</th>
                      <th className="px-4 py-3 text-left font-semibold">Quantity</th>
                      <th className="px-4 py-3 text-left font-semibold">Unit</th>
                      <th className="px-4 py-3 text-left font-semibold">Unit Price</th>
                      <th className="px-4 py-3 text-left font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consolidatedItems.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{item.unit}</td>
                        <td className="px-4 py-3">₹{item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 font-semibold">₹{(item.quantity * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {allOrders.some(ord => ord.notes) && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-900">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  {allOrders.map((ord, idx) => ord.notes && (
                    <div key={idx}>
                      <span className="font-medium">Order #{ord._id?.slice(-8)}: </span>
                      <span className="text-gray-700">{ord.notes}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex justify-between py-2">
                  <span className="font-medium">Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {packagingCharge > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Packaging Charge:</span>
                    <span>₹{packagingCharge.toFixed(2)}</span>
                  </div>
                )}
                {labourCharge > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="font-medium">Labour Charge:</span>
                    <span>₹{labourCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2">
                  <span className="font-medium">Tax (18%):</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 text-xl font-bold text-primary">
                  <span>TOTAL:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {vendor.scannerImg && (
              <div className="text-center mt-8 pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Payment QR Code</h3>
                <img 
                  src={vendor.scannerImg} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 mx-auto border rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                  onClick={handlePayNow}
                />
                <p className="mt-4 text-sm text-gray-600">Scan to pay ₹{total.toFixed(2)}</p>
              </div>
            )}

            <div className="text-center mt-6 no-print">
              <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  onClick={handlePayNow}
                  className="bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-lg shadow-md"
                >
                  Pay Now ₹{total.toFixed(2)}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(vendor.UpiID).then(() => {
                      alert('UPI ID copied to clipboard!');
                    }).catch(() => {
                      alert('Failed to copy UPI ID');
                    });
                  }}
                  className="bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                >
                  Copy UPI ID
                </button>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t">
              <p className="text-lg font-medium text-gray-900">Thank you for your business!</p>
              <p className="text-gray-600">Payment due to: {vendor.name}</p>
              <p className="text-sm text-gray-500 mt-2">UPI ID: {vendor.UpiID}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentBill;