import React from 'react';
import { BarChart3 } from 'lucide-react';

const DashboardLoader = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-yellow-50">
            <div className="text-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-20 w-20 border-4 border-amber-200 border-t-amber-500 mx-auto mb-6"></div>
                    <BarChart3 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-amber-600" />
                </div>
                <p className="text-xl font-bold text-gray-800 mb-2">Loading Dashboard</p>
                <p className="text-sm text-gray-600">Please wait while we fetch your data...</p>
            </div>
        </div>
    );
};

export default DashboardLoader;