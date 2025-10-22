import React, { useState, useEffect } from 'react';
import { FileText, Eye, Download, Mail, DollarSign, Search, Filter, X } from 'lucide-react';
import apiClient from '../../services/apiClient';
import '../../styles/Financial.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    homestay_id: '',
    from_date: '',
    to_date: '',
    search: ''
  });

  useEffect(() => {
    fetchHomestays();
    fetchInvoices();
  }, []);

  const fetchHomestays = async () => {
    try {
      const response = await apiClient.get('/homestays');
      const data = response.data;
      if (Array.isArray(data)) {
        setHomestays(data);
      } else if (data.data && Array.isArray(data.data)) {
        setHomestays(data.data);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.homestay_id) params.homestay_id = filters.homestay_id;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;
      if (filters.search) params.search = filters.search;

      const response = await apiClient.get('/invoices', { params });
      const data = response.data;
      setInvoices(data.data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchInvoices();
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      homestay_id: '',
      from_date: '',
      to_date: '',
      search: ''
    });
    setTimeout(() => fetchInvoices(), 100);
  };

  const viewInvoice = async (invoiceId) => {
    try {
      const response = await apiClient.get(`/invoices/${invoiceId}`);
      setSelectedInvoice(response.data.data);
      setShowInvoiceModal(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      alert('Failed to load invoice details');
    }
  };

  const downloadInvoice = async (invoice) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/invoices/${invoice.invoice_id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const sendInvoice = async (invoiceId) => {
    if (!window.confirm('Send this invoice via email to the guest?')) return;
    
    try {
      await apiClient.post(`/invoices/${invoiceId}/send-email`, {});
      alert('Invoice sent successfully!');
      fetchInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
      alert('Failed to send invoice: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { class: 'badge-secondary', label: 'Draft' },
      sent: { class: 'badge-info', label: 'Sent' },
      paid: { class: 'badge-success', label: 'Paid' },
      partially_paid: { class: 'badge-warning', label: 'Partially Paid' },
      overdue: { class: 'badge-danger', label: 'Overdue' },
      cancelled: { class: 'badge-dark', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="invoices-container">
      <div className="page-header">
        <div>
          <h1>Invoices</h1>
          <p className="text-muted">Manage and track all invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label>Search</label>
            <div className="input-with-icon">
              <Search size={18} />
              <input
                type="text"
                placeholder="Invoice #, Booking #, Guest name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="form-group">
            <label>Homestay</label>
            <select
              value={filters.homestay_id}
              onChange={(e) => handleFilterChange('homestay_id', e.target.value)}
            >
              <option value="">All Homestays</option>
              {homestays.map(h => (
                <option key={h.homestay_id} value={h.homestay_id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.from_date}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.to_date}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
            />
          </div>

          <div className="form-group filter-actions">
            <button className="btn btn-primary" onClick={applyFilters}>
              <Filter size={18} />
              Apply Filters
            </button>
            <button className="btn btn-secondary" onClick={clearFilters}>
              <X size={18} />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No Invoices Found</h3>
            <p>No invoices match your current filters</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Booking #</th>
                  <th>Guest</th>
                  <th>Homestay</th>
                  <th>Invoice Date</th>
                  <th>Total Amount</th>
                  <th>Amount Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(invoice => (
                  <tr key={invoice.invoice_id}>
                    <td className="font-semibold">{invoice.invoice_number}</td>
                    <td>{invoice.booking_reference}</td>
                    <td>{invoice.first_name} {invoice.last_name}</td>
                    <td>{invoice.homestay_name}</td>
                    <td>{formatDate(invoice.invoice_date)}</td>
                    <td className="font-semibold">{formatCurrency(invoice.total_amount)}</td>
                    <td className="text-success">{formatCurrency(invoice.amount_paid)}</td>
                    <td className={invoice.balance_due > 0 ? 'text-danger font-semibold' : ''}>
                      {formatCurrency(invoice.balance_due)}
                    </td>
                    <td>{getStatusBadge(invoice.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => viewInvoice(invoice.invoice_id)}
                          title="View Invoice"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => downloadInvoice(invoice)}
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                        {invoice.status === 'draft' && (
                          <button
                            className="btn-icon"
                            onClick={() => sendInvoice(invoice.invoice_id)}
                            title="Send Invoice"
                          >
                            <Mail size={18} />
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

      {/* Invoice Detail Modal */}
      {showInvoiceModal && selectedInvoice && (
        <InvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedInvoice(null);
          }}
          onRefresh={fetchInvoices}
        />
      )}
    </div>
  );
};

// Invoice Detail Modal Component
const InvoiceModal = ({ invoice, onClose, onRefresh }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [emailRecipient, setEmailRecipient] = useState(invoice.email || '');
  const [emailMessage, setEmailMessage] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    if (parseFloat(paymentAmount) > parseFloat(invoice.balance_due)) {
      alert('Payment amount cannot exceed balance due');
      return;
    }

    try {
      await apiClient.post(`/invoices/${invoice.invoice_id}/payment`, {
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        payment_reference: paymentReference
      });

      alert('Payment recorded successfully!');
      setShowPaymentForm(false);
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      alert('Failed to record payment');
    }
  };

  const printInvoice = () => {
    window.open(`http://localhost:3001/api/invoices/${invoice.invoice_id}/pdf`, '_blank');
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    if (!emailRecipient) {
      alert('Please enter a recipient email');
      return;
    }

    try {
      await apiClient.post(`/invoices/${invoice.invoice_id}/send-email`, {
        recipient_email: emailRecipient,
        message: emailMessage
      });

      alert('Invoice sent successfully via email!');
      setShowEmailForm(false);
      onRefresh();
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content invoice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Invoice Details</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="invoice-content">
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="invoice-company">
              <h3>{invoice.homestay_name}</h3>
              <p>{invoice.homestay_address}</p>
              <p>Phone: {invoice.homestay_phone}</p>
              <p>Email: {invoice.homestay_email}</p>
            </div>
            <div className="invoice-meta">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> {invoice.invoice_number}</p>
              <p><strong>Date:</strong> {formatDate(invoice.invoice_date)}</p>
              <p><strong>Due Date:</strong> {formatDate(invoice.due_date)}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="invoice-bill-to">
            <h4>Bill To:</h4>
            <p><strong>{invoice.first_name} {invoice.last_name}</strong></p>
            <p>{invoice.email}</p>
            <p>{invoice.phone}</p>
            {invoice.address && <p>{invoice.address}</p>}
          </div>

          {/* Booking Info */}
          <div className="invoice-booking-info">
            <p><strong>Booking Reference:</strong> {invoice.booking_reference}</p>
            <p><strong>Check-in:</strong> {formatDate(invoice.check_in_date)}</p>
            <p><strong>Check-out:</strong> {formatDate(invoice.check_out_date)}</p>
            {invoice.room_number && <p><strong>Room:</strong> {invoice.room_number} ({invoice.room_type})</p>}
          </div>

          {/* Invoice Items */}
          <div className="invoice-items">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items && invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{formatCurrency(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Invoice Totals */}
          <div className="invoice-totals">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {parseFloat(invoice.tax_amount) > 0 && (
              <div className="total-row">
                <span>Tax (18%):</span>
                <span>{formatCurrency(invoice.tax_amount)}</span>
              </div>
            )}
            {parseFloat(invoice.service_charge) > 0 && (
              <div className="total-row">
                <span>Service Charge:</span>
                <span>{formatCurrency(invoice.service_charge)}</span>
              </div>
            )}
            {parseFloat(invoice.discount_amount) > 0 && (
              <div className="total-row text-success">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span>Total Amount:</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
            {parseFloat(invoice.amount_paid) > 0 && (
              <div className="total-row text-success">
                <span>Amount Paid:</span>
                <span>{formatCurrency(invoice.amount_paid)}</span>
              </div>
            )}
            {parseFloat(invoice.balance_due) > 0 && (
              <div className="total-row balance-due">
                <span>Balance Due:</span>
                <span>{formatCurrency(invoice.balance_due)}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="invoice-notes">
              <h4>Notes:</h4>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Payment Terms */}
          {invoice.payment_terms && (
            <div className="invoice-payment-terms">
              <p><strong>Payment Terms:</strong> {invoice.payment_terms}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={printInvoice}>
            <Download size={18} />
            Download PDF
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowEmailForm(!showEmailForm)}
          >
            <Mail size={18} />
            Send via Email
          </button>
          {parseFloat(invoice.balance_due) > 0 && invoice.status !== 'cancelled' && (
            <button 
              className="btn btn-success" 
              onClick={() => setShowPaymentForm(!showPaymentForm)}
            >
              <DollarSign size={18} />
              Record Payment
            </button>
          )}
        </div>

        {/* Payment Form */}
        {showPaymentForm && (
          <div className="payment-form-section">
            <h4>Record Payment</h4>
            <form onSubmit={handleRecordPayment}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Amount <span className="required">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    max={invoice.balance_due}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder={`Max: ${formatCurrency(invoice.balance_due)}`}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Reference Number</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Transaction/Reference #"
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Email Form */}
        {showEmailForm && (
          <div className="payment-form-section">
            <h4>Send Invoice via Email</h4>
            <form onSubmit={handleSendEmail}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Recipient Email <span className="required">*</span></label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="guest@email.com"
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Custom Message (Optional)</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Add a custom message to include in the email..."
                    rows="3"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEmailForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Mail size={18} />
                  Send Email
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;