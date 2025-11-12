import React from 'react';
import { AlertTriangle, CheckCircle, Package, Truck } from 'lucide-react';

const AutoVendorNotification = ({ 
  outOfStockItems = [], 
  autoVendorOrder = null, 
  onClose = () => {},
  onViewVendorOrder = () => {} 
}) => {
  if (!outOfStockItems.length && !autoVendorOrder) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-xl border-l-4 border-orange-500 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={20} />
            <h3 className="font-semibold text-gray-900">Auto Vendor Ordering</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ×
          </button>
        </div>

        {outOfStockItems.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="text-red-500" size={16} />
              <span className="text-sm font-medium text-red-700">
                Out of Stock Items ({outOfStockItems.length})
              </span>
            </div>
            <div className="bg-red-50 rounded p-3 max-h-32 overflow-y-auto">
              {outOfStockItems.map((item, index) => (
                <div key={index} className="text-sm text-red-800 mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-red-600 ml-2">
                    (Requested: {item.requestedQuantity}, Available: {item.availableQuantity})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {autoVendorOrder && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="text-green-500" size={16} />
              <span className="text-sm font-medium text-green-700">
                Vendor Order Created
              </span>
            </div>
            <div className="bg-green-50 rounded p-3">
              <div className="text-sm text-green-800">
                <div className="font-medium mb-1">
                  Order #{autoVendorOrder._id?.slice(-8)}
                </div>
                <div className="text-green-700">
                  Vendor: {autoVendorOrder.vendorId?.name || 'Unknown'}
                </div>
                <div className="text-green-700">
                  Amount: ₹{autoVendorOrder.totalAmount?.toFixed(2) || '0.00'}
                </div>
                <div className="text-green-700">
                  Items: {autoVendorOrder.items?.length || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {autoVendorOrder && (
            <button
              onClick={() => onViewVendorOrder(autoVendorOrder)}
              className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
            >
              <Truck size={14} />
              View Vendor Order
            </button>
          )}
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoVendorNotification;
