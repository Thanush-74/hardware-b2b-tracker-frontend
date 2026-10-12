// CreateOrder.jsx — Form to create a new customer order from the cart
// POST /api/orders  (backend converts active cart items into an order)

import { useState, useEffect } from 'react';
import { createOrder } from '../../services/orderService';
import { getCart } from '../../services/cartService';

// Must match backend ALLOWED_PAYMENT_METHODS: 'Bank Transfer', 'Credit Card', 'Cash', 'Other'
const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Credit Card', 'Other'];

function CreateOrder({ onSuccess, onCancel }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartPreview, setCartPreview] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  // Load cart preview so the user can see what will be ordered
  useEffect(() => {
    async function fetchCart() {
      try {
        const result = await getCart();
        setCartPreview(result.data);
      } catch {
        // Cart preview is optional — don't block form if it fails
      } finally {
        setLoadingCart(false);
      }
    }
    fetchCart();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    // Guard: must have items in cart
    if (cartPreview && cartPreview.items && cartPreview.items.length === 0) {
      setError('Your cart is empty. Add products to your cart before placing an order.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // use_cart: true tells the backend to convert the user’s active cart into the order
      await createOrder({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || null,
        customer_phone: customerPhone.trim() || null,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
        use_cart: true,
      });
      onSuccess('Order placed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Cart preview: show what will be ordered */}
      {loadingCart ? (
        <div className="spinner-wrapper" style={{ padding: '12px' }}><div className="spinner" /> Loading cart…</div>
      ) : cartPreview && cartPreview.items && cartPreview.items.length > 0 ? (
        <div className="card" style={{ marginBottom: '20px', padding: '16px', background: 'var(--color-bg-secondary, #f4f6f9)' }}>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Items from your cart ({cartPreview.items.length})</div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
            {cartPreview.items.map((item) => (
              <li key={item.id}>
                {item.product_name || item.product_id} × {item.quantity} — ${(item.item_total ?? item.unit_price * item.quantity ?? 0).toFixed(2)}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '8px', fontWeight: 700 }}>Total: ${parseFloat(cartPreview.cart_total ?? 0).toFixed(2)}</div>
        </div>
      ) : (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          ⚠️ Your cart is empty. Go to Products and add items before placing an order.
        </div>
      )}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="order-customer-name">Customer Name *</label>
          <input
            id="order-customer-name"
            type="text"
            className="form-input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Full name or company"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="order-payment">Payment Method</label>
          <select
            id="order-payment"
            className="form-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="order-email">Customer Email</label>
          <input
            id="order-email"
            type="email"
            className="form-input"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="customer@company.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="order-phone">Customer Phone</label>
          <input
            id="order-phone"
            type="text"
            className="form-input"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="+1 234 567 8900"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="order-notes">Notes</label>
        <textarea
          id="order-notes"
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional order notes…"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}

export default CreateOrder;
