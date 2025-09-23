import React, { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';

const BusinessSettings = () => {
    const [hotelInfo, setHotelInfo] = useState({
        name: 'Buddha Avenue Hotel',
        address: '123 Main Street, City',
        phone: '+91 9876543210',
        email: 'info@buddhaavenue.com',
        website: 'www.buddhaavenue.com',
        license: 'HTL-2024-001',
        gst: '22AAAAA0000A1Z5'
    });
    
    const [departments, setDepartments] = useState([
        { id: 1, name: 'Front Desk', enabled: true, manager: 'John Doe' },
        { id: 2, name: 'Housekeeping', enabled: true, manager: 'Jane Smith' },
        { id: 3, name: 'Restaurant', enabled: true, manager: 'Mike Johnson' },
        { id: 4, name: 'Banquet', enabled: true, manager: 'Sarah Wilson' },
        { id: 5, name: 'Laundry', enabled: false, manager: '' },
        { id: 6, name: 'Spa', enabled: false, manager: '' }
    ]);
    
    const [taxes, setTaxes] = useState([
        { id: 1, name: 'GST', rate: 18, type: 'percentage', applicable: 'all' },
        { id: 2, name: 'Service Charge', rate: 10, type: 'percentage', applicable: 'restaurant' },
        { id: 3, name: 'Tourism Tax', rate: 50, type: 'fixed', applicable: 'rooms' }
    ]);
    
    const handleHotelInfoChange = (field, value) => {
        setHotelInfo(prev => ({ ...prev, [field]: value }));
    };
    
    const handleDepartmentToggle = (id) => {
        setDepartments(prev => prev.map(dept => 
            dept.id === id ? { ...dept, enabled: !dept.enabled } : dept
        ));
    };
    
    const handleManagerChange = (id, manager) => {
        setDepartments(prev => prev.map(dept => 
            dept.id === id ? { ...dept, manager } : dept
        ));
    };
    
    const handleTaxChange = (id, field, value) => {
        setTaxes(prev => prev.map(tax => 
            tax.id === id ? { ...tax, [field]: value } : tax
        ));
    };
    
    const addNewTax = () => {
        const newTax = {
            id: Date.now(),
            name: 'New Tax',
            rate: 0,
            type: 'percentage',
            applicable: 'all'
        };
        setTaxes(prev => [...prev, newTax]);
    };
    
    const deleteTax = (id) => {
        setTaxes(prev => prev.filter(tax => tax.id !== id));
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-sm" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>Business / Hotel Settings</h2>
            
            <div className="space-y-8">
                {/* Hotel Information */}
                <div>
                    <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Hotel Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Hotel Name</label>
                            <input 
                                type="text" 
                                value={hotelInfo.name}
                                onChange={(e) => handleHotelInfoChange('name', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input 
                                type="text" 
                                value={hotelInfo.phone}
                                onChange={(e) => handleHotelInfoChange('phone', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <textarea 
                                value={hotelInfo.address}
                                onChange={(e) => handleHotelInfoChange('address', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                rows="2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input 
                                type="email" 
                                value={hotelInfo.email}
                                onChange={(e) => handleHotelInfoChange('email', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Website</label>
                            <input 
                                type="text" 
                                value={hotelInfo.website}
                                onChange={(e) => handleHotelInfoChange('website', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">License Number</label>
                            <input 
                                type="text" 
                                value={hotelInfo.license}
                                onChange={(e) => handleHotelInfoChange('license', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">GST Number</label>
                            <input 
                                type="text" 
                                value={hotelInfo.gst}
                                onChange={(e) => handleHotelInfoChange('gst', e.target.value)}
                                className="w-full px-3 py-2 border rounded-md"
                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                            />
                        </div>
                    </div>
                </div>

                {/* Departments & Services */}
                <div>
                    <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Departments & Services</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Department
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Status
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Manager
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(dept => (
                                    <tr key={dept.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {dept.name}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={dept.enabled}
                                                    onChange={() => handleDepartmentToggle(dept.id)}
                                                    className="mr-2"
                                                    style={{accentColor: 'hsl(45, 43%, 58%)'}}
                                                />
                                                {dept.enabled ? 'Active' : 'Inactive'}
                                            </label>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <input
                                                type="text"
                                                value={dept.manager}
                                                onChange={(e) => handleManagerChange(dept.id, e.target.value)}
                                                className="w-full px-2 py-1 border rounded"
                                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                                placeholder="Manager name"
                                                disabled={!dept.enabled}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tax & Charges Setup */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Tax & Charges Setup</h3>
                        <button 
                            onClick={addNewTax}
                            className="flex items-center gap-2 px-4 py-2 text-white rounded hover:opacity-90"
                            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                        >
                            <Plus size={16} /> Add Tax
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Tax Name
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Rate
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Type
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Applicable To
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {taxes.map(tax => (
                                    <tr key={tax.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <input
                                                type="text"
                                                value={tax.name}
                                                onChange={(e) => handleTaxChange(tax.id, 'name', e.target.value)}
                                                className="w-full px-2 py-1 border rounded"
                                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                            />
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <input
                                                type="number"
                                                value={tax.rate}
                                                onChange={(e) => handleTaxChange(tax.id, 'rate', parseFloat(e.target.value))}
                                                className="w-full px-2 py-1 border rounded"
                                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                            />
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <select
                                                value={tax.type}
                                                onChange={(e) => handleTaxChange(tax.id, 'type', e.target.value)}
                                                className="w-full px-2 py-1 border rounded"
                                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                            >
                                                <option value="percentage">Percentage</option>
                                                <option value="fixed">Fixed Amount</option>
                                            </select>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <select
                                                value={tax.applicable}
                                                onChange={(e) => handleTaxChange(tax.id, 'applicable', e.target.value)}
                                                className="w-full px-2 py-1 border rounded"
                                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                            >
                                                <option value="all">All Services</option>
                                                <option value="rooms">Rooms Only</option>
                                                <option value="restaurant">Restaurant Only</option>
                                                <option value="banquet">Banquet Only</option>
                                            </select>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <button 
                                                onClick={() => deleteTax(tax.id)}
                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
            </div>
        </div>
    );
};

export default BusinessSettings;