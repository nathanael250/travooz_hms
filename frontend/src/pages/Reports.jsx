import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  Users, 
  Home, 
  UtensilsCrossed,
  Receipt,
  Sparkles,
  TrendingUp,
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import apiClient from '../services/apiClient';
import '../styles/Reports.css';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('revenue');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    homestay_id: '',
    status: '',
    order_type: '',
    guest_email: ''
  });
  const [homestays, setHomestays] = useState([]);

  const reportTypes = [
    { id: 'revenue', name: 'Revenue Report', icon: DollarSign, color: '#10b981' },
    { id: 'room-occupancy', name: 'Room Occupancy', icon: Home, color: '#3b82f6' },
    { id: 'front-desk', name: 'Front Desk', icon: Users, color: '#8b5cf6' },
    { id: 'restaurant', name: 'Restaurant', icon: UtensilsCrossed, color: '#f59e0b' },
    { id: 'invoices', name: 'Invoices & Payments', icon: Receipt, color: '#ef4444' },
    { id: 'housekeeping', name: 'Housekeeping', icon: Sparkles, color: '#06b6d4' },
    { id: 'guest-activity', name: 'Guest Activity', icon: TrendingUp, color: '#ec4899' },
    { id: 'booking-source', name: 'Booking Sources', icon: Calendar, color: '#6366f1' }
  ];

  useEffect(() => {
    fetchHomestays();
  }, []);

  useEffect(() => {
    if (activeReport) {
      fetchReportData();
    }
  }, [activeReport, filters]);

  const fetchHomestays = async () => {
    try {
      const response = await apiClient.get('/homestays');
      setHomestays(response.data.data || []);
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await apiClient.get(`/reports/${activeReport}?${params.toString()}`);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportReport = (format) => {
    alert(`Export to ${format.toUpperCase()} - Coming soon!`);
  };

  return (
    <div className="reports-container">
      <div className="page-header">
        <div>
          <h1>Reports & Analytics</h1>
          <p className="text-muted">Comprehensive business intelligence and insights</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => exportReport('pdf')}>
            <Download size={18} />
            Export PDF
          </button>
          <button className="btn-secondary" onClick={() => exportReport('excel')}>
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="report-types-grid">
        {reportTypes.map(report => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className={`report-type-card ${activeReport === report.id ? 'active' : ''}`}
              onClick={() => setActiveReport(report.id)}
              style={{ '--card-color': report.color }}
            >
              <Icon size={24} />
              <span>{report.name}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-header">
          <Filter size={20} />
          <h3>Filters</h3>
        </div>
        <div className="filters-grid">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Homestay</label>
            <select
              value={filters.homestay_id}
              onChange={(e) => handleFilterChange('homestay_id', e.target.value)}
            >
              <option value="">All Homestays</option>
              {homestays.map(h => (
                <option key={h.homestay_id} value={h.homestay_id}>{h.name}</option>
              ))}
            </select>
          </div>
          {activeReport === 'restaurant' && (
            <div className="form-group">
              <label>Order Type</label>
              <select
                value={filters.order_type}
                onChange={(e) => handleFilterChange('order_type', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="dine_in">Dine In</option>
                <option value="room_service">Room Service</option>
                <option value="takeaway">Takeaway</option>
              </select>
            </div>
          )}
          {activeReport === 'guest-activity' && (
            <div className="form-group">
              <label>Guest Email</label>
              <input
                type="email"
                placeholder="Search by email..."
                value={filters.guest_email}
                onChange={(e) => handleFilterChange('guest_email', e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Report Content */}
      <div className="report-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading report data...</p>
          </div>
        ) : reportData ? (
          <>
            {activeReport === 'revenue' && <RevenueReport data={reportData} formatCurrency={formatCurrency} />}
            {activeReport === 'room-occupancy' && <RoomOccupancyReport data={reportData} formatDate={formatDate} />}
            {activeReport === 'front-desk' && <FrontDeskReport data={reportData} formatDate={formatDate} />}
            {activeReport === 'restaurant' && <RestaurantReport data={reportData} formatCurrency={formatCurrency} />}
            {activeReport === 'invoices' && <InvoicesReport data={reportData} formatCurrency={formatCurrency} formatDate={formatDate} />}
            {activeReport === 'housekeeping' && <HousekeepingReport data={reportData} formatDate={formatDate} />}
            {activeReport === 'guest-activity' && <GuestActivityReport data={reportData} formatCurrency={formatCurrency} formatDate={formatDate} />}
            {activeReport === 'booking-source' && <BookingSourceReport data={reportData} formatCurrency={formatCurrency} />}
          </>
        ) : (
          <div className="empty-state">
            <FileText size={48} />
            <p>No data available for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// REVENUE REPORT COMPONENT
// ==========================================
const RevenueReport = ({ data, formatCurrency }) => (
  <div className="report-section">
    <h2>Revenue Summary</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Total Revenue</h4>
        <p className="stat-value">{formatCurrency(data.summary.total_revenue)}</p>
      </div>
      <div className="stat-card">
        <h4>Room Revenue</h4>
        <p className="stat-value">{formatCurrency(data.summary.room_revenue.room_total)}</p>
      </div>
      <div className="stat-card">
        <h4>Restaurant Revenue</h4>
        <p className="stat-value">{formatCurrency(data.summary.restaurant_revenue.restaurant_revenue)}</p>
      </div>
      <div className="stat-card">
        <h4>Service Revenue</h4>
        <p className="stat-value">{formatCurrency(data.summary.service_revenue_total)}</p>
      </div>
      <div className="stat-card">
        <h4>Total Tax Collected</h4>
        <p className="stat-value">{formatCurrency(data.summary.total_tax)}</p>
      </div>
      <div className="stat-card">
        <h4>Total Bookings</h4>
        <p className="stat-value">{data.summary.room_revenue.total_bookings}</p>
      </div>
    </div>

    {data.service_breakdown && data.service_breakdown.length > 0 && (
      <>
        <h3>Service Revenue Breakdown</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Service Type</th>
              <th>Count</th>
              <th>Revenue</th>
              <th>Tax</th>
            </tr>
          </thead>
          <tbody>
            {data.service_breakdown.map((service, idx) => (
              <tr key={idx}>
                <td>{service.charge_type?.replace('_', ' ').toUpperCase()}</td>
                <td>{service.charge_count}</td>
                <td>{formatCurrency(service.service_revenue)}</td>
                <td>{formatCurrency(service.service_tax)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}

    {data.payment_methods && data.payment_methods.length > 0 && (
      <>
        <h3>Payment Methods</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Payment Method</th>
              <th>Transactions</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.payment_methods.map((method, idx) => (
              <tr key={idx}>
                <td>{method.payment_method || 'Not Specified'}</td>
                <td>{method.transaction_count}</td>
                <td>{formatCurrency(method.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </div>
);

// ==========================================
// ROOM OCCUPANCY REPORT COMPONENT
// ==========================================
const RoomOccupancyReport = ({ data, formatDate }) => (
  <div className="report-section">
    <h2>Room Occupancy Report - {formatDate(data.report_date)}</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Total Rooms</h4>
        <p className="stat-value">{data.summary.total_rooms}</p>
      </div>
      <div className="stat-card">
        <h4>Occupied</h4>
        <p className="stat-value">{data.summary.occupied}</p>
      </div>
      <div className="stat-card">
        <h4>Available</h4>
        <p className="stat-value">{data.summary.available}</p>
      </div>
      <div className="stat-card">
        <h4>Needs Cleaning</h4>
        <p className="stat-value">{data.summary.needs_cleaning}</p>
      </div>
      <div className="stat-card">
        <h4>Maintenance</h4>
        <p className="stat-value">{data.summary.maintenance}</p>
      </div>
      <div className="stat-card">
        <h4>Occupancy Rate</h4>
        <p className="stat-value">{data.summary.occupancy_rate}%</p>
      </div>
    </div>

    <h3>Room Details</h3>
    <table className="data-table">
      <thead>
        <tr>
          <th>Room</th>
          <th>Type</th>
          <th>Homestay</th>
          <th>Status</th>
          <th>Guest</th>
          <th>Check-In</th>
          <th>Check-Out</th>
        </tr>
      </thead>
      <tbody>
        {data.rooms.map((room, idx) => (
          <tr key={idx}>
            <td>{room.room_number}</td>
            <td>{room.room_type}</td>
            <td>{room.homestay_name}</td>
            <td>
              <span className={`badge badge-${room.status}`}>
                {room.status_label}
              </span>
            </td>
            <td>{room.guest_name || '-'}</td>
            <td>{formatDate(room.check_in_date)}</td>
            <td>{formatDate(room.check_out_date)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ==========================================
// FRONT DESK REPORT COMPONENT
// ==========================================
const FrontDeskReport = ({ data, formatDate }) => (
  <div className="report-section">
    <h2>Front Desk Activity</h2>
    
    {data.summary && data.summary.length > 0 && (
      <>
        <h3>Daily Summary</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Check-Ins</th>
              <th>Check-Outs</th>
              <th>Walk-Ins</th>
              <th>No-Shows</th>
              <th>Available Rooms</th>
              <th>Occupied Rooms</th>
            </tr>
          </thead>
          <tbody>
            {data.summary.map((day, idx) => (
              <tr key={idx}>
                <td>{formatDate(day.report_date)}</td>
                <td>{day.total_checkins_today}</td>
                <td>{day.total_checkouts_today}</td>
                <td>{day.walk_in_bookings}</td>
                <td>{day.no_shows}</td>
                <td>{day.available_rooms}</td>
                <td>{day.occupied_rooms}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}

    {data.details && data.details.length > 0 && (
      <>
        <h3>Booking Details</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking Ref</th>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-In</th>
              <th>Check-Out</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((booking, idx) => (
              <tr key={idx}>
                <td>{booking.booking_reference}</td>
                <td>{booking.guest_name}</td>
                <td>{booking.room_number} - {booking.room_type}</td>
                <td>{formatDate(booking.check_in_date)}</td>
                <td>{formatDate(booking.check_out_date)}</td>
                <td>{booking.booking_source}</td>
                <td>
                  <span className={`badge badge-${booking.status}`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </div>
);

// ==========================================
// RESTAURANT REPORT COMPONENT
// ==========================================
const RestaurantReport = ({ data, formatCurrency }) => (
  <div className="report-section">
    <h2>Restaurant Performance</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Total Orders</h4>
        <p className="stat-value">{data.summary.total_orders}</p>
      </div>
      <div className="stat-card">
        <h4>Total Revenue</h4>
        <p className="stat-value">{formatCurrency(data.summary.total_revenue)}</p>
      </div>
      <div className="stat-card">
        <h4>Avg Order Value</h4>
        <p className="stat-value">{formatCurrency(data.summary.average_order_value)}</p>
      </div>
      <div className="stat-card">
        <h4>Dine-In Orders</h4>
        <p className="stat-value">{data.summary.dine_in_orders}</p>
      </div>
      <div className="stat-card">
        <h4>Room Service</h4>
        <p className="stat-value">{data.summary.room_service_orders}</p>
      </div>
      <div className="stat-card">
        <h4>Takeaway</h4>
        <p className="stat-value">{data.summary.takeaway_orders}</p>
      </div>
    </div>

    <h3>Top 10 Items</h3>
    <table className="data-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Category</th>
          <th>Orders</th>
          <th>Quantity Sold</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>
        {data.top_items.map((item, idx) => (
          <tr key={idx}>
            <td>{item.item_name}</td>
            <td>{item.category}</td>
            <td>{item.order_count}</td>
            <td>{item.total_quantity}</td>
            <td>{formatCurrency(item.total_revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ==========================================
// INVOICES REPORT COMPONENT
// ==========================================
const InvoicesReport = ({ data, formatCurrency, formatDate }) => (
  <div className="report-section">
    <h2>Invoices & Payments</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Total Invoices</h4>
        <p className="stat-value">{data.summary.total_invoices}</p>
      </div>
      <div className="stat-card">
        <h4>Total Billed</h4>
        <p className="stat-value">{formatCurrency(data.summary.total_billed)}</p>
      </div>
      <div className="stat-card">
        <h4>Total Paid</h4>
        <p className="stat-value">{formatCurrency(data.summary.total_paid)}</p>
      </div>
      <div className="stat-card">
        <h4>Outstanding</h4>
        <p className="stat-value">{formatCurrency(data.summary.total_outstanding)}</p>
      </div>
      <div className="stat-card">
        <h4>Paid Invoices</h4>
        <p className="stat-value">{data.summary.paid_invoices}</p>
      </div>
      <div className="stat-card">
        <h4>Overdue</h4>
        <p className="stat-value">{data.summary.overdue_invoices}</p>
      </div>
    </div>

    <h3>Recent Invoices</h3>
    <table className="data-table">
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Date</th>
          <th>Guest</th>
          <th>Total</th>
          <th>Paid</th>
          <th>Balance</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.invoices.slice(0, 20).map((invoice, idx) => (
          <tr key={idx}>
            <td>{invoice.invoice_number}</td>
            <td>{formatDate(invoice.invoice_date)}</td>
            <td>{invoice.guest_name}</td>
            <td>{formatCurrency(invoice.total_amount)}</td>
            <td>{formatCurrency(invoice.amount_paid)}</td>
            <td>{formatCurrency(invoice.balance_due)}</td>
            <td>
              <span className={`badge badge-${invoice.status}`}>
                {invoice.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ==========================================
// HOUSEKEEPING REPORT COMPONENT
// ==========================================
const HousekeepingReport = ({ data, formatDate }) => (
  <div className="report-section">
    <h2>Housekeeping Performance</h2>
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Total Tasks</h4>
        <p className="stat-value">{data.summary.total_tasks}</p>
      </div>
      <div className="stat-card">
        <h4>Completed</h4>
        <p className="stat-value">{data.summary.completed_tasks}</p>
      </div>
      <div className="stat-card">
        <h4>In Progress</h4>
        <p className="stat-value">{data.summary.in_progress_tasks}</p>
      </div>
      <div className="stat-card">
        <h4>Pending</h4>
        <p className="stat-value">{data.summary.pending_tasks}</p>
      </div>
      <div className="stat-card">
        <h4>Active Staff</h4>
        <p className="stat-value">{data.summary.active_staff}</p>
      </div>
    </div>

    {data.staff_performance && data.staff_performance.length > 0 && (
      <>
        <h3>Staff Performance</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Total Tasks</th>
              <th>Completed</th>
              <th>Avg Time (min)</th>
            </tr>
          </thead>
          <tbody>
            {data.staff_performance.map((staff, idx) => (
              <tr key={idx}>
                <td>{staff.staff_name}</td>
                <td>{staff.total_tasks}</td>
                <td>{staff.completed_tasks}</td>
                <td>{Math.round(staff.avg_completion_time_minutes || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    )}
  </div>
);

// ==========================================
// GUEST ACTIVITY REPORT COMPONENT
// ==========================================
const GuestActivityReport = ({ data, formatCurrency, formatDate }) => (
  <div className="report-section">
    <h2>Guest Activity</h2>
    
    <h3>Top Guests</h3>
    <table className="data-table">
      <thead>
        <tr>
          <th>Guest Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Total Stays</th>
          <th>First Stay</th>
          <th>Last Stay</th>
          <th>Total Spent</th>
        </tr>
      </thead>
      <tbody>
        {data.guests.map((guest, idx) => (
          <tr key={idx}>
            <td>{guest.guest_name}</td>
            <td>{guest.guest_email}</td>
            <td>{guest.guest_phone}</td>
            <td>{guest.total_stays}</td>
            <td>{formatDate(guest.first_stay)}</td>
            <td>{formatDate(guest.last_stay)}</td>
            <td>{formatCurrency(guest.total_spent)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ==========================================
// BOOKING SOURCE REPORT COMPONENT
// ==========================================
const BookingSourceReport = ({ data, formatCurrency }) => (
  <div className="report-section">
    <h2>Booking Sources Analysis</h2>
    
    <h3>Source Breakdown</h3>
    <table className="data-table">
      <thead>
        <tr>
          <th>Source</th>
          <th>Total Bookings</th>
          <th>Confirmed</th>
          <th>Cancelled</th>
          <th>No-Shows</th>
          <th>Revenue</th>
          <th>Cancellation Rate</th>
        </tr>
      </thead>
      <tbody>
        {data.source_breakdown.map((source, idx) => (
          <tr key={idx}>
            <td>{source.booking_source || 'Direct'}</td>
            <td>{source.total_bookings}</td>
            <td>{source.confirmed_bookings}</td>
            <td>{source.cancelled_bookings}</td>
            <td>{source.no_shows}</td>
            <td>{formatCurrency(source.total_revenue)}</td>
            <td>{source.cancellation_rate}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Reports;