import React, { useState, useEffect } from 'react';
import { UserCheck, LogIn, LogOut, FileText, DollarSign, Search, Calendar } from 'lucide-react';
import apiClient from '../services/apiClient';
import '../styles/FrontDesk.css';

export const FrontDesk = () => {
  const [activeTab, setActiveTab] = useState('checkout');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'checkout') {
      fetchCheckoutBookings();
    } else if (activeTab === 'checkin') {
      fetchCheckinBookings();
    }
  }, [activeTab]);

  const fetchCheckoutBookings = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get('/bookings', {
        params: {
          booking_status: 'confirmed',
          check_out_date: today
        }
      });
      const data = response.data;
      setBookings(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching checkout bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCheckinBookings = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get('/bookings', {
        params: {
          booking_status: 'confirmed',
          check_in_date: today
        }
      });
      const data = response.data;
      setBookings(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching checkin bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = (booking) => {
    setSelectedBooking(booking);
    setShowCheckoutModal(true);
  };

  const generateInvoice = async (bookingId) => {
    try {
      const response = await apiClient.post(`/invoices/generate/${bookingId}`, {
        tax_rate: 18,
        payment_terms: 'Due on receipt'
      });

      if (response.data.success) {
        alert('Invoice generated successfully!');
        // Open invoice in new tab
        window.open(`/financial/invoices`, '_blank');
        return response.data.data.invoice_id;
      }
    } catch (error) {
      if (error.response?.data?.invoice_id) {
        // Invoice already exists
        alert('Invoice already exists for this booking');
        window.open(`/financial/invoices`, '_blank');
        return error.response.data.invoice_id;
      }
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice: ' + (error.response?.data?.message || error.message));
      return null;
    }
  };

  const completeCheckout = async () => {
    if (!selectedBooking) return;

    try {
      // Update booking status to checked_out
      await apiClient.patch(`/bookings/${selectedBooking.booking_id}`, {
        booking_status: 'checked_out'
      });

      // Update room status to vacant_dirty
      if (selectedBooking.room_id) {
        await apiClient.patch(`/rooms/${selectedBooking.room_id}/status`, {
          status: 'vacant_dirty'
        });
      }

      alert('Checkout completed successfully!');
      setShowCheckoutModal(false);
      setSelectedBooking(null);
      fetchCheckoutBookings();
    } catch (error) {
      console.error('Error completing checkout:', error);
      alert('Failed to complete checkout: ' + (error.response?.data?.message || error.message));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="frontdesk-container">
      <div className="page-header">
        <div>
          <h1>
            <UserCheck className="inline mr-2 mb-1" size={32} />
            Front Desk
          </h1>
          <p className="text-muted">Manage check-ins, check-outs, and guest services</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab ${activeTab === 'checkout' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkout')}
        >
          <LogOut size={18} />
          Check-Out Today
        </button>
        <button
          className={`tab ${activeTab === 'checkin' ? 'active' : ''}`}
          onClick={() => setActiveTab('checkin')}
        >
          <LogIn size={18} />
          Check-In Today
        </button>
      </div>

      {/* Bookings Table */}
      <div className="table-card">
        {loading ? (
          <div className="loading-state">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No Bookings Found</h3>
            <p>No {activeTab === 'checkout' ? 'check-outs' : 'check-ins'} scheduled for today</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Guest Name</th>
                  <th>Homestay</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.booking_id}>
                    <td className="font-semibold">{booking.booking_reference}</td>
                    <td>{booking.guest_name || `${booking.first_name} ${booking.last_name}`}</td>
                    <td>{booking.homestay_name}</td>
                    <td>{booking.room_number || '-'}</td>
                    <td>{formatDate(booking.check_in_date)}</td>
                    <td>{formatDate(booking.check_out_date)}</td>
                    <td className="font-semibold">{formatCurrency(booking.total_amount)}</td>
                    <td>
                      <span className="badge badge-primary">
                        {booking.booking_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {activeTab === 'checkout' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleCheckout(booking)}
                          >
                            <LogOut size={16} />
                            Check Out
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

      {/* Checkout Modal */}
      {showCheckoutModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowCheckoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Check-Out: {selectedBooking.booking_reference}</h2>
              <button className="close-btn" onClick={() => setShowCheckoutModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="checkout-info">
                <h3>Guest Information</h3>
                <p><strong>Name:</strong> {selectedBooking.guest_name || `${selectedBooking.first_name} ${selectedBooking.last_name}`}</p>
                <p><strong>Email:</strong> {selectedBooking.email}</p>
                <p><strong>Phone:</strong> {selectedBooking.phone}</p>
              </div>

              <div className="checkout-info">
                <h3>Booking Details</h3>
                <p><strong>Homestay:</strong> {selectedBooking.homestay_name}</p>
                <p><strong>Room:</strong> {selectedBooking.room_number || '-'}</p>
                <p><strong>Check-In:</strong> {formatDate(selectedBooking.check_in_date)}</p>
                <p><strong>Check-Out:</strong> {formatDate(selectedBooking.check_out_date)}</p>
                <p><strong>Total Amount:</strong> {formatCurrency(selectedBooking.total_amount)}</p>
              </div>

              <div className="checkout-actions">
                <h3>Checkout Actions</h3>
                <div className="action-grid">
                  <button
                    className="btn btn-primary"
                    onClick={() => generateInvoice(selectedBooking.booking_id)}
                  >
                    <FileText size={18} />
                    Generate Invoice
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={completeCheckout}
                  >
                    <LogOut size={18} />
                    Complete Check-Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};