import React, { useState, useEffect } from "react";
import { ArrowLeft, Printer } from "lucide-react";

const RestaurantBill = ({ order, orders, onClose, onBillUpdate }) => {
  if (!order && !orders) return null;

  const [currentOrders, setCurrentOrders] = useState(orders || [order]);
  const [billData, setBillData] = useState(null);

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
    
    const subtotal = consolidatedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.18;
    const service = subtotal * 0.10;
    const total = subtotal + tax + service;
    const orderIds = allOrders.map(ord => ord._id?.slice(-8)).join(', ');
    
    return {
      consolidatedItems,
      subtotal,
      tax,
      service,
      total,
      orderIds,
      allOrders
    };
  };

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

  const { consolidatedItems, subtotal, tax, service, total, orderIds, allOrders } = billData;

  return (
    <>
      <style>{`
        @media print {
          * { visibility: hidden; }
          .print-content, .print-content * { visibility: visible !important; }
          .print-content { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          @page { margin: 0.5in; size: A4; }
          body { margin: 0; padding: 0; background: white !important; }
        }
      `}</style>
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm print-content">
          <div className="p-4 font-mono text-xs">
            <div className="flex justify-between items-center mb-2 no-print">
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button onClick={() => window.print()} className="text-gray-500 hover:text-gray-700">
                <Printer className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center mb-2">
              <h1 className="text-sm font-bold">ASHOKA HOTEL</h1>
              <p className="text-xs">Room Service Bill</p>
              <div className="text-xs mt-1">================================</div>
            </div>

            <div className="mb-2 space-y-0 text-xs">
              <div>Order: #{orderIds}</div>
              <div>Room: {allOrders[0]?.roomNumber || 'R001'}</div>
              <div>Guest: {allOrders[0]?.guestName || 'Guest'}</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div>Time: {new Date().toLocaleTimeString()}</div>
              <div className="text-green-600">Updated: {new Date().toLocaleTimeString()}</div>
              <div className="mt-1">================================</div>
            </div>

            <div className="mb-2 space-y-1">
              {consolidatedItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>₹{(item.quantity * item.unitPrice).toFixed(2)}</span>
                </div>
              ))}
              <div className="mt-1">================================</div>
            </div>

            <div className="mb-2 space-y-0 text-xs">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (18%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service (10%):</span>
                <span>₹{service.toFixed(2)}</span>
              </div>
              <div className="mt-1">================================</div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="mt-1 text-xs">================================</div>
            </div>

            <div className="text-center mb-2 text-xs">
              <p>Thank you for your order!</p>
              <p>Have a great day!</p>
            </div>

            <div className="text-center no-print">
              <button
                onClick={() => {
                  // Add payment logic here if needed
                  alert(`Bill Total: ₹${total.toFixed(2)}`);
                }}
                className="bg-blue-500 text-white py-2 px-4 rounded text-sm hover:bg-blue-600 transition-colors w-full"
              >
                Generate Bill ₹{total.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RestaurantBill;