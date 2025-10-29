import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { showToast } from '../utils/toaster';
import { Plus, Package, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';

const Disbursh = () => {
  const { axios } = useAppContext();
  const [disbursements, setDisbursements] = useState([]);
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [pantries, setPantries] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'kitchen_to_pantry',
    items: [{ itemId: '', quantity: 1 }],
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const requests = [
        axios.get('/api/disbursements', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).catch(() => ({ data: [] })),
        axios.get('/api/kitchen-orders', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).catch(() => ({ data: [] })),
        axios.get('/api/vendor/all', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).catch(() => ({ data: [] })),
        axios.get('/api/pantry/items', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }).catch(() => ({ data: [] }))
      ];
      
      const [disbursementsRes, kitchenOrdersRes, pantriesRes, itemsRes] = await Promise.all(requests);
      
      setDisbursements(disbursementsRes.data || []);
      setKitchenOrders(kitchenOrdersRes.data || []);
      const pantriesData = pantriesRes.data;
      setPantries(Array.isArray(pantriesData) ? pantriesData : (pantriesData?.vendors || pantriesData?.data || []));
      const itemsData = itemsRes.data;
      setItems(Array.isArray(itemsData) ? itemsData : (itemsData?.items || itemsData?.data || []));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validItems = formData.items.filter(item => item.itemId && item.quantity > 0);
    if (validItems.length === 0) {
      showToast.error('Please add at least one valid item');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post('/api/disbursements', {
        ...formData,
        items: validItems
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      showToast.success('Disbursement created successfully');
      resetForm();
      fetchData();
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to create disbursement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'kitchen_to_pantry',
      items: [{ itemId: '', quantity: 1 }],
      notes: ''
    });
    setShowForm(false);
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { itemId: '', quantity: 1 }]
    });
  };

  const updateItem = (index, field, value) => {
    const updatedItems = formData.items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setFormData({ ...formData, items: updatedItems });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={16} />;
      case 'cancelled': return <XCircle className="text-red-500" size={16} />;
      default: return <Clock className="text-yellow-500" size={16} />;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Stock Disbursements</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-amber-700 hover:to-orange-700 flex items-center gap-2 shadow-lg transition-all duration-200"
        >
          <Plus size={20} />
          New Disbursement
        </button>
      </div>

      {/* Disbursements List */}
      <div className="bg-white rounded-lg shadow-xl border border-amber-200">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-100 to-orange-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">From → To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-amber-800 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200">
                {disbursements.map((disbursement) => (
                  <tr key={disbursement._id} className="hover:bg-amber-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-900">
                      {disbursement.disbursementNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                      {disbursement.type?.replace('_', ' ') || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                      <div className="flex items-center gap-2">
                        <span>{disbursement.type === 'kitchen_to_pantry' ? 'Kitchen → Pantry' : disbursement.type === 'pantry_to_kitchen' ? 'Pantry → Kitchen' : 'Adjustment'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                      {disbursement.totalItems || disbursement.items?.length} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(disbursement.status)}
                        <span className="text-sm capitalize">{disbursement.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-700">
                      {new Date(disbursement.disbursedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-amber-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-t-lg">
              <h2 className="text-xl font-bold mb-4 text-amber-900">Create Disbursement</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="kitchen_to_pantry">Kitchen to Pantry</option>
                    <option value="pantry_to_kitchen">Pantry to Kitchen</option>
                    <option value="stock_adjustment">Stock Adjustment</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-amber-800">Items</label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-amber-600 hover:text-amber-800 text-sm font-medium"
                    >
                      + Add Item
                    </button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                      <select
                        value={item.itemId}
                        onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                        className="px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        required
                      >
                        <option value="">Select Item</option>
                        {Array.isArray(items) && items.map(itm => (
                          <option key={itm._id} value={itm._id}>{itm.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        placeholder="Quantity"
                        className="px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        min="1"
                        required
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-amber-300 rounded-md text-amber-700 hover:bg-amber-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-md hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all duration-200"
                  >
                    {loading ? 'Creating...' : 'Create Disbursement'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Disbursh;
// tton
//                       type="button"
//                       onClick={addItem}
//                       className="text-amber-600 hover:text-amber-800 text-sm"
//                     >
//                       + Add Item
//                     </button>
//                   </div>
//                   {formData.items.map((item, index) => (
//                     <div key={index} className="grid grid-cols-2 gap-2 mb-2">
//                       <div>
//                         <label className="block text-xs font-medium text-gray-600 mb-1">Item</label>
//                         <select
//                           value={item.itemId}
//                           onChange={(e) => updateItem(index, 'itemId', e.target.value)}
//                           className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
//                         >
//                           <option value="">Select Item</option>
//                           {items.map(itm => (
//                             <option key={itm._id} value={itm._id}>
//                               {itm.name}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
//                         <input
//                           type="number"
//                           value={item.quantity}
//                           onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
//                           className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
//                           min="1"
//                         />
//                       </div>
//                     </div>
//                   ))}
//                   {items.length === 0 && (
//                     <p className="text-sm text-red-600 mt-1">No items available</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-amber-800 mb-1">Notes</label>
//                   <textarea
//                     value={formData.notes}
//                     onChange={(e) => setFormData({...formData, notes: e.target.value})}
//                     className="w-full px-3 py-2 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
//                     rows="3"
//                     placeholder="Additional notes..."
//                   />
//                 </div>

//                 <div className="flex justify-end gap-2 pt-4">
//                   <button
//                     type="button"
//                     onClick={resetForm}
//                     className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
//                   >
//                     {loading ? 'Creating...' : 'Create Disbursement'}
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Disbursh;