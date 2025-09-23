import React, { useState } from 'react';
import { Save, Clock, Globe, CreditCard, Settings, Users, Calendar, AlertTriangle } from 'lucide-react';

const OperationalSettings = () => {
    const [hotelOperations, setHotelOperations] = useState({
        checkInTime: '14:00',
        checkOutTime: '11:00',
        lateCheckoutFee: 500,
        earlyCheckinFee: 300,
        gracePeriod: 30,
        maxStayDuration: 30,
        minAdvanceBooking: 2
    });
    
    const [systemConfig, setSystemConfig] = useState({
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        language: 'English',
        fiscalYearStart: 'April',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    });
    
    const [bookingSettings, setBookingSettings] = useState({
        autoConfirmBookings: false,
        allowOverbooking: false,
        overbookingLimit: 10,
        requireAdvancePayment: true,
        advancePaymentPercent: 25,
        cancellationPolicy: 'flexible',
        allowSameDayBooking: true,
        maxRoomsPerBooking: 5
    });
    
    const [roomManagement, setRoomManagement] = useState({
        autoAssignRooms: true,
        blockMaintenanceRooms: true,
        housekeepingBuffer: 60,
        roomUpgradePolicy: 'automatic',
        allowPartialPayments: true
    });
    
    const [pricing, setPricing] = useState({
        dynamicPricing: false,
        seasonalRates: true,
        weekendSurcharge: 20,
        holidaySurcharge: 30,
        groupDiscountThreshold: 5,
        groupDiscountPercent: 15
    });
    
    const handleHotelOperationChange = (key, value) => {
        setHotelOperations(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSystemConfigChange = (key, value) => {
        setSystemConfig(prev => ({ ...prev, [key]: value }));
    };
    
    const handleBookingSettingChange = (key, value) => {
        setBookingSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const handleRoomManagementChange = (key, value) => {
        setRoomManagement(prev => ({ ...prev, [key]: value }));
    };
    
    const handlePricingChange = (key, value) => {
        setPricing(prev => ({ ...prev, [key]: value }));
    };
    
    const handleWorkingDayToggle = (day) => {
        setSystemConfig(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-sm" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>Operational Settings</h2>
            
            <div className="space-y-8">
                {/* Hotel Operations */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Clock size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Hotel Operations</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Check-in Time</label>
                            <input
                                type="time"
                                value={hotelOperations.checkInTime}
                                onChange={(e) => handleHotelOperationChange('checkInTime', e.target.value)}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Check-out Time</label>
                            <input
                                type="time"
                                value={hotelOperations.checkOutTime}
                                onChange={(e) => handleHotelOperationChange('checkOutTime', e.target.value)}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Grace Period (minutes)</label>
                            <input
                                type="number"
                                value={hotelOperations.gracePeriod}
                                onChange={(e) => handleHotelOperationChange('gracePeriod', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                min="0"
                                max="120"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Late Checkout Fee (₹)</label>
                            <input
                                type="number"
                                value={hotelOperations.lateCheckoutFee}
                                onChange={(e) => handleHotelOperationChange('lateCheckoutFee', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Early Checkin Fee (₹)</label>
                            <input
                                type="number"
                                value={hotelOperations.earlyCheckinFee}
                                onChange={(e) => handleHotelOperationChange('earlyCheckinFee', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Max Stay Duration (days)</label>
                            <input
                                type="number"
                                value={hotelOperations.maxStayDuration}
                                onChange={(e) => handleHotelOperationChange('maxStayDuration', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                min="1"
                                max="365"
                            />
                        </div>
                    </div>
                </div>

                {/* System Configuration */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Settings size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>System Configuration</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Currency</label>
                                <select
                                    value={systemConfig.currency}
                                    onChange={(e) => handleSystemConfigChange('currency', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                >
                                    <option value="INR">INR (₹)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Timezone</label>
                                <select
                                    value={systemConfig.timezone}
                                    onChange={(e) => handleSystemConfigChange('timezone', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                >
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">America/New_York (EST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Date Format</label>
                                <select
                                    value={systemConfig.dateFormat}
                                    onChange={(e) => handleSystemConfigChange('dateFormat', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                >
                                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Working Days</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <label key={day} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={systemConfig.workingDays.includes(day)}
                                            onChange={() => handleWorkingDayToggle(day)}
                                            className="mr-2 h-4 w-4"
                                            style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                        />
                                        <span className="text-sm">{day.slice(0, 3)}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Settings */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Booking Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Auto-confirm bookings</span>
                                <input
                                    type="checkbox"
                                    checked={bookingSettings.autoConfirmBookings}
                                    onChange={(e) => handleBookingSettingChange('autoConfirmBookings', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Allow overbooking</span>
                                <input
                                    type="checkbox"
                                    checked={bookingSettings.allowOverbooking}
                                    onChange={(e) => handleBookingSettingChange('allowOverbooking', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            {bookingSettings.allowOverbooking && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Overbooking Limit (%)</label>
                                    <input
                                        type="number"
                                        value={bookingSettings.overbookingLimit}
                                        onChange={(e) => handleBookingSettingChange('overbookingLimit', parseInt(e.target.value))}
                                        className="w-full p-2 border rounded"
                                        style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                        min="0"
                                        max="50"
                                    />
                                </div>
                            )}
                            <label className="flex items-center justify-between">
                                <span>Require advance payment</span>
                                <input
                                    type="checkbox"
                                    checked={bookingSettings.requireAdvancePayment}
                                    onChange={(e) => handleBookingSettingChange('requireAdvancePayment', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            {bookingSettings.requireAdvancePayment && (
                                <div>
                                    <label className="block text-sm font-medium mb-2">Advance Payment (%)</label>
                                    <input
                                        type="number"
                                        value={bookingSettings.advancePaymentPercent}
                                        onChange={(e) => handleBookingSettingChange('advancePaymentPercent', parseInt(e.target.value))}
                                        className="w-full p-2 border rounded"
                                        style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                        min="10"
                                        max="100"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Cancellation Policy</label>
                                <select
                                    value={bookingSettings.cancellationPolicy}
                                    onChange={(e) => handleBookingSettingChange('cancellationPolicy', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                >
                                    <option value="flexible">Flexible (24h before)</option>
                                    <option value="moderate">Moderate (48h before)</option>
                                    <option value="strict">Strict (72h before)</option>
                                    <option value="non-refundable">Non-refundable</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Max Rooms per Booking</label>
                                <input
                                    type="number"
                                    value={bookingSettings.maxRoomsPerBooking}
                                    onChange={(e) => handleBookingSettingChange('maxRoomsPerBooking', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    min="1"
                                    max="20"
                                />
                            </div>
                            <label className="flex items-center justify-between">
                                <span>Allow same-day booking</span>
                                <input
                                    type="checkbox"
                                    checked={bookingSettings.allowSameDayBooking}
                                    onChange={(e) => handleBookingSettingChange('allowSameDayBooking', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Room Management */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={20} style={{color: 'hsl(45, 43%, 58%)'}} />
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Room Management</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Auto-assign rooms</span>
                                <input
                                    type="checkbox"
                                    checked={roomManagement.autoAssignRooms}
                                    onChange={(e) => handleRoomManagementChange('autoAssignRooms', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Block maintenance rooms</span>
                                <input
                                    type="checkbox"
                                    checked={roomManagement.blockMaintenanceRooms}
                                    onChange={(e) => handleRoomManagementChange('blockMaintenanceRooms', e.target.checked)}
                                    className="h-4 w-4"
                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                />
                            </label>
                            <div>
                                <label className="block text-sm font-medium mb-2">Housekeeping Buffer (minutes)</label>
                                <input
                                    type="number"
                                    value={roomManagement.housekeepingBuffer}
                                    onChange={(e) => handleRoomManagementChange('housekeepingBuffer', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                    min="15"
                                    max="180"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Room Upgrade Policy</label>
                                <select
                                    value={roomManagement.roomUpgradePolicy}
                                    onChange={(e) => handleRoomManagementChange('roomUpgradePolicy', e.target.value)}
                                    className="w-full p-2 border rounded"
                                    style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                >
                                    <option value="automatic">Automatic (Free)</option>
                                    <option value="paid">Paid Upgrade</option>
                                    <option value="manual">Manual Only</option>
                                    <option value="disabled">Disabled</option>
                                </select>
                            </div>
                            <label className="flex items-center justify-between">
                                <span>Allow partial payments</span>
                                <input
                                    type="checkbox"
                                    checked={roomManagement.allowPartialPayments}
                                    onChange={(e) => handleRoomManagementChange('allowPartialPayments', e.target.checked)}
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
                        <Save size={16} /> Save Operational Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OperationalSettings;