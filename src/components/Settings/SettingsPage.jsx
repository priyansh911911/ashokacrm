import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
    return (
        <div className="p-6" style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
            <div className="bg-white rounded-lg shadow-sm p-8 text-center" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
                <Settings className="w-16 h-16 mx-auto mb-4" style={{color: 'hsl(45, 43%, 58%)'}} />
                <h1 className="text-3xl font-bold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>
                    Settings
                </h1>
                <p className="text-gray-600 mb-6">
                    Use the Settings dropdown in the sidebar to access different configuration options.
                </p>
                <div className="text-sm text-gray-500">
                    Available settings: General, Business/Hotel, Users & Roles, Notifications, Operations, Security, Data & Backup, and Integrations.
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;