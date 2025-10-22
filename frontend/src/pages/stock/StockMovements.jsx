import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, RefreshCw, ArrowLeftRight, RotateCcw } from 'lucide-react';
import * as stockService from '../../services/stockService';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [formData, setFormData] = useState({
    item_id: '',
    movement_type: '',
    quantity: '',
    unit_cost: '',
    supplier_id: '',
    reference: '',
    notes: ''
  });

  const movementTypes = [
    { value: 'purchase', label: 'Purchase', icon: TrendingUp, color: 'text-green-600' },
    { value: 'usage', label: 'Usage', icon: TrendingDown, color: 'text-red-600' },
    { value: 'adjustment', label: 'Adjustment', icon: RefreshCw, color: 'text-blue-600' },
    { value: 'transfer', label: 'Transfer', icon: ArrowLeftRight, color: 'text-purple-600' },
    { value: 'return', label: 'Return', icon: RotateCcw, color: 'text-orange-600' }
  ];

  useEffect(() => {
    fetchMovements();
    fetchItems();
    fetchSuppliers();
  }, [filterType, filterItem]);

  const fetchMovements = async () => {
    try {
      const params = {};
      if (filterType) params.movement_type = filterType;
      if (filterItem) params.item_id = filterItem;

      const response = await stockService.getStockMovements(params);
      setMovements(response.data || []);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await stockService.getStockItems();
      setItems(response.data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await stockService.getSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
        unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
        total_cost: formData.unit_cost ? parseFloat(formData.unit_cost) * parseInt(formData.quantity) : null
      };

      await stockService.createStockMovement(payload);
      setShowModal(false);
      resetForm();
      fetchMovements();
      fetchItems(); // Refresh items to show updated quantities
      alert('Movement recorded successfully!');
    } catch (error) {
      console.error('Error recording movement:', error);
      alert('Failed to record movement: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      item_id: '',
      movement_type: '',
      quantity: '',
      unit_cost: '',
      supplier_id: '',
      reference: '',
      notes: ''
    });
  };

  const getMovementTypeInfo = (type) => {
    return movementTypes.find(t => t.value === type) || movementTypes[0];
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `${parseFloat(amount).toLocaleString('en-RW')} RWF`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <TrendingUp className="inline mr-2 mb-1" size={32} />
          Stock Movements
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Record Movement
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filterItem}
            onChange={(e) => setFilterItem(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Items</option>
            {items.map(item => (
              <option key={item.item_id} value={item.item_id}>{item.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Movement Types</option>
            {movementTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            Total Movements: <span className="font-bold ml-2">{movements.length}</span>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {movements.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No movements found
                </td>
              </tr>
            ) : (
              movements.map((movement) => {
                const typeInfo = getMovementTypeInfo(movement.movement_type);
                const TypeIcon = typeInfo.icon;
                return (
                  <tr key={movement.movement_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(movement.movement_date || movement.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{movement.item?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{movement.notes?.substring(0, 30)}{movement.notes?.length > 30 ? '...' : ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 ${typeInfo.color} font-semibold`}>
                        <TypeIcon size={16} />
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {movement.quantity} {movement.item?.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(movement.total_cost)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {movement.supplier?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {movement.reference || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {movement.staff?.name || '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Record Stock Movement</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                  <select
                    required
                    value={formData.item_id}
                    onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select item</option>
                    {items.map(item => (
                      <option key={item.item_id} value={item.item_id}>
                        {item.name} (Current: {item.quantity} {item.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type *</label>
                  <select
                    required
                    value={formData.movement_type}
                    onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {movementTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost (RWF)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Cost per unit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(s => (
                      <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Invoice/PO number"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes"
                  />
                </div>

                {formData.quantity && formData.unit_cost && (
                  <div className="col-span-2 bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Total Cost:</strong> {formatCurrency(parseFloat(formData.unit_cost) * parseInt(formData.quantity))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Record Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovements;
