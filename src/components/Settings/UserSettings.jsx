import React, { useState } from 'react';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

const UserSettings = () => {
    const [roles, setRoles] = useState([
        { id: 1, name: 'Admin', permissions: ['all'], users: 2 },
        { id: 2, name: 'Manager', permissions: ['booking', 'staff', 'reports'], users: 3 },
        { id: 3, name: 'Staff', permissions: ['booking', 'tasks'], users: 8 },
        { id: 4, name: 'Housekeeping', permissions: ['tasks', 'rooms'], users: 5 }
    ]);
    
    const [staff, setStaff] = useState([
        { id: 1, name: 'John Doe', email: 'john@hotel.com', role: 'Admin', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@hotel.com', role: 'Manager', status: 'Active' },
        { id: 3, name: 'Mike Johnson', email: 'mike@hotel.com', role: 'Staff', status: 'Inactive' }
    ]);
    
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    
    const handleDeleteRole = (id) => {
        setRoles(roles.filter(role => role.id !== id));
    };
    
    const handleEditRole = (role) => {
        setEditingRole(role);
        setShowRoleModal(true);
    };
    
    const handleUpdateStaffRole = (staffId, newRole) => {
        setStaff(staff.map(s => s.id === staffId ? {...s, role: newRole} : s));
    };

    return (
        <div className="bg-white p-6 rounded-md shadow-sm" style={{border: '1px solid hsl(45, 100%, 85%)'}}>
            <h2 className="text-2xl font-bold mb-6" style={{color: 'hsl(45, 100%, 20%)'}}>User & Role Settings</h2>
            
            <div className="space-y-8">
                {/* Role Management */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold" style={{color: 'hsl(45, 100%, 20%)'}}>Role Management</h3>
                        <button 
                            onClick={() => setShowRoleModal(true)}
                            className="flex items-center gap-2 px-4 py-2 text-white rounded hover:opacity-90"
                            style={{backgroundColor: 'hsl(45, 43%, 58%)'}}
                        >
                            <Plus size={16} /> Add Role
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Role Name
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Permissions
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Users
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles.map(role => (
                                    <tr key={role.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {role.name}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {role.permissions.join(', ')}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <span className="flex items-center gap-1">
                                                <Users size={16} /> {role.users}
                                            </span>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleEditRole(role)}
                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteRole(role.id)}
                                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
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

                {/* Staff Access Control */}
                <div>
                    <h3 className="text-xl font-semibold mb-4" style={{color: 'hsl(45, 100%, 20%)'}}>Staff Access Control</h3>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr style={{backgroundColor: 'hsl(45, 100%, 95%)'}}>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Name
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Email
                                    </th>
                                    <th className="border p-3 text-left" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                        Role
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
                                {staff.map(member => (
                                    <tr key={member.id}>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {member.name}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            {member.email}
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <select 
                                                value={member.role}
                                                onChange={(e) => handleUpdateStaffRole(member.id, e.target.value)}
                                                className="p-1 border rounded"
                                                style={{borderColor: 'hsl(45, 100%, 85%)'}}
                                            >
                                                {roles.map(role => (
                                                    <option key={role.id} value={role.name}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                member.status === 'Active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {member.status}
                                            </span>
                                        </td>
                                        <td className="border p-3" style={{borderColor: 'hsl(45, 100%, 85%)'}}>
                                            <button className="text-blue-600 hover:underline text-sm">
                                                Edit Permissions
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;