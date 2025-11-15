import React from 'react';
import { Clock, Soup, CheckCircle } from 'lucide-react';

const KOTStatusBadge = ({ status }) => {
    const statusConfig = {
        pending: {
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            icon: Clock
        },
        preparing: {
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            icon: Soup
        },
        'in-progress': {
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            icon: Soup
        },
        ready: {
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            icon: CheckCircle
        },
        completed: {
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            icon: CheckCircle
        }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full ${config.bgColor} ${config.color} text-sm font-medium`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const ViewKOTModal = ({ isOpen, onClose, kotData }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-xl bg-white">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-900">Kitchen Order Tickets (KOTs)</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* KOT List */}
                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                    {kotData.length > 0 ? (
                        <div className="grid gap-4">
                            {kotData.map((kot) => (
                                <div 
                                    key={kot._id} 
                                    className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-800">
                                                KOT #{kot.displayNumber || kot.kotNumber?.slice(-3) || kot._id.slice(-6)}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Table {kot.tableNumber || 'N/A'}
                                            </p>
                                        </div>
                                        <KOTStatusBadge status={kot.status} />
                                    </div>

                                    {/* Items */}
                                    <div className="mt-3">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Items</h5>
                                        <div className="space-y-2">
                                            {kot.items?.map((item, index) => (
                                                <div 
                                                    key={index}
                                                    className="flex justify-between items-center bg-gray-50 p-2 rounded"
                                                >
                                                    <div>
                                                        <span className="text-gray-800">{item.name}</span>
                                                        {item.notes && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Note: {item.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-600 font-medium">
                                                        × {item.quantity}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="mt-4 text-sm text-gray-500 flex justify-between items-center pt-3 border-t">
                                        <span>Created: {new Date(kot.createdAt).toLocaleString()}</span>
                                        {kot.updatedAt && (
                                            <span>Last Updated: {new Date(kot.updatedAt).toLocaleString()}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No KOTs found
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewKOTModal;
