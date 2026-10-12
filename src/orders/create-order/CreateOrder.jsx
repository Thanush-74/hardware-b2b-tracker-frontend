// CreateOrder.jsx — Form to create a new customer order from the cart
// POST /api/orders  (backend converts active cart items into an order)

import { useState, useEffect } from 'react';
import { createOrder } from '../../services/orderService';
import { getCart } from '../../services/cartService';

// Must match backend ALLOWED_PAYMENT_METHODS: 'Bank Transfer', 'Credit Card', 'Cash', 'Other'
const PAYMENT_METHODS = ['Bank Transfer', 'Cash', 'Credit Card', 'Other'];

function CreateOrder({ onSuccess, onCancel, cartData }) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartPreview, setCartPreview] = useState(cartData || null);
  const [loadingCart, setLoadingCart] = useState(!cartData);

  // Load cart preview if not supplied directly
  useEffect(() => {
    if (cartData) {
      setCartPreview(cartData);
      setLoadingCart(false);
      return;
    }

    async function fetchCart() {
      setLoadingCart(true);
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
  }, [cartData]);

  const previewItems = cartPreview?.items || (Array.isArray(cartPreview) ? cartPreview : []);

  // Compute accurate total from cart items and prices
  const calculatedTotal = previewItems.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || item.unit_price || 0);
    const qty = parseInt(item.quantity, 10) || 0;
    const itemTotal = item.item_total != null ? parseFloat(item.item_total) : (price * qty);
    return sum + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  const displayTotal = cartPreview?.cart_total != null
    ? parseFloat(cartPreview.cart_total)
    : (cartPreview?.total != null ? parseFloat(cartPreview.total) : calculatedTotal);

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return; // Prevent duplicate submissions

    // Validate customer name (required)
    if (!customerName || !customerName.trim()) {
      setError('Customer / Company name is required.');
      return;
    }

    // Guard: must have items in cart
    if (!previewItems || previewItems.length === 0) {
      setError('Your cart is empty. Add products to your cart before placing an order.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // use_cart: true tells the backend to convert the user’s active cart into the order
      const result = await createOrder({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || null,
        customer_phone: customerPhone.trim() || null,
        payment_method: paymentMethod,
        notes: notes.trim() || null,
        use_cart: true,
      });

      const orderNumber = result?.data?.order_number || result?.order_number;
      const successMsg = orderNumber
        ? `Order #${orderNumber} placed successfully!`
        : 'Order placed successfully!';
      onSuccess(successMsg);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>⚠️ {error}</div>}

      {/* Cart Items Summary */}
      {loadingCart ? (
        <div className="spinner-wrapper" style={{ padding: '12px' }}>
          <div className="spinner" /> Loading cart summary…
        </div>
      ) : previewItems && previewItems.length > 0 ? (
        <div
          style={{
            marginBottom: '20px',
            padding: '16px',
            background: 'var(--color-bg, #f4f6f9)',
            border: '1px solid var(--color-border, #dde3ec)',
            borderRadius: 'var(--border-radius, 8px)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '10px', color: 'var(--color-dark, #1a1a2e)' }}>
            🛒 Cart Items Summary ({previewItems.length} {previewItems.length === 1 ? 'item' : 'items'})
          </div>

          <div className="table-wrapper" style={{ background: '#ffffff', borderRadius: '6px' }}>
            <table style={{ margin: 0, width: '100%' }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price (₹)</th>
                  <th>Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                {previewItems.map((item) => {
                  const name = item.product?.name || item.product_name || `Product #${item.product_id}`;
                  const qty = Number(item.quantity) || 0;
                  const price = parseFloat(item.product?.price || item.unit_price || 0);
                  const subtotal = item.item_total != null ? parseFloat(item.item_total) : (price * qty);

                  return (
                    <tr key={item.id || item.product_id}>
                      <td><strong>{name}</strong></td>
                      <td>{qty}</td>
                      <td>₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '12px',
              marginTop: '12px',
              paddingTop: '8px',
              borderTop: '1px solid var(--color-border, #dde3ec)',
              fontSize: '1.05rem',
              fontWeight: 700,
            }}
          >
            <span>Order Total:</span>
            <span style={{ color: 'var(--color-blue, #1565c0)', fontSize: '1.2rem' }}>
              ₹{displayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      ) : (
        <div className="alert alert-error" style={{ marginBottom: '16px' }}>
          ⚠️ Your cart is empty. Add products to your cart before placing an order.
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
            placeholder="Full name or company name"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="order-payment">Payment Method</label>
          <select
            id="order-payment"
            className="form-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="order-notes">Order Notes</label>
        <textarea
          id="order-notes"
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes or delivery instructions…"
          disabled={loading}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading || (previewItems && previewItems.length === 0)}>
          {loading ? 'Creating Order…' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}

export default CreateOrder;
