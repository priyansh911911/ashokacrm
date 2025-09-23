import React, { useState } from 'react';
import { Save, Upload, Eye, EyeOff } from 'lucide-react';

const GeneralSettings = () => {
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john.doe@buddhaavenue.com',
        phone: '+91 9876543210',
        profilePicture: null
    });
    
    const [preferences, setPreferences] = useState({
        language: 'English',
        timeFormat: '24h',
        dateFormat: 'DD/MM/YYYY',
        timezone: 'Asia/Kolkata',
        currency: 'INR'
    });
    
    const [security, setSecurity] = useState({
        twoFactorEnabled: false,
        passwordLastChanged: '2024-01-15',
        sessionTimeout: 30
    });
    
    const [theme, setTheme] = useState({
        darkMode: false,
        sidebarCollapsed: false,
        compactView: false
    });
    
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const handleProfileChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };
    
    const handlePreferenceChange = (field, value) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };
    
    const handleSecurityChange = (field, value) => {
        setSecurity(prev => ({ ...prev, [field]: value }));
    };
    
    const handleThemeChange = (field, value) => {
        setTheme(prev => ({ ...prev, [field]: value }));
    };
    
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfile(prev => ({ ...prev, profilePicture: e.target.result }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePasswordChange = () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        // Handle password change logic
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-sm mb-8" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>General Settings</h2>

            {/* Profile Management */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Profile Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Profile Picture</label>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                                {profile.profilePicture ? (
                                    <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="profile-upload"
                                />
                                <label
                                    htmlFor="profile-upload"
                                    className="flex items-center gap-2 px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity cursor-pointer"
                                    style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                                >
                                    <Upload size={16} /> Upload Photo
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                        <input 
                            type="text" 
                            value={profile.name}
                            onChange={(e) => handleProfileChange('name', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2" 
                            style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}} 
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Email Address</label>
                        <input 
                            type="email" 
                            value={profile.email}
                            onChange={(e) => handleProfileChange('email', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2" 
                            style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}} 
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
                        <input 
                            type="tel" 
                            value={profile.phone}
                            onChange={(e) => handleProfileChange('phone', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2" 
                            style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}} 
                        />
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Security Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Password</label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Last changed: {security.passwordLastChanged}</span>
                            <button 
                                onClick={() => setShowPasswordModal(true)}
                                className="px-3 py-1 text-white rounded text-sm hover:opacity-90"
                                style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center justify-between">
                            <span className="text-gray-700 font-medium">Two-Factor Authentication</span>
                            <input
                                type="checkbox"
                                checked={security.twoFactorEnabled}
                                onChange={(e) => handleSecurityChange('twoFactorEnabled', e.target.checked)}
                                className="h-4 w-4"
                                style={{accentColor: 'hsl(45, 43%, 58%)'}}
                            />
                        </label>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Session Timeout (minutes)</label>
                        <input 
                            type="number" 
                            value={security.sessionTimeout}
                            onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2" 
                            style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}} 
                            min="5"
                            max="480"
                        />
                    </div>
                </div>
            </div>

            {/* Language & Localization */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Language & Localization</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Language</label>
                        <select 
                            value={preferences.language}
                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2" 
                            style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                        >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Time Format</label>
                        <select 
                            value={preferences.timeFormat}
                            onChange={(e) => handlePreferenceChange('timeFormat', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2" 
                            style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                        >
                            <option value="12h">12 Hour</option>
                            <option value="24h">24 Hour</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Date Format</label>
                        <select 
                            value={preferences.dateFormat}
                            onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2" 
                            style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                        >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Timezone</label>
                        <select 
                            value={preferences.timezone}
                            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2" 
                            style={{borderColor: 'hsl(45, 100%, 85%)', focusRingColor: 'hsl(45, 43%, 58%)'}}
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New_York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Theme & Layout */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Theme & Layout</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Dark Mode</span>
                        <input
                            type="checkbox"
                            checked={theme.darkMode}
                            onChange={(e) => handleThemeChange('darkMode', e.target.checked)}
                            className="h-4 w-4"
                            style={{accentColor: 'hsl(45, 43%, 58%)'}}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Collapsed Sidebar</span>
                        <input
                            type="checkbox"
                            checked={theme.sidebarCollapsed}
                            onChange={(e) => handleThemeChange('sidebarCollapsed', e.target.checked)}
                            className="h-4 w-4"
                            style={{accentColor: 'hsl(45, 43%, 58%)'}}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Compact View</span>
                        <input
                            type="checkbox"
                            checked={theme.compactView}
                            onChange={(e) => handleThemeChange('compactView', e.target.checked)}
                            className="h-4 w-4"
                            style={{accentColor: 'hsl(45, 43%, 58%)'}}
                        />
                    </div>
                </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
                <button 
                    className="flex items-center gap-2 px-6 py-3 text-white rounded hover:opacity-90"
                    style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                >
                    <Save size={16} /> Save All Settings
                </button>
            </div>
            
            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>
                            Change Password
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({...prev, currentPassword: e.target.value}))}
                                    className="w-full px-3 py-2 border rounded-md"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({...prev, newPassword: e.target.value}))}
                                    className="w-full px-3 py-2 border rounded-md"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({...prev, confirmPassword: e.target.value}))}
                                    className="w-full px-3 py-2 border rounded-md"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePasswordChange}
                                className="px-4 py-2 text-white rounded hover:opacity-90"
                                style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                            >
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralSettings;