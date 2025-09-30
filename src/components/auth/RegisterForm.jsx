import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const RegisterForm = ({ onSuccess }) => {
  const { axios } = useAppContext();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
    department: []
  });
  const [loading, setLoading] = useState(false);

  const departments = [
    { id: 1, name: 'housekeeping' },
    { id: 2, name: 'laundry' },
    { id: 3, name: 'kitchen' },
    { id: 4, name: 'reception' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDepartmentChange = (e) => {
    const { value, checked } = e.target;
    const dept = departments.find(d => d.name === value);
    
    setFormData(prev => ({
      ...prev,
      department: checked 
        ? [...prev.department, dept]
        : prev.department.filter(d => d.name !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/register', formData);
      
      if (data.success) {
        toast.success('User registered successfully!');
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'staff',
          department: []
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register User</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Departments</label>
          <div className="space-y-2">
            {departments.map(dept => (
              <label key={dept.id} className="flex items-center">
                <input
                  type="checkbox"
                  value={dept.name}
                  checked={formData.department.some(d => d.name === dept.name)}
                  onChange={handleDepartmentChange}
                  className="mr-2"
                />
                {dept.name}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Registering...' : 'Register User'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;