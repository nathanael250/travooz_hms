import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  User,
  Star,
  CheckCircle,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Eye,
  MessageSquare
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const GuestReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [viewingReview, setViewingReview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterHomestay, setFilterHomestay] = useState('');
  const [statistics, setStatistics] = useState(null);

  const [formData, setFormData] = useState({
    booking_id: '',
    guest_id: '',
    homestay_id: '',
    room_id: '',
    overall_rating: 5,
    cleanliness_rating: 5,
    service_rating: 5,
    location_rating: 5,
    value_rating: 5,
    amenities_rating: 5,
    comment: '',
    status: 'pending',
    verified_stay: false,
    vendor_response: ''
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'flagged', label: 'Flagged' }
  ];

  useEffect(() => {
    fetchReviews();
    fetchGuests();
    fetchBookings();
    fetchHomestays();
    fetchStatistics();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-profiles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchHomestays = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/homestays`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHomestays(data);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-reviews/summary/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingReview
        ? `${API_URL}/guest-reviews/${editingReview.review_id}`
        : `${API_URL}/guest-reviews`;
      
      const method = editingReview ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchReviews();
        fetchStatistics();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchReviews();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const handleMarkHelpful = async (reviewId, isHelpful) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/guest-reviews/${reviewId}/helpful`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_helpful: isHelpful })
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error('Error marking review helpful:', error);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      booking_id: review.booking_id || '',
      guest_id: review.guest_id || '',
      homestay_id: review.homestay_id || '',
      room_id: review.room_id || '',
      overall_rating: review.overall_rating || 5,
      cleanliness_rating: review.cleanliness_rating || 5,
      service_rating: review.service_rating || 5,
      location_rating: review.location_rating || 5,
      value_rating: review.value_rating || 5,
      amenities_rating: review.amenities_rating || 5,
      comment: review.comment || '',
      status: review.status || 'pending',
      verified_stay: review.verified_stay || false,
      vendor_response: review.vendor_response || ''
    });
    setShowModal(true);
  };

  const handleView = (review) => {
    setViewingReview(review);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReview(null);
    setFormData({
      booking_id: '',
      guest_id: '',
      homestay_id: '',
      room_id: '',
      overall_rating: 5,
      cleanliness_rating: 5,
      service_rating: 5,
      location_rating: 5,
      value_rating: 5,
      amenities_rating: 5,
      comment: '',
      status: 'pending',
      verified_stay: false,
      vendor_response: ''
    });
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setViewingReview(null);
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.guest?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.homestay?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || review.status === filterStatus;
    const matchesRating = !filterRating || review.overall_rating >= parseInt(filterRating);
    const matchesHomestay = !filterHomestay || review.homestay_id === parseInt(filterHomestay);
    
    return matchesSearch && matchesStatus && matchesRating && matchesHomestay;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Guest Reviews</h1>
        <p className="text-gray-600">View and manage guest feedback and ratings</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold">{statistics.total || 0}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {statistics.average_rating ? parseFloat(statistics.average_rating).toFixed(1) : '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.pending || 0}</p>
              </div>
              <Filter className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statistics.approved || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified Stays</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.verified || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
          <select
            value={filterHomestay}
            onChange={(e) => setFilterHomestay(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Homestays</option>
            {Array.isArray(homestays) && homestays.map(homestay => (
              <option key={homestay.homestay_id} value={homestay.homestay_id}>
                {homestay.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Review
          </button>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Homestay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Helpful
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No reviews found
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.guest?.full_name || 'N/A'}
                          </div>
                          {review.verified_stay && (
                            <span className="text-xs text-green-600">✓ Verified Stay</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {review.homestay?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(review.overall_rating)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(review.status)}`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleMarkHelpful(review.review_id, true)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs">{review.helpful_count || 0}</span>
                        </button>
                        <button
                          onClick={() => handleMarkHelpful(review.review_id, false)}
                          className="text-red-600 hover:text-red-900 flex items-center gap-1"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-xs">{review.not_helpful_count || 0}</span>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleView(review)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEdit(review)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.review_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingReview ? 'Edit Review' : 'Add New Review'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest *
                  </label>
                  <select
                    value={formData.guest_id}
                    onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Guest</option>
                    {Array.isArray(guests) && guests.map(guest => (
                      <option key={guest.guest_id} value={guest.guest_id}>
                        {guest.full_name} - {guest.phone}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking
                  </label>
                  <select
                    value={formData.booking_id}
                    onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Booking</option>
                    {Array.isArray(bookings) && bookings.map(booking => (
                      <option key={booking.booking_id} value={booking.booking_id}>
                        Booking #{booking.booking_id} - {booking.homestay?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homestay *
                  </label>
                  <select
                    value={formData.homestay_id}
                    onChange={(e) => setFormData({ ...formData, homestay_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Homestay</option>
                    {Array.isArray(homestays) && homestays.map(homestay => (
                      <option key={homestay.homestay_id} value={homestay.homestay_id}>
                        {homestay.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overall Rating *
                  </label>
                  <select
                    value={formData.overall_rating}
                    onChange={(e) => setFormData({ ...formData, overall_rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>{rating} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cleanliness Rating
                  </label>
                  <select
                    value={formData.cleanliness_rating}
                    onChange={(e) => setFormData({ ...formData, cleanliness_rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>{rating} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Rating
                  </label>
                  <select
                    value={formData.service_rating}
                    onChange={(e) => setFormData({ ...formData, service_rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>{rating} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Rating
                  </label>
                  <select
                    value={formData.location_rating}
                    onChange={(e) => setFormData({ ...formData, location_rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>{rating} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value Rating
                  </label>
                  <select
                    value={formData.value_rating}
                    onChange={(e) => setFormData({ ...formData, value_rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>{rating} Stars</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amenities Rating
                  </label>
                  <select
                    value={formData.amenities_rating}
                    onChange={(e) => setFormData({ ...formData, amenities_rating: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {[5, 4, 3, 2, 1].map(rating => (
                      <option key={rating} value={rating}>{rating} Stars</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.verified_stay}
                      onChange={(e) => setFormData({ ...formData, verified_stay: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Verified Stay</span>
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comment *
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Response
                  </label>
                  <textarea
                    value={formData.vendor_response}
                    onChange={(e) => setFormData({ ...formData, vendor_response: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Optional response from management"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingReview ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && viewingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Review Details</h2>
              <button onClick={handleCloseDetailsModal} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Guest</p>
                  <p className="font-medium">{viewingReview.guest?.full_name || 'N/A'}</p>
                  {viewingReview.verified_stay && (
                    <span className="text-xs text-green-600">✓ Verified Stay</span>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Homestay</p>
                  <p className="font-medium">{viewingReview.homestay?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Booking</p>
                  <p className="font-medium">
                    {viewingReview.booking ? `#${viewingReview.booking_id}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(viewingReview.status)}`}>
                    {viewingReview.status}
                  </span>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Ratings</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Overall</p>
                    {renderStars(viewingReview.overall_rating)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cleanliness</p>
                    {renderStars(viewingReview.cleanliness_rating)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Service</p>
                    {renderStars(viewingReview.service_rating)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    {renderStars(viewingReview.location_rating)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Value</p>
                    {renderStars(viewingReview.value_rating)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Amenities</p>
                    {renderStars(viewingReview.amenities_rating)}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Comment</p>
                <p className="font-medium bg-gray-50 p-3 rounded">{viewingReview.comment}</p>
              </div>
              {viewingReview.vendor_response && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Vendor Response</p>
                  <p className="font-medium bg-blue-50 p-3 rounded">{viewingReview.vendor_response}</p>
                </div>
              )}
              <div className="flex items-center gap-4 border-t pt-4">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm">{viewingReview.helpful_count || 0} found helpful</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-red-600" />
                  <span className="text-sm">{viewingReview.not_helpful_count || 0} not helpful</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Submitted on {new Date(viewingReview.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestReviews;