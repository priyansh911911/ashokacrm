import React, { useState } from 'react';
import { Save, Database, Cloud, HardDrive, Download, Upload, RefreshCw, Trash2, Calendar, Clock } from 'lucide-react';

const DataBackupSettings = () => {
    const [backupConfig, setBackupConfig] = useState({
        autoBackup: true,
        backupFrequency: 'daily',
        backupTime: '02:00',
        incrementalBackup: true,
        compressionEnabled: true,
        verifyBackups: true
    });
    
    const [storageSettings, setStorageSettings] = useState({
        retentionPeriod: 30,
        maxBackupSize: 10,
        localStorage: true,
        cloudBackup: false,
        cloudProvider: 'aws',
        encryptBackups: true,
        encryptionLevel: 'AES-256'
    });
    
    const [backupHistory, setBackupHistory] = useState([
        { id: 1, date: '2024-01-15', time: '02:00', size: '2.5 GB', status: 'Success', type: 'Full' },
        { id: 2, date: '2024-01-14', time: '02:00', size: '1.2 GB', status: 'Success', type: 'Incremental' },
        { id: 3, date: '2024-01-13', time: '02:00', size: '1.8 GB', status: 'Failed', type: 'Incremental' },
        { id: 4, date: '2024-01-12', time: '02:00', size: '2.1 GB', status: 'Success', type: 'Full' }
    ]);
    
    const [dataTypes, setDataTypes] = useState([
        { id: 1, name: 'Guest Data', enabled: true, size: '500 MB', lastBackup: '2024-01-15' },
        { id: 2, name: 'Booking Records', enabled: true, size: '1.2 GB', lastBackup: '2024-01-15' },
        { id: 3, name: 'Financial Data', enabled: true, size: '300 MB', lastBackup: '2024-01-15' },
        { id: 4, name: 'Staff Records', enabled: true, size: '150 MB', lastBackup: '2024-01-15' },
        { id: 5, name: 'System Logs', enabled: false, size: '800 MB', lastBackup: '2024-01-10' },
        { id: 6, name: 'Media Files', enabled: false, size: '5.2 GB', lastBackup: '2024-01-10' }
    ]);
    
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [backupProgress, setBackupProgress] = useState(0);
    
    const handleBackupConfigChange = (key, value) => {
        setBackupConfig(prev => ({ ...prev, [key]: value }));
    };
    
    const handleStorageChange = (key, value) => {
        setStorageSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const handleDataTypeToggle = (id) => {
        setDataTypes(prev => prev.map(item => 
            item.id === id ? { ...item, enabled: !item.enabled } : item
        ));
    };
    
    const startBackup = async () => {
        setIsBackingUp(true);
        setBackupProgress(0);
        
        // Simulate backup progress
        const interval = setInterval(() => {
            setBackupProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsBackingUp(false);
                    // Add new backup to history
                    const newBackup = {
                        id: Date.now(),
                        date: new Date().toISOString().split('T')[0],
                        time: new Date().toTimeString().split(' ')[0].slice(0, 5),
                        size: '2.3 GB',
                        status: 'Success',
                        type: 'Manual'
                    };
                    setBackupHistory(prev => [newBackup, ...prev]);
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
    };
    
    const deleteBackup = (id) => {
        setBackupHistory(prev => prev.filter(backup => backup.id !== id));
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'Success': return 'text-green-600 bg-green-100';
            case 'Failed': return 'text-red-600 bg-red-100';
            case 'In Progress': return 'text-blue-600 bg-blue-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-sm" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>Data & Backup Settings</h2>
            
            <div className="space-y-8">
                {/* Backup Configuration */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Database size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Backup Configuration</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Enable Automatic Backups</span>
                                <input
                                    type="checkbox"
                                    checked={backupConfig.autoBackup}
                                    onChange={(e) => handleBackupConfigChange('autoBackup', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Incremental Backup</span>
                                <input
                                    type="checkbox"
                                    checked={backupConfig.incrementalBackup}
                                    onChange={(e) => handleBackupConfigChange('incrementalBackup', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Enable Compression</span>
                                <input
                                    type="checkbox"
                                    checked={backupConfig.compressionEnabled}
                                    onChange={(e) => handleBackupConfigChange('compressionEnabled', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Backup Frequency</label>
                                <select
                                    value={backupConfig.backupFrequency}
                                    onChange={(e) => handleBackupConfigChange('backupFrequency', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                >
                                    <option value="hourly">Every Hour</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Backup Time</label>
                                <input
                                    type="time"
                                    value={backupConfig.backupTime}
                                    onChange={(e) => handleBackupConfigChange('backupTime', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Storage Settings */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <HardDrive size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Storage Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Retention Period (days)</label>
                                <input
                                    type="number"
                                    value={storageSettings.retentionPeriod}
                                    onChange={(e) => handleStorageChange('retentionPeriod', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    min="7"
                                    max="365"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Backup Size (GB)</label>
                                <input
                                    type="number"
                                    value={storageSettings.maxBackupSize}
                                    onChange={(e) => handleStorageChange('maxBackupSize', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    min="1"
                                    max="100"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Local Storage</span>
                                <input
                                    type="checkbox"
                                    checked={storageSettings.localStorage}
                                    onChange={(e) => handleStorageChange('localStorage', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Cloud Backup</span>
                                <input
                                    type="checkbox"
                                    checked={storageSettings.cloudBackup}
                                    onChange={(e) => handleStorageChange('cloudBackup', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            {storageSettings.cloudBackup && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Cloud Provider</label>
                                    <select
                                        value={storageSettings.cloudProvider}
                                        onChange={(e) => handleStorageChange('cloudProvider', e.target.value)}
                                        className="w-full p-2 border rounded"
                                        style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    >
                                        <option value="aws">Amazon S3</option>
                                        <option value="google">Google Cloud</option>
                                        <option value="azure">Microsoft Azure</option>
                                        <option value="dropbox">Dropbox</option>
                                    </select>
                                </div>
                            )}
                            <label className="flex items-center justify-between">
                                <span>Encrypt Backups</span>
                                <input
                                    type="checkbox"
                                    checked={storageSettings.encryptBackups}
                                    onChange={(e) => handleStorageChange('encryptBackups', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Data Types */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Database size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Data Types to Backup</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Data Type
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Include
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Size
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Last Backup
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataTypes.map(item => (
                                    <tr key={item.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {item.name}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <input
                                                type="checkbox"
                                                checked={item.enabled}
                                                onChange={() => handleDataTypeToggle(item.id)}
                                                className="h-4 w-4"
                                                style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                            />
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {item.size}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {item.lastBackup}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Backup History */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Backup History</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Date
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Time
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Type
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Size
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Status
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {backupHistory.map(backup => (
                                    <tr key={backup.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {backup.date}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {backup.time}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {backup.type}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {backup.size}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(backup.status)}`}>
                                                {backup.status}
                                            </span>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <div className="flex gap-2">
                                                <button className="p-1 text-green-600 hover:bg-green-100 rounded" title="Restore">
                                                    <RefreshCw size={16} />
                                                </button>
                                                <button className="p-1 text-blue-600 hover:bg-blue-100 rounded" title="Download">
                                                    <Download size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => deleteBackup(backup.id)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded" 
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Manual Actions */}
                <div>
                    <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Manual Actions</h3>
                    <div className="flex flex-wrap gap-4">
                        <button 
                            onClick={startBackup}
                            disabled={isBackingUp}
                            className="flex items-center gap-2 px-4 py-2 text-white rounded hover:opacity-90 disabled:opacity-50"
                            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                        >
                            <Database size={16} />
                            {isBackingUp ? 'Creating Backup...' : 'Create Backup Now'}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                            <Upload size={16} /> Restore from Backup
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            <Download size={16} /> Export Data
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600">
                            <Cloud size={16} /> Sync to Cloud
                        </button>
                    </div>
                    
                    {isBackingUp && (
                        <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={16} />
                                <span className="text-sm">Backup Progress: {backupProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                        backgroundColor: 'hsl(45, 43%, 58%)',
                                        width: `${backupProgress}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Save Button */}
                <div className="flex justify-end">
                    <button 
                        className="flex items-center gap-2 px-6 py-3 text-white rounded hover:opacity-90"
                        style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                    >
                        <Save size={16} /> Save Backup Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataBackupSettings;