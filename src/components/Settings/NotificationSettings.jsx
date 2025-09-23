import React, { useState } from 'react';
import { Save, Bell, Mail, MessageSquare, Smartphone, Clock } from 'lucide-react';

const NotificationSettings = () => {
    const [channels, setChannels] = useState({
        email: { enabled: true, address: 'admin@buddhaavenue.com' },
        sms: { enabled: false, number: '+91 9876543210' },
        push: { enabled: true },
        inApp: { enabled: true }
    });
    
    const [alertTypes, setAlertTypes] = useState([
        { id: 1, name: 'New Booking Alerts', enabled: true, channels: ['email', 'push'], priority: 'high' },
        { id: 2, name: 'Payment Alerts', enabled: true, channels: ['email', 'sms'], priority: 'high' },
        { id: 3, name: 'Check-in/Check-out Alerts', enabled: true, channels: ['push'], priority: 'medium' },
        { id: 4, name: 'Room Status Updates', enabled: false, channels: ['push'], priority: 'low' },
        { id: 5, name: 'Staff Task Assignments', enabled: true, channels: ['push', 'inApp'], priority: 'medium' },
        { id: 6, name: 'System Maintenance', enabled: false, channels: ['email'], priority: 'low' }
    ]);
    
    const [schedules, setSchedules] = useState({
        quietHours: { enabled: true, start: '22:00', end: '08:00' },
        weekendAlerts: { enabled: false },
        batchNotifications: { enabled: true, interval: 30 }
    });
    
    const handleChannelToggle = (channel) => {
        setChannels(prev => ({
            ...prev,
            [channel]: { ...prev[channel], enabled: !prev[channel].enabled }
        }));
    };
    
    const handleChannelUpdate = (channel, field, value) => {
        setChannels(prev => ({
            ...prev,
            [channel]: { ...prev[channel], [field]: value }
        }));
    };
    
    const handleAlertToggle = (alertId) => {
        setAlertTypes(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
        ));
    };
    
    const handleAlertChannelToggle = (alertId, channel) => {
        setAlertTypes(prev => prev.map(alert => {
            if (alert.id === alertId) {
                const channels = alert.channels.includes(channel)
                    ? alert.channels.filter(c => c !== channel)
                    : [...alert.channels, channel];
                return { ...alert, channels };
            }
            return alert;
        }));
    };
    
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    
    const getChannelIcon = (channel) => {
        switch (channel) {
            case 'email': return <Mail size={16} />;
            case 'sms': return <MessageSquare size={16} />;
            case 'push': return <Smartphone size={16} />;
            case 'inApp': return <Bell size={16} />;
            default: return <Bell size={16} />;
        }
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-sm" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>Notifications & Alerts</h2>
            
            <div className="space-y-8">
                {/* Notification Channels */}
                <div>
                    <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Notification Channels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Mail size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                                    <span className="font-medium">Email Notifications</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={channels.email.enabled}
                                    onChange={() => handleChannelToggle('email')}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </div>
                            {channels.email.enabled && (
                                <input
                                    type="email"
                                    value={channels.email.address}
                                    onChange={(e) => handleChannelUpdate('email', 'address', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    placeholder="Email address"
                                />
                            )}
                        </div>
                        
                        <div className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                                    <span className="font-medium">SMS Notifications</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={channels.sms.enabled}
                                    onChange={() => handleChannelToggle('sms')}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </div>
                            {channels.sms.enabled && (
                                <input
                                    type="tel"
                                    value={channels.sms.number}
                                    onChange={(e) => handleChannelUpdate('sms', 'number', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    placeholder="Phone number"
                                />
                            )}
                        </div>
                        
                        <div className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Smartphone size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                                    <span className="font-medium">Push Notifications</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={channels.push.enabled}
                                    onChange={() => handleChannelToggle('push')}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </div>
                        </div>
                        
                        <div className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                                    <span className="font-medium">In-App Notifications</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={channels.inApp.enabled}
                                    onChange={() => handleChannelToggle('inApp')}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Types */}
                <div>
                    <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Alert Types & Preferences</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Alert Type
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Status
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Priority
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Channels
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {alertTypes.map(alert => (
                                    <tr key={alert.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {alert.name}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <input
                                                type="checkbox"
                                                checked={alert.enabled}
                                                onChange={() => handleAlertToggle(alert.id)}
                                                className="h-4 w-4"
                                                style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                            />
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                                                {alert.priority.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <div className="flex gap-2">
                                                {['email', 'sms', 'push', 'inApp'].map(channel => (
                                                    <button
                                                        key={channel}
                                                        onClick={() => handleAlertChannelToggle(alert.id, channel)}
                                                        className={`p-1 rounded ${
                                                            alert.channels.includes(channel)
                                                                ? 'text-white'
                                                                : 'bg-gray-100 text-gray-400'
                                                        }`}
                                                        style={{
                                                            backgroundColor: alert.channels.includes(channel) 
                                                                ? 'hsl(45, 43%, 58%)' 
                                                                : undefined
                                                        }}
                                                        title={channel}
                                                    >
                                                        {getChannelIcon(channel)}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Delivery Schedule */}
                <div>
                    <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Delivery Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                                    <span className="font-medium">Quiet Hours</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={schedules.quietHours.enabled}
                                    onChange={(e) => setSchedules(prev => ({...prev, quietHours: {...prev.quietHours, enabled: e.target.checked}}))}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </div>
                            {schedules.quietHours.enabled && (
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="time"
                                        value={schedules.quietHours.start}
                                        onChange={(e) => setSchedules(prev => ({...prev, quietHours: {...prev.quietHours, start: e.target.value}}))}
                                        className="px-2 py-1 border rounded text-sm"
                                        style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    />
                                    <span className="text-sm">to</span>
                                    <input
                                        type="time"
                                        value={schedules.quietHours.end}
                                        onChange={(e) => setSchedules(prev => ({...prev, quietHours: {...prev.quietHours, end: e.target.value}}))}
                                        className="px-2 py-1 border rounded text-sm"
                                        style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="border rounded-lg p-4" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium">Weekend Alerts</span>
                                <input
                                    type="checkbox"
                                    checked={schedules.weekendAlerts.enabled}
                                    onChange={(e) => setSchedules(prev => ({...prev, weekendAlerts: {enabled: e.target.checked}}))}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </div>
                            <p className="text-sm text-gray-600">Receive notifications on weekends</p>
                        </div>
                    </div>
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end">
                    <button 
                        className="flex items-center gap-2 px-6 py-3 text-white rounded hover:opacity-90"
                        style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                    >
                        <Save size={16} /> Save Notification Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;