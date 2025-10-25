import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    supplier_id: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    items: [],
    total_amount: 0,
    notes: '',
    status: 'pending'
  });
  const [newItem, setNewItem] = useState({
    item_id: '',
    quantity: '',
    total_price: 0
  });
  
  // Received quantities form state
  const [receivedQuantities, setReceivedQuantities] = useState({});

  useEffect(() => {
    fetchPurchaseOrders();
    fetchSuppliers();
    fetchStockItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter, supplierFilter, searchTerm]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/stock/orders');
      const ordersData = response.data?.data || response.data || [];
      
      console.log('Fetched orders data:', ordersData);
      if (ordersData.length > 0) {
        console.log('First order structure:', ordersData[0]);
        console.log('First order items:', ordersData[0].items);
      }
      
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching purchase orders:', err);
      setError('Failed to load purchase orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await apiClient.get('/stock/suppliers');
      const suppliersData = response.data?.data || response.data || [];
      setSuppliers(suppliersData);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  const fetchStockItems = async () => {
    try {
      const response = await apiClient.get('/stock/items');
      const itemsData = response.data?.data || response.data || [];
      setStockItems(itemsData);
    } catch (err) {
      console.error('Error fetching stock items:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(order => order.supplier_id === supplierFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleAddOrder = async () => {
    try {
      // Generate order number
      const orderNumber = `PO-${Date.now()}`;
      
      // Prepare order data with required fields
      const orderData = {
        ...formData,
        homestay_id: user?.assigned_hotel_id || 1, // Use user's hotel or default to 1
        order_number: orderNumber,
        status: 'pending'
      };
      
      const response = await apiClient.post('/stock/orders', orderData);
      
      if (response.data.success) {
        toast.success('Purchase order created successfully');
        setShowAddModal(false);
        setFormData({
          supplier_id: '',
          order_date: new Date().toISOString().split('T')[0],
          expected_delivery_date: '',
          items: [],
          total_amount: 0,
          notes: '',
          status: 'pending'
        });
        fetchPurchaseOrders();
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error('Failed to create purchase order');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Updating order ${orderId} status to: ${newStatus}`);
      let response;
      
      if (newStatus === 'sent') {
        // Call the send-email endpoint for 'sent' status
        response = await apiClient.post(`/stock/orders/${orderId}/send-email`);
      } else {
        // Regular status update
        response = await apiClient.patch(`/stock/orders/${orderId}`, {
          status: newStatus
        });
      }
      
      console.log('Status update response:', response.data);
      
      if (response.data.success) {
        const statusMessages = {
          'verified': 'Order verified successfully',
          'approved': 'Order approved successfully',
          'sent': 'Purchase order sent to supplier successfully',
          'received': 'Order marked as received successfully',
          'cancelled': 'Order cancelled successfully'
        };
        
        toast.success(statusMessages[newStatus] || `Order ${newStatus} successfully`);
        fetchPurchaseOrders();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const addItemToOrder = () => {
    if (newItem.item_id && newItem.quantity) {
      const selectedItem = stockItems.find(item => item.item_id == newItem.item_id);
      if (selectedItem) {
        const totalPrice = parseFloat(newItem.quantity) * parseFloat(selectedItem.unit_price || 0);
        const item = {
          item_id: newItem.item_id,
          item_name: selectedItem.name || selectedItem.item_name,
          quantity: parseFloat(newItem.quantity),
          unit_price: parseFloat(selectedItem.unit_price || 0),
          total_price: totalPrice
        };
        
        setFormData({
          ...formData,
          items: [...formData.items, item],
          total_amount: formData.total_amount + totalPrice
        });
        
        setNewItem({
          item_id: '',
          quantity: '',
          total_price: 0
        });
      }
    }
  };

  const removeItemFromOrder = (index) => {
    const item = formData.items[index];
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
      total_amount: formData.total_amount - item.total_price
    });
  };

  const handleMarkAsReceived = async () => {
    try {
      console.log('Marking order as received:', selectedOrder.order_id, receivedQuantities);
      
      const response = await apiClient.patch(`/stock/orders/${selectedOrder.order_id}/receive`, {
        received_quantities: receivedQuantities
      });
      
      if (response.data.success) {
        toast.success('Items marked as received successfully');
        setShowReceiveModal(false);
        setReceivedQuantities({});
        fetchPurchaseOrders();
      }
    } catch (error) {
      console.error('Error marking items as received:', error);
      toast.error('Failed to mark items as received');
    }
  };

  const openReceiveModal = (order) => {
    setSelectedOrder(order);
    // Initialize received quantities with current values
    const initialQuantities = {};
    if (order.items) {
      order.items.forEach(item => {
        initialQuantities[item.order_item_id] = item.quantity_received || 0;
      });
    }
    setReceivedQuantities(initialQuantities);
    setShowReceiveModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'verified': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-indigo-100 text-indigo-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    console.log('getStatusText called with status:', status, 'type:', typeof status);
    switch (status) {
      case 'pending': return 'Pending Verification';
      case 'verified': return 'Verified - Pending Approval';
      case 'approved': return 'Approved - Ready to Send';
      case 'sent': return 'Sent to Supplier';
      case 'received': return 'Received';
      case 'cancelled': return 'Cancelled';
      default: 
        console.log('Unknown status:', status);
        return `Unknown (${status})`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Truck className="h-4 w-4" />;
      case 'received': return <Truck className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchPurchaseOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                Purchase Orders Management
        </h1>
              <p className="text-gray-600 mt-1">
                Create and track purchase orders with approval workflow
              </p>
            </div>
        <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
              <Plus className="h-4 w-4" />
          Create Order
        </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Verification</option>
              <option value="verified">Verified - Pending Approval</option>
              <option value="approved">Approved - Ready to Send</option>
              <option value="sent">Sent to Supplier</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>

        <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.name}
                </option>
              ))}
        </select>

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
      </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">
              Purchase Orders ({filteredOrders.length})
                    </h3>
                </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No purchase orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expected Delivery
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                      </tr>
                    </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.order_number || `PO-${order.order_id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items?.length || 0} items
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.supplier?.name || order.supplier_name || 'Unknown Supplier'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.order_date || order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.expected_delivery_date ? 
                          new Date(order.expected_delivery_date).toLocaleDateString() : 
                          'Not set'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        RWF {parseFloat(order.total_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusText(order.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/stock/orders/${order.order_id}`)}
                            className="px-3 py-1 bg-gray-100 text-gray-800 hover:bg-gray-200 rounded text-xs"
                          >
                            View
                          </button>
                          
                          {/* Role-based action buttons */}
                          {order.status === 'pending' && user?.role === 'accountant' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.order_id, 'verified')}
                              className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded text-xs"
                            >
                              Verify
                            </button>
                          )}
                          
                          {order.status === 'verified' && (user?.role === 'vendor' || user?.role === 'manager' || user?.role === 'admin') && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.order_id, 'approved')}
                              className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs"
                            >
                              Approve
                            </button>
                          )}
                          
                          {order.status === 'approved' && (user?.role === 'vendor' || user?.role === 'manager' || user?.role === 'admin') && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.order_id, 'sent')}
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 rounded text-xs"
                            >
                              Send to Supplier
                            </button>
                          )}
                          
                          {order.status === 'sent' && user?.role === 'inventory' && (
                            <button
                              onClick={() => openReceiveModal(order)}
                              className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 rounded text-xs"
                            >
                              Mark Received
                            </button>
                          )}
                          
                          {/* Cancel button - only for pending/verified orders */}
                          {(order.status === 'pending' || order.status === 'verified') && (user?.role === 'vendor' || user?.role === 'manager' || user?.role === 'admin') && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.order_id, 'cancelled')}
                              className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
      </div>

      {/* Create Order Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Purchase Order</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Date</label>
                  <input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) => setFormData({...formData, order_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) => setFormData({...formData, expected_delivery_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                </div>

              {/* Items Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items</label>
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Item Name</label>
                      <select
                        value={newItem.item_id}
                        onChange={(e) => setNewItem({...newItem, item_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Item</option>
                        {stockItems.map(item => (
                          <option key={item.item_id} value={item.item_id}>
                            {item.name || item.item_name} - RWF {item.unit_price || 0}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addItemToOrder}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Add Item
                      </button>
                    </div>
                  </div>
                  
                  {/* Items List */}
                  {formData.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Order Items:</h4>
                      {formData.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <span className="text-sm font-medium">{item.item_name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {item.quantity} × RWF {item.unit_price} = RWF {item.total_price}
                            </span>
                          </div>
                    <button
                            onClick={() => removeItemFromOrder(index)}
                            className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                      <div className="pt-2 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total Amount:</span>
                          <span>RWF {formData.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
                </div>
            <div className="flex justify-end space-x-3 mt-6">
                <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                onClick={handleAddOrder}
                disabled={!formData.supplier_id || formData.items.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Order
                </button>
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <p className="text-sm text-gray-900">{selectedOrder.order_number || `PO-${selectedOrder.order_id}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="ml-1">{getStatusText(selectedOrder.status)}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <p className="text-sm text-gray-900">{selectedOrder.supplier?.name || selectedOrder.supplier_name || 'Unknown Supplier'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedOrder.order_date || selectedOrder.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Expected Delivery</label>
                  <p className="text-sm text-gray-900">
                    {selectedOrder.expected_delivery_date ? 
                      new Date(selectedOrder.expected_delivery_date).toLocaleDateString() : 
                      'Not set'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                  <p className="text-sm font-semibold text-gray-900">
                    RWF {parseFloat(selectedOrder.total_amount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
              {selectedOrder.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-sm text-gray-900">{selectedOrder.notes}</p>
                </div>
              )}
              
              {/* Order Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Items</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      {selectedOrder.items.map((orderItem, index) => (
                        <div key={index} className="p-3 bg-white rounded border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-gray-900">
                              {orderItem.item?.name || orderItem.item_name || 'Unknown Item'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {orderItem.item?.unit || 'pcs'} • Unit Price: RWF {parseFloat(orderItem.unit_price || 0).toLocaleString()}
                            </div>
                          </div>
                          
                          {/* Requested vs Received Quantities */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-blue-50 p-2 rounded">
                              <div className="font-medium text-blue-800">Requested</div>
                              <div className="text-blue-600">
                                Qty: {orderItem.quantity_ordered || orderItem.quantity || 0}
                              </div>
                              <div className="text-blue-600">
                                Total: RWF {parseFloat(orderItem.total_price || 0).toLocaleString()}
                              </div>
                            </div>
                            
                            <div className={`p-2 rounded ${
                              orderItem.quantity_received > 0 ? 'bg-green-50' : 'bg-gray-50'
                            }`}>
                              <div className={`font-medium ${
                                orderItem.quantity_received > 0 ? 'text-green-800' : 'text-gray-600'
                              }`}>
                                Received
                              </div>
                              <div className={`${
                                orderItem.quantity_received > 0 ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                Qty: {orderItem.quantity_received || 0}
                              </div>
                              <div className={`${
                                orderItem.quantity_received > 0 ? 'text-green-600' : 'text-gray-500'
                              }`}>
                                Total: RWF {parseFloat((orderItem.quantity_received || 0) * (orderItem.unit_price || 0)).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          
                          {/* Status Indicator */}
                          {orderItem.quantity_received > 0 && (
                            <div className="mt-2 text-xs text-green-600 font-medium">
                              ✓ Received {orderItem.quantity_received} of {orderItem.quantity_ordered || orderItem.quantity || 0}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Received Modal */}
      {showReceiveModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">Mark Items as Received</h3>
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Order: {selectedOrder.order_number || `PO-${selectedOrder.order_id}`} | 
                Supplier: {selectedOrder.supplier?.name || 'Unknown Supplier'}
              </div>
              
              {selectedOrder.items && selectedOrder.items.map((orderItem, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {orderItem.item?.name || orderItem.item_name || 'Unknown Item'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {orderItem.item?.unit || 'pcs'} • Unit Price: RWF {parseFloat(orderItem.unit_price || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Ordered: {orderItem.quantity_ordered || orderItem.quantity || 0}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Received
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={orderItem.quantity_ordered || orderItem.quantity || 0}
                        value={receivedQuantities[orderItem.order_item_id] || 0}
                        onChange={(e) => setReceivedQuantities({
                          ...receivedQuantities,
                          [orderItem.order_item_id]: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="text-sm text-gray-600">
                      Total: RWF {parseFloat((receivedQuantities[orderItem.order_item_id] || 0) * (orderItem.unit_price || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button
                onClick={() => {
                  setShowReceiveModal(false);
                  setReceivedQuantities({});
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsReceived}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Mark as Received
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;