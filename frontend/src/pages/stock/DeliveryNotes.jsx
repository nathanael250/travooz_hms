import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  Calendar,
  Package,
  Loader2,
  RefreshCw,
  FileText,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const DeliveryNotes = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    delivery_number: '',
    order_id: '',
    supplier_id: '',
    delivery_date: '',
    delivery_status: 'complete',
    delivery_notes: '',
    condition_notes: '',
    items: []
  });

  // Supporting data
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [deliveryNotes, statusFilter, supplierFilter, dateFilter, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch delivery notes, orders, and suppliers in parallel
      const [notesResponse, ordersResponse, suppliersResponse] = await Promise.allSettled([
        apiClient.get('/delivery-notes'),
        apiClient.get('/stock/orders'),
        apiClient.get('/stock/suppliers')
      ]);

      // Process delivery notes
      if (notesResponse.status === 'fulfilled') {
        const notes = notesResponse.value.data?.data || notesResponse.value.data || [];
        console.log('Fetched delivery notes:', notes);
        setDeliveryNotes(notes);
      } else {
        console.warn('Failed to fetch delivery notes:', notesResponse.reason);
        setDeliveryNotes([]);
      }

      // Process orders
      if (ordersResponse.status === 'fulfilled') {
        const orders = ordersResponse.value.data?.data || ordersResponse.value.data || [];
        setOrders(orders);
      } else {
        console.warn('Failed to fetch orders:', ordersResponse.reason);
        setOrders([]);
      }

      // Process suppliers
      if (suppliersResponse.status === 'fulfilled') {
        const suppliers = suppliersResponse.value.data?.data || suppliersResponse.value.data || [];
        setSuppliers(suppliers);
      } else {
        console.warn('Failed to fetch suppliers:', suppliersResponse.reason);
        setSuppliers([]);
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load delivery notes');
      setDeliveryNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId) => {
    if (!orderId) {
      setOrderItems([]);
      return;
    }

    try {
      const response = await apiClient.get(`/stock/orders/${orderId}`);
      if (response.data?.success) {
        const order = response.data.data;
        setOrderItems(order.items || []);
        
        // Pre-populate form with order data
        setFormData(prev => ({
          ...prev,
          supplier_id: order.supplier_id,
          items: (order.items || []).map(item => ({
            item_id: item.item_id,
            quantity_expected: item.quantity_ordered,
            quantity_received: item.quantity_ordered,
            quantity_damaged: 0,
            quantity_missing: 0,
            condition_status: 'good',
            condition_notes: ''
          }))
        }));
      }
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Failed to fetch order items');
    }
  };

  const applyFilters = () => {
    let filtered = [...deliveryNotes];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(note => note.delivery_status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(note => note.supplier_id === supplierFilter);
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter(note => 
        note.delivery_date?.startsWith(dateFilter)
      );
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.delivery_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.delivery_notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.condition_notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotes(filtered);
  };

  const handleAddDeliveryNote = async () => {
    try {
      // Generate delivery number if not provided
      const deliveryData = {
        ...formData,
        delivery_number: formData.delivery_number || `DN-${Date.now()}`,
        delivery_date: formData.delivery_date || new Date().toISOString().split('T')[0]
      };

      console.log('Sending delivery note data:', deliveryData);

      const response = await apiClient.post('/delivery-notes', deliveryData);
      
      if (response.data.success) {
        toast.success('Delivery note created successfully');
        setShowAddModal(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error creating delivery note:', error);
      toast.error('Failed to create delivery note');
    }
  };

  const handleUpdateDeliveryNote = async () => {
    try {
      const response = await apiClient.put(`/delivery-notes/${selectedNote.delivery_note_id}`, formData);
      
      if (response.data.success) {
        toast.success('Delivery note updated successfully');
        setShowEditModal(false);
        setSelectedNote(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Error updating delivery note:', error);
      toast.error('Failed to update delivery note');
    }
  };

  const resetForm = () => {
    setFormData({
      delivery_number: '',
      order_id: '',
      supplier_id: '',
      delivery_date: '',
      delivery_status: 'complete',
      delivery_notes: '',
      condition_notes: '',
      items: []
    });
    setOrderItems([]);
  };

  const handleOrderChange = (orderId) => {
    setFormData(prev => ({ ...prev, order_id: orderId }));
    fetchOrderItems(orderId);
  };

  const updateItemQuantity = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: parseInt(value) || 0 } : item
      )
    }));
  };

  const updateItemCondition = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'damaged': return <AlertTriangle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find(s => s.supplier_id === supplierId);
    return supplier?.supplier_name || supplier?.name || `Supplier ${supplierId}`;
  };

  const getOrderNumber = (orderId) => {
    const order = orders.find(o => o.order_id === orderId);
    return order?.order_number || `Order ${orderId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading delivery notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
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
                <Truck className="h-8 w-8 text-blue-600" />
                Delivery Notes Management
              </h1>
              <p className="text-gray-600 mt-1">
                Track deliveries, record conditions, and manage supplier deliveries
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Delivery Note
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
              <option value="complete">Complete</option>
              <option value="partial">Partial</option>
              <option value="damaged">Damaged</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.supplier_name || supplier.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by date"
            />

            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search delivery notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Notes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Delivery Notes ({filteredNotes.length})
            </h3>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No delivery notes found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Received
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredNotes.map((note) => (
                    <tr key={note.delivery_note_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {note.delivery_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getOrderNumber(note.order_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getSupplierName(note.supplier_id)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(note.delivery_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(note.delivery_status)}`}>
                          {getStatusIcon(note.delivery_status)}
                          <span className="ml-1 capitalize">{note.delivery_status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {note.total_items_received || 0} / {note.total_items_expected || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => navigate(`/stock/delivery-notes/${note.delivery_note_id}`)}
                            className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded text-xs flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                          <button
                            onClick={() => {
                              setSelectedNote(note);
                              setFormData({
                                delivery_number: note.delivery_number,
                                order_id: note.order_id,
                                supplier_id: note.supplier_id,
                                delivery_date: note.delivery_date,
                                delivery_status: note.delivery_status,
                                delivery_notes: note.delivery_notes,
                                condition_notes: note.condition_notes
                              });
                              setShowEditModal(true);
                            }}
                            className="px-3 py-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 rounded text-xs flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
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

      {/* Add Delivery Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Delivery Note</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Number</label>
                <input
                  type="text"
                  value={formData.delivery_number}
                  onChange={(e) => setFormData({...formData, delivery_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="DN-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={formData.order_id}
                  onChange={(e) => handleOrderChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order.order_id} value={order.order_id}>
                      {order.order_number}
                    </option>
                  ))}
                </select>
              </div>
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
                      {supplier.supplier_name || supplier.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                <input
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.delivery_status}
                  onChange={(e) => setFormData({...formData, delivery_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                  <option value="damaged">Damaged</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
              <textarea
                value={formData.delivery_notes}
                onChange={(e) => setFormData({...formData, delivery_notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Delivery notes and observations..."
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition Notes</label>
              <textarea
                value={formData.condition_notes}
                onChange={(e) => setFormData({...formData, condition_notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Items Section */}
            {formData.items.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Delivery Items</h4>
                <div className="space-y-4">
                  {formData.items.map((item, index) => {
                    const orderItem = orderItems.find(oi => oi.item_id === item.item_id);
                    return (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                            <p className="text-sm text-gray-900">{orderItem?.item?.name || 'Unknown Item'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expected</label>
                            <input
                              type="number"
                              value={item.quantity_expected}
                              readOnly
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Received</label>
                            <input
                              type="number"
                              value={item.quantity_received}
                              onChange={(e) => updateItemQuantity(index, 'quantity_received', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Damaged</label>
                            <input
                              type="number"
                              value={item.quantity_damaged}
                              onChange={(e) => updateItemQuantity(index, 'quantity_damaged', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Missing</label>
                            <input
                              type="number"
                              value={item.quantity_missing}
                              onChange={(e) => updateItemQuantity(index, 'quantity_missing', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                            <select
                              value={item.condition_status}
                              onChange={(e) => updateItemCondition(index, 'condition_status', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="good">Good</option>
                              <option value="damaged">Damaged</option>
                              <option value="defective">Defective</option>
                              <option value="expired">Expired</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Notes</label>
                            <input
                              type="text"
                              value={item.condition_notes}
                              onChange={(e) => updateItemCondition(index, 'condition_notes', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Item-specific notes..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDeliveryNote}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create Delivery Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Delivery Note Modal */}
      {showEditModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Delivery Note</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Number</label>
                <input
                  type="text"
                  value={formData.delivery_number}
                  onChange={(e) => setFormData({...formData, delivery_number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.delivery_status}
                  onChange={(e) => setFormData({...formData, delivery_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="complete">Complete</option>
                  <option value="partial">Partial</option>
                  <option value="damaged">Damaged</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
              <textarea
                value={formData.delivery_notes}
                onChange={(e) => setFormData({...formData, delivery_notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition Notes</label>
              <textarea
                value={formData.condition_notes}
                onChange={(e) => setFormData({...formData, condition_notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedNote(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateDeliveryNote}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Delivery Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Delivery Note Modal */}
      {showViewModal && selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Delivery Note Details</h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedNote(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Number</label>
                  <p className="text-sm text-gray-900">{selectedNote.delivery_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedNote.delivery_status)}`}>
                    {getStatusIcon(selectedNote.delivery_status)}
                    <span className="ml-1 capitalize">{selectedNote.delivery_status}</span>
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order</label>
                  <p className="text-sm text-gray-900">{getOrderNumber(selectedNote.order_id)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Supplier</label>
                  <p className="text-sm text-gray-900">{getSupplierName(selectedNote.supplier_id)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
                  <p className="text-sm text-gray-900">{new Date(selectedNote.delivery_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Items Received</label>
                  <p className="text-sm text-gray-900">{selectedNote.total_items_received || 0} / {selectedNote.total_items_expected || 0}</p>
                </div>
              </div>
              
              {selectedNote.delivery_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Delivery Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedNote.delivery_notes}</p>
                </div>
              )}
              
              {selectedNote.condition_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Condition Notes</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedNote.condition_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryNotes;
