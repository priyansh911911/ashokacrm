import React, { useState } from 'react';
import { Save, Shield, Lock, Eye, AlertTriangle, Key, Clock, FileText } from 'lucide-react';

const SecuritySettings = () => {
    const [authentication, setAuthentication] = useState({
        twoFactorAuth: false,
        requireStrongPassword: true,
        passwordMinLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        biometricAuth: false
    });
    
    const [sessionManagement, setSessionManagement] = useState({
        sessionTimeout: 30,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        rememberMeEnabled: true,
        concurrentSessions: 3,
        forceLogoutOnPasswordChange: true
    });
    
    const [passwordPolicy, setPasswordPolicy] = useState({
        passwordExpiry: 90,
        passwordHistory: 5,
        preventReuse: true,
        forceChangeOnFirstLogin: true,
        passwordComplexityScore: 3
    });
    
    const [auditSecurity, setAuditSecurity] = useState({
        auditLogging: true,
        loginAttemptLogging: true,
        dataAccessLogging: true,
        systemChangeLogging: true,
        retentionPeriod: 365,
        realTimeAlerts: true
    });
    
    const [accessControl, setAccessControl] = useState({
        ipWhitelisting: false,
        allowedIPs: ['192.168.1.0/24'],
        deviceTrust: true,
        locationBasedAccess: false,
        workingHoursOnly: false,
        workingHoursStart: '09:00',
        workingHoursEnd: '18:00'
    });
    
    const [encryptionSettings, setEncryptionSettings] = useState({
        dataEncryption: true,
        encryptionLevel: 'AES-256',
        sslEnabled: true,
        backupEncryption: true
    });
    
    const handleAuthenticationChange = (key, value) => {
        setAuthentication(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSessionChange = (key, value) => {
        setSessionManagement(prev => ({ ...prev, [key]: value }));
    };
    
    const handlePasswordPolicyChange = (key, value) => {
        setPasswordPolicy(prev => ({ ...prev, [key]: value }));
    };
    
    const handleAuditChange = (key, value) => {
        setAuditSecurity(prev => ({ ...prev, [key]: value }));
    };
    
    const handleAccessControlChange = (key, value) => {
        setAccessControl(prev => ({ ...prev, [key]: value }));
    };
    
    const handleEncryptionChange = (key, value) => {
        setEncryptionSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const addIPAddress = () => {
        const newIP = prompt('Enter IP address or range (e.g., 192.168.1.100 or 192.168.1.0/24):');
        if (newIP) {
            setAccessControl(prev => ({
                ...prev,
                allowedIPs: [...prev.allowedIPs, newIP]
            }));
        }
    };
    
    const removeIPAddress = (index) => {
        setAccessControl(prev => ({
            ...prev,
            allowedIPs: prev.allowedIPs.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-sm" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>Security Settings</h2>
            
            <div className="space-y-8">
                {/* Authentication */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Shield size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Authentication</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Two-Factor Authentication</span>
                                <input
                                    type="checkbox"
                                    checked={authentication.twoFactorAuth}
                                    onChange={(e) => handleAuthenticationChange('twoFactorAuth', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Require Strong Passwords</span>
                                <input
                                    type="checkbox"
                                    checked={authentication.requireStrongPassword}
                                    onChange={(e) => handleAuthenticationChange('requireStrongPassword', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Biometric Authentication</span>
                                <input
                                    type="checkbox"
                                    checked={authentication.biometricAuth}
                                    onChange={(e) => handleAuthenticationChange('biometricAuth', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Minimum Password Length</label>
                                <input
                                    type="number"
                                    value={authentication.passwordMinLength}
                                    onChange={(e) => handleAuthenticationChange('passwordMinLength', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    min="6"
                                    max="20"
                                />
                            </div>
                            <label className="flex items-center justify-between">
                                <span>Require Special Characters</span>
                                <input
                                    type="checkbox"
                                    checked={authentication.requireSpecialChars}
                                    onChange={(e) => handleAuthenticationChange('requireSpecialChars', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Require Numbers</span>
                                <input
                                    type="checkbox"
                                    checked={authentication.requireNumbers}
                                    onChange={(e) => handleAuthenticationChange('requireNumbers', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Session Management */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Session Management</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                            <input
                                type="number"
                                value={sessionManagement.sessionTimeout}
                                onChange={(e) => handleSessionChange('sessionTimeout', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                min="5"
                                max="480"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Max Login Attempts</label>
                            <input
                                type="number"
                                value={sessionManagement.maxLoginAttempts}
                                onChange={(e) => handleSessionChange('maxLoginAttempts', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                min="3"
                                max="10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Lockout Duration (minutes)</label>
                            <input
                                type="number"
                                value={sessionManagement.lockoutDuration}
                                onChange={(e) => handleSessionChange('lockoutDuration', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                min="5"
                                max="60"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Concurrent Sessions</label>
                            <input
                                type="number"
                                value={sessionManagement.concurrentSessions}
                                onChange={(e) => handleSessionChange('concurrentSessions', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                min="1"
                                max="10"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center justify-between">
                                <span>Remember Me Enabled</span>
                                <input
                                    type="checkbox"
                                    checked={sessionManagement.rememberMeEnabled}
                                    onChange={(e) => handleSessionChange('rememberMeEnabled', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Force Logout on Password Change</span>
                                <input
                                    type="checkbox"
                                    checked={sessionManagement.forceLogoutOnPasswordChange}
                                    onChange={(e) => handleSessionChange('forceLogoutOnPasswordChange', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Password Policy */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Key size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Password Policy</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Password Expiry (days)</label>
                                <input
                                    type="number"
                                    value={passwordPolicy.passwordExpiry}
                                    onChange={(e) => handlePasswordPolicyChange('passwordExpiry', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    min="30"
                                    max="365"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Password History Count</label>
                                <input
                                    type="number"
                                    value={passwordPolicy.passwordHistory}
                                    onChange={(e) => handlePasswordPolicyChange('passwordHistory', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    min="3"
                                    max="12"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Prevent Password Reuse</span>
                                <input
                                    type="checkbox"
                                    checked={passwordPolicy.preventReuse}
                                    onChange={(e) => handlePasswordPolicyChange('preventReuse', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Force Change on First Login</span>
                                <input
                                    type="checkbox"
                                    checked={passwordPolicy.forceChangeOnFirstLogin}
                                    onChange={(e) => handlePasswordPolicyChange('forceChangeOnFirstLogin', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Access Control */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Lock size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Access Control</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>IP Whitelisting</span>
                                <input
                                    type="checkbox"
                                    checked={accessControl.ipWhitelisting}
                                    onChange={(e) => handleAccessControlChange('ipWhitelisting', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            {accessControl.ipWhitelisting && (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium">Allowed IP Addresses</label>
                                        <button
                                            onClick={addIPAddress}
                                            className="px-2 py-1 text-xs text-white rounded"
                                            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                                        >
                                            Add IP
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {accessControl.allowedIPs.map((ip, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                <span className="text-sm">{ip}</span>
                                                <button
                                                    onClick={() => removeIPAddress(index)}
                                                    className="text-red-600 hover:text-red-800 text-xs"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <label className="flex items-center justify-between">
                                <span>Device Trust</span>
                                <input
                                    type="checkbox"
                                    checked={accessControl.deviceTrust}
                                    onChange={(e) => handleAccessControlChange('deviceTrust', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Working Hours Only</span>
                                <input
                                    type="checkbox"
                                    checked={accessControl.workingHoursOnly}
                                    onChange={(e) => handleAccessControlChange('workingHoursOnly', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            {accessControl.workingHoursOnly && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={accessControl.workingHoursStart}
                                            onChange={(e) => handleAccessControlChange('workingHoursStart', e.target.value)}
                                            className="w-full p-2 border rounded text-sm"
                                            style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={accessControl.workingHoursEnd}
                                            onChange={(e) => handleAccessControlChange('workingHoursEnd', e.target.value)}
                                            className="w-full p-2 border rounded text-sm"
                                            style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Audit & Logging */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <FileText size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Audit & Logging</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Enable Audit Logging</span>
                                <input
                                    type="checkbox"
                                    checked={auditSecurity.auditLogging}
                                    onChange={(e) => handleAuditChange('auditLogging', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Login Attempt Logging</span>
                                <input
                                    type="checkbox"
                                    checked={auditSecurity.loginAttemptLogging}
                                    onChange={(e) => handleAuditChange('loginAttemptLogging', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Data Access Logging</span>
                                <input
                                    type="checkbox"
                                    checked={auditSecurity.dataAccessLogging}
                                    onChange={(e) => handleAuditChange('dataAccessLogging', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Log Retention Period (days)</label>
                                <input
                                    type="number"
                                    value={auditSecurity.retentionPeriod}
                                    onChange={(e) => handleAuditChange('retentionPeriod', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    min="30"
                                    max="2555"
                                />
                            </div>
                            <label className="flex items-center justify-between">
                                <span>Real-time Security Alerts</span>
                                <input
                                    type="checkbox"
                                    checked={auditSecurity.realTimeAlerts}
                                    onChange={(e) => handleAuditChange('realTimeAlerts', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                    </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end">
                    <button 
                        className="flex items-center gap-2 px-6 py-3 text-white rounded hover:opacity-90"
                        style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                    >
                        <Save size={16} /> Save Security Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;