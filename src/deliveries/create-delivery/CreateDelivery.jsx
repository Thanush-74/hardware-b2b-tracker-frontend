// CreateDelivery.jsx — Form to create a new delivery record
// POST /api/deliveries

import { useState, useEffect } from 'react';
import { createDelivery } from '../../services/deliveryService';
import { getAllOrders } from '../../services/orderService';

function CreateDelivery({ onSuccess, onCancel }) {
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');

  // Load orders for the dropdown
  useEffect(() => {
    async function fetchOrders() {
      try {
        const result = await getAllOrders({ order_status: 'Confirmed' });
        const list = result.data?.orders || result.data || [];
        setOrders(Array.isArray(list) ? list : []);
        if (list.length > 0) setOrderId(list[0].id);
      } catch {
        setError('Could not load orders.');
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createDelivery({
        order_id: orderId,
        delivery_address: deliveryAddress.trim(),
        recipient_name: recipientName.trim() || null,
        recipient_phone: recipientPhone.trim() || null,
        expected_delivery_date: expectedDate || null,
        notes: notes.trim() || null,
      });
      onSuccess('Delivery created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create delivery.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="delivery-order">Order *</label>
        {loadingOrders ? (
          <div className="spinner-wrapper" style={{ padding: '10px' }}><div className="spinner" /></div>
        ) : (
          <select
            id="delivery-order"
            className="form-select"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          >
            {orders.length === 0 && <option value="">No confirmed orders available</option>}
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.order_number} — {o.customer_name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="delivery-address">Delivery Address *</label>
        <textarea
          id="delivery-address"
          className="form-textarea"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Full delivery address…"
          required
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="recipient-name">Recipient Name</label>
          <input
            id="recipient-name"
            type="text"
            className="form-input"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="recipient-phone">Recipient Phone</label>
          <input
            id="recipient-phone"
            type="text"
            className="form-input"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="expected-date">Expected Delivery Date</label>
          <input
            id="expected-date"
            type="date"
            className="form-input"
            value={expectedDate}
            onChange={(e) => setExpectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="delivery-notes">Notes</label>
        <textarea
          id="delivery-notes"
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || loadingOrders}>
          {loading ? 'Creating…' : 'Create Delivery'}
        </button>
      </div>
    </form>
  );
}

export default CreateDelivery;
