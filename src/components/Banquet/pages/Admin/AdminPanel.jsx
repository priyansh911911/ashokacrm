import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import MenuItemManager from '../../components/MenuItemManager';
import PlanLimitManager from '../../components/PlanLimitManager';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('menu-items');
  const [initializing, setInitializing] = useState(false);

  const initializeDefaults = async () => {
    try {
      setInitializing(true);
      const response = await axios.post('http://localhost:5000/api/plan-limits/initialize');
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to initialize defaults');
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('menu-items')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'menu-items'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Menu Items
            </button>
            <button
              onClick={() => setActiveTab('plan-limits')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'plan-limits'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Plan Limits
            </button>
            </div>
            <button
              onClick={initializeDefaults}
              disabled={initializing}
              className="my-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {initializing ? 'Initializing...' : 'Initialize Default Limits'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {activeTab === 'menu-items' && <MenuItemManager />}
        {activeTab === 'plan-limits' && <PlanLimitManager />}
      </div>
    </div>
  );
};

export default AdminPanel;