import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import * as stockService from '../../services/stockService';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [orderItems, setOrderItems] = useState([{ item_id: '', quantity_ordered: '', unit_price: '' }]);
  const [formData, setFormData] = useState({
    homestay_id: '',
    supplier_id: '',
    expected_delivery_date: '',
    notes: ''
  });

  const statuses = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Package },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: ShoppingBag },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle }
  ];

  useEffect(() => {
    fetchOrders();
    fetchItems();
    fetchSuppliers();
  }, [filterStatus]);

  const fetchOrders = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;

      const response = await stockService.getStockOrders(params);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      const validItems = orderItems.filter(item => item.item_id && item.quantity_ordered && item.unit_price);

      if (validItems.length === 0) {
        alert('Please add at least one item to the order');
        return;
      }

      const payload = {
        ...formData,
        items: validItems.map(item => ({
          item_id: parseInt(item.item_id),
          quantity_ordered: parseInt(item.quantity_ordered),
          unit_price: parseFloat(item.unit_price)
        }))
      };

      await stockService.createStockOrder(payload);
      setShowModal(false);
      resetForm();
      fetchOrders();
      alert('Purchase order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReceiveOrder = async (orderId) => {
    if (!window.confirm('Mark this order as received and update stock quantities?')) return;
    try {
      await stockService.receiveStockOrder(orderId);
      fetchOrders();
      alert('Order received successfully! Stock quantities updated.');
    } catch (error) {
      console.error('Error receiving order:', error);
      alert('Failed to receive order: ' + (error.response?.data?.message || error.message));
    }
  };

  const addOrderItem = () => {
    setOrderItems([...orderItems, { item_id: '', quantity_ordered: '', unit_price: '' }]);
  };

  const removeOrderItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const resetForm = () => {
    setFormData({
      homestay_id: '',
      supplier_id: '',
      expected_delivery_date: '',
      notes: ''
    });
    setOrderItems([{ item_id: '', quantity_ordered: '', unit_price: '' }]);
  };

  const getStatusInfo = (status) => {
    return statuses.find(s => s.value === status) || statuses[0];
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 RWF';
    return `${parseFloat(amount).toLocaleString('en-RW')} RWF`;
  };

  const calculateOrderTotal = () => {
    return orderItems.reduce((total, item) => {
      const qty = parseInt(item.quantity_ordered) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return total + (qty * price);
    }, 0);
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
          <ShoppingBag className="inline mr-2 mb-1" size={32} />
          Purchase Orders
        </h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Create Order
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          {statuses.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No purchase orders found
          </div>
        ) : (
          orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            return (
              <div key={order.order_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Supplier: <span className="font-medium">{order.supplier?.name}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Order Date: {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
                      <StatusIcon size={16} />
                      {statusInfo.label}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-left">Quantity</th>
                        <th className="px-4 py-2 text-left">Unit Price</th>
                        <th className="px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="px-4 py-2">{item.item?.name}</td>
                          <td className="px-4 py-2">{item.quantity_ordered} {item.item?.unit}</td>
                          <td className="px-4 py-2">{formatCurrency(item.unit_price)}</td>
                          <td className="px-4 py-2 font-semibold">{formatCurrency(item.total_price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {order.status === 'shipped' && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleReceiveOrder(order.order_id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Receive Order
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Create Purchase Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <select
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={formData.expected_delivery_date}
                    onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Order Items *</label>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>

                {orderItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2">
                    <select
                      value={item.item_id}
                      onChange={(e) => updateOrderItem(index, 'item_id', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select item</option>
                      {items.map(i => (
                        <option key={i.item_id} value={i.item_id}>{i.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={item.quantity_ordered}
                      onChange={(e) => updateOrderItem(index, 'quantity_ordered', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="Unit Price (RWF)"
                      value={item.unit_price}
                      onChange={(e) => updateOrderItem(index, 'unit_price', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeOrderItem(index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      disabled={orderItems.length === 1}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="text-right">
                  <span className="text-sm text-blue-800">Order Total:</span>
                  <span className="text-xl font-bold text-blue-900 ml-2">
                    {formatCurrency(calculateOrderTotal())}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
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
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
