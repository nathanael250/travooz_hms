import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, X, ShoppingCart } from 'lucide-react';
import apiClient from '../../services/apiClient';
import '../../styles/Restaurant.css';

const RestaurantOrders = () => {
  const [formData, setFormData] = useState({
    order_type: 'dine_in',
    restaurant_id: '',
    homestay_id: '',
    guest_id: '',
    booking_id: '',
    room_id: '',
    table_id: '',
    num_guests: 1,
    special_instructions: '',
    items: []
  });

  const [restaurants, setRestaurants] = useState([]);
  const [homestays, setHomestays] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [searchGuest, setSearchGuest] = useState('');
  const [showGuestSearch, setShowGuestSearch] = useState(false);
  const [showMenuSearch, setShowMenuSearch] = useState(false);
  const [searchMenu, setSearchMenu] = useState('');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchHomestays();
    fetchOrders();
  }, []);

  useEffect(() => {
    if (formData.homestay_id) {
      fetchRestaurants(formData.homestay_id);
      fetchRooms(formData.homestay_id);
    }
  }, [formData.homestay_id]);

  useEffect(() => {
    if (formData.restaurant_id) {
      fetchMenuItems(formData.restaurant_id);
      fetchTables(formData.homestay_id);
    }
  }, [formData.restaurant_id]);

  const fetchHomestays = async () => {
    try {
      const response = await apiClient.get('/homestays');
      const data = response.data;
      if (Array.isArray(data)) {
        setHomestays(data);
      } else if (data.data && Array.isArray(data.data)) {
        setHomestays(data.data);
      } else if (data.homestays && Array.isArray(data.homestays)) {
        setHomestays(data.homestays);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    }
  };

  const fetchRestaurants = async (homestayId) => {
    try {
      const response = await apiClient.get(`/homestays/${homestayId}/restaurants`);
      const data = response.data;
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const response = await apiClient.get('/restaurant/menu-items', {
        params: { restaurant_id: restaurantId }
      });
      const data = response.data;
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    }
  };

  const fetchTables = async (homestayId) => {
    try {
      const response = await apiClient.get('/restaurant/tables', {
        params: { homestay_id: homestayId, status: 'available' }
      });
      const data = response.data;
      setTables(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching tables:', error);
      setTables([]);
    }
  };

  const fetchRooms = async (homestayId) => {
    try {
      const response = await apiClient.get('/rooms', {
        params: { homestay_id: homestayId, status: 'occupied' }
      });
      const data = response.data;
      console.log('Rooms API response:', data);

      // Handle different response formats
      // API returns: { success: true, data: { rooms: [...] } }
      if (Array.isArray(data)) {
        console.log('Setting rooms from direct array:', data);
        setRooms(data);
      } else if (data.data && data.data.rooms && Array.isArray(data.data.rooms)) {
        console.log('Setting rooms from data.data.rooms:', data.data.rooms);
        setRooms(data.data.rooms);
      } else if (data.data && Array.isArray(data.data)) {
        console.log('Setting rooms from data.data:', data.data);
        setRooms(data.data);
      } else if (data.rooms && Array.isArray(data.rooms)) {
        console.log('Setting rooms from data.rooms:', data.rooms);
        setRooms(data.rooms);
      } else {
        console.log('No rooms found in response, setting empty array');
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/restaurant/orders');
      const data = response.data;
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const searchGuestsAPI = async (query) => {
    if (!query || query.length < 2) {
      setGuests([]);
      return;
    }
    try {
      const response = await apiClient.get('/guest-profiles', {
        params: { search: query }
      });
      const data = response.data;
      console.log('Guest search results:', data);
      setGuests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error searching guests:', error);
      setGuests([]);
    }
  };

  const handleGuestSelect = (guest) => {
    setFormData({
      ...formData,
      guest_id: guest.guest_id
    });
    setSearchGuest(`${guest.first_name} ${guest.last_name}`);
    setShowGuestSearch(false);

    // Fetch guest's active bookings
    if (formData.order_type === 'room_service') {
      fetchGuestBookings(guest.guest_id);
    }
  };

  const fetchGuestBookings = async (guestId) => {
    try {
      const response = await apiClient.get('/bookings', {
        params: { guest_id: guestId, booking_status: 'confirmed', service_type: 'room' }
      });
      const data = response.data;
      console.log('Guest bookings:', data);
      // Handle different response formats
      if (Array.isArray(data)) {
        setBookings(data);
      } else if (data.data && Array.isArray(data.data)) {
        setBookings(data.data);
      } else if (data.bookings && Array.isArray(data.bookings)) {
        setBookings(data.bookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    }
  };

  const addMenuItem = (menuItem) => {
    // Check if item already exists
    const existingIndex = formData.items.findIndex(
      item => item.menu_item_id === menuItem.menu_id
    );

    if (existingIndex >= 0) {
      // Increment quantity
      const updatedItems = [...formData.items];
      updatedItems[existingIndex].quantity += 1;
      updatedItems[existingIndex].total_price =
        updatedItems[existingIndex].unit_price * updatedItems[existingIndex].quantity;
      setFormData({ ...formData, items: updatedItems });
    } else {
      // Add new item
      const newItem = {
        menu_item_id: menuItem.menu_id,
        name: menuItem.name,
        quantity: 1,
        unit_price: parseFloat(menuItem.price),
        total_price: parseFloat(menuItem.price),
        special_instructions: ''
      };

      setFormData({
        ...formData,
        items: [...formData.items, newItem]
      });
    }

    setShowMenuSearch(false);
    setSearchMenu('');
  };

  const updateItemQuantity = (index, quantity) => {
    const updatedItems = [...formData.items];
    updatedItems[index].quantity = parseInt(quantity) || 1;
    updatedItems[index].total_price = updatedItems[index].unit_price * updatedItems[index].quantity;
    setFormData({ ...formData, items: updatedItems });
  };

  const updateItemNotes = (index, notes) => {
    const updatedItems = [...formData.items];
    updatedItems[index].special_instructions = notes;
    setFormData({ ...formData, items: updatedItems });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    if (!formData.homestay_id || !formData.restaurant_id) {
      alert('Please select homestay and restaurant');
      return;
    }

    if (formData.order_type === 'dine_in' && !formData.table_id) {
      alert('Please select a table for dine-in orders');
      return;
    }

    if (formData.order_type === 'room_service' && !formData.room_id) {
      alert('Please select a room for room service orders');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        homestay_id: parseInt(formData.homestay_id),
        restaurant_id: parseInt(formData.restaurant_id),
        order_type: formData.order_type,
        guest_id: formData.guest_id ? parseInt(formData.guest_id) : null,
        booking_id: formData.booking_id ? parseInt(formData.booking_id) : null,
        room_id: formData.room_id ? parseInt(formData.room_id) : null,
        table_id: formData.table_id ? parseInt(formData.table_id) : null,
        special_instructions: formData.special_instructions,
        items: formData.items
      };

      await apiClient.post('/restaurant/orders', orderData);

      alert('Order placed successfully!');
      resetForm();
      fetchOrders();
      setShowForm(false);
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      order_type: 'dine_in',
      restaurant_id: '',
      homestay_id: '',
      guest_id: '',
      booking_id: '',
      room_id: '',
      table_id: '',
      num_guests: 1,
      special_instructions: '',
      items: []
    });
    setSearchGuest('');
    setSearchMenu('');
    setGuests([]);
    setBookings([]);
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchMenu.toLowerCase()) &&
    item.available
  );

  return (
    <div className="restaurant-orders-container">
      <div className="page-header">
        <h1>Restaurant Orders</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          New Order
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Place Restaurant Order</h2>
              <button className="close-btn" onClick={() => {
                setShowForm(false);
                resetForm();
              }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
              {/* Section 1: Order Context */}
              <div className="form-section">
                <h3>📋 Order Context</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Order Type <span className="required">*</span></label>
                    <select
                      value={formData.order_type}
                      onChange={(e) => setFormData({
                        ...formData,
                        order_type: e.target.value,
                        table_id: '',
                        room_id: '',
                        booking_id: ''
                      })}
                      required
                    >
                      <option value="dine_in">Dine In</option>
                      <option value="room_service">Room Service</option>
                      <option value="takeaway">Takeaway</option>
                    </select>
                    <small>Defines workflow and required fields</small>
                  </div>

                  <div className="form-group">
                    <label>Homestay/Hotel <span className="required">*</span></label>
                    <select
                      value={formData.homestay_id}
                      onChange={(e) => setFormData({
                        ...formData,
                        homestay_id: e.target.value,
                        restaurant_id: '',
                        table_id: ''
                      })}
                      required
                    >
                      <option value="">Select Homestay</option>
                      {homestays.map(h => (
                        <option key={h.homestay_id} value={h.homestay_id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                    <small>Multi-property support</small>
                  </div>

                  <div className="form-group">
                    <label>Restaurant <span className="required">*</span></label>
                    <select
                      value={formData.restaurant_id}
                      onChange={(e) => setFormData({
                        ...formData,
                        restaurant_id: e.target.value,
                        table_id: ''
                      })}
                      required
                      disabled={!formData.homestay_id}
                    >
                      <option value="">Select Restaurant</option>
                      {restaurants.map(r => (
                        <option key={r.restaurant_id} value={r.restaurant_id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    <small>Links to restaurant entity</small>
                  </div>

                  {formData.order_type === 'dine_in' && (
                    <div className="form-group">
                      <label>Table <span className="required">*</span></label>
                      <select
                        value={formData.table_id}
                        onChange={(e) => setFormData({ ...formData, table_id: e.target.value })}
                        required
                        disabled={!formData.homestay_id}
                      >
                        <option value="">Select Table</option>
                        {tables.map(t => (
                          <option key={t.table_id} value={t.table_id}>
                            Table {t.table_number} (Capacity: {t.capacity})
                          </option>
                        ))}
                      </select>
                      <small>Assigns physical table</small>
                    </div>
                  )}

                  {formData.order_type === 'room_service' && (
                    <div className="form-group">
                      <label>Room <span className="required">*</span></label>
                      <select
                        value={formData.room_id}
                        onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                        required
                        disabled={!formData.homestay_id}
                      >
                        <option value="">Select Room</option>
                        {rooms.map(r => (
                          <option key={r.room_id} value={r.room_id}>
                            Room {r.room_number} - {r.room_type_name}
                          </option>
                        ))}
                      </select>
                      <small>For delivery routing</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Guest Details */}
              <div className="form-section">
                <h3>👤 Guest Details (Optional)</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Search Guest</label>
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        value={searchGuest}
                        onChange={(e) => {
                          setSearchGuest(e.target.value);
                          searchGuestsAPI(e.target.value);
                          setShowGuestSearch(true);
                        }}
                        placeholder="Search by name, email, phone..."
                      />
                      <Search size={18} />
                    </div>
                    {showGuestSearch && searchGuest.length >= 2 && (
                      <div className="search-results">
                        {guests.length > 0 ? (
                          guests.map(guest => (
                            <div
                              key={guest.guest_id}
                              className="search-result-item"
                              onClick={() => handleGuestSelect(guest)}
                            >
                              <div><strong>{guest.first_name} {guest.last_name}</strong></div>
                              <div className="text-secondary">{guest.email} • {guest.phone || 'N/A'}</div>
                            </div>
                          ))
                        ) : (
                          <div className="search-result-item no-hover">
                            <div className="text-secondary">No guests found</div>
                          </div>
                        )}
                      </div>
                    )}
                    <small>Links to guest profile</small>
                  </div>

                  {formData.order_type === 'room_service' && bookings.length > 0 && (
                    <div className="form-group">
                      <label>Booking Reference</label>
                      <select
                        value={formData.booking_id}
                        onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
                      >
                        <option value="">Select Booking</option>
                        {bookings.map(b => (
                          <option key={b.booking_id} value={b.booking_id}>
                            {b.booking_reference} - Room {b.roomBooking?.room?.room_number}
                          </option>
                        ))}
                      </select>
                      <small>Links to room booking</small>
                    </div>
                  )}

                  {formData.order_type === 'dine_in' && (
                    <div className="form-group">
                      <label>Number of Guests</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.num_guests}
                        onChange={(e) => setFormData({ ...formData, num_guests: e.target.value })}
                      />
                      <small>For seating and reporting</small>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 3: Order Items */}
              <div className="form-section">
                <h3>🍽️ Order Items <span className="required">*</span></h3>

                <div className="menu-search-section">
                  <label>Search Menu Items</label>
                  <div className="search-input-wrapper">
                    <input
                      type="text"
                      value={searchMenu}
                      onChange={(e) => {
                        setSearchMenu(e.target.value);
                        setShowMenuSearch(e.target.value.length > 0);
                      }}
                      placeholder="Search menu items to add..."
                      disabled={!formData.restaurant_id}
                    />
                    <Search size={18} />
                  </div>
                  <small>Select from hotel menu - click to add</small>

                  {showMenuSearch && searchMenu && filteredMenuItems.length > 0 && (
                    <div className="menu-search-results">
                      {filteredMenuItems.map(item => (
                        <div
                          key={item.menu_id}
                          className="menu-item-card"
                          onClick={() => addMenuItem(item)}
                        >
                          <div className="menu-item-info">
                            <h4>{item.name}</h4>
                            <p>{item.description}</p>
                          </div>
                          <div className="menu-item-price">
                            <Plus size={16} />
                            ${parseFloat(item.price).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {formData.items.length > 0 && (
                  <div className="order-items-list">
                    <h4><ShoppingCart size={18} /> Cart ({formData.items.length} items)</h4>
                    <table className="order-items-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Unit Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Notes</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.items.map((item, index) => (
                          <tr key={index}>
                            <td><strong>{item.name}</strong></td>
                            <td> RWF {item.unit_price.toFixed(2)}</td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, e.target.value)}
                                className="quantity-input"
                              />
                            </td>
                            <td><strong>RWF {item.total_price.toFixed(2)}</strong></td>
                            <td>
                              <input
                                type="text"
                                value={item.special_instructions}
                                onChange={(e) => updateItemNotes(index, e.target.value)}
                                placeholder="e.g., no onions, extra spicy"
                                className="notes-input"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="btn-icon btn-danger"
                                title="Remove item"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <div className="order-summary">
                      <div className="summary-row total">
                        <span>Subtotal:</span>
                        <span className="amount">RWF {calculateSubtotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {formData.items.length === 0 && (
                  <div className="empty-cart">
                    <ShoppingCart size={48} />
                    <p>No items added yet. Search and select items from the menu above.</p>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              <div className="form-section">
                <div className="form-group">
                  <label>Special Instructions</label>
                  <textarea
                    value={formData.special_instructions}
                    onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                    placeholder="Any special requests, dietary requirements, or delivery instructions..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading || formData.items.length === 0}
                >
                  {loading ? 'Placing Order...' : `Place Order ($${calculateSubtotal().toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="orders-list">
        <h2>Recent Orders</h2>
        {loading && <div className="loading">Loading orders...</div>}

        {!loading && orders.length === 0 && (
          <div className="empty-state">
            <ShoppingCart size={64} />
            <p>No orders found. Create your first order above.</p>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="orders-grid">
            {orders.slice(0, 10).map(order => (
              <div key={order.order_id} className="order-card">
                <div className="order-header">
                  <span className="order-number">#{order.order_number}</span>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Type:</span>
                    <span className="value">{order.order_type?.replace('_', ' ')}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Restaurant:</span>
                    <span className="value">{order.restaurant?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Total:</span>
                    <span className="value amount">RWF {parseFloat(order.total_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Items:</span>
                    <span className="value">{order.items?.length || 0} item(s)</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(order.order_date || order.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;
