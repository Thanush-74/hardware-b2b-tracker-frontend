// ViewCart.jsx — Displays the current cart with all items and totals
// GET /api/cart

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../../services/cartService';

function ViewCart({ refreshKey, onEdit, onRemove, onClear }) {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reload whenever refreshKey changes (after add/remove/update)
  useEffect(() => {
    loadCart();
  }, [refreshKey]);

  async function loadCart() {
    setLoading(true);
    setError('');
    try {
      const result = await getCart();
      // Backend returns { data: { items: [...], total: 0 } } or similar
      setCartData(result.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="spinner-wrapper">
        <div className="spinner" /> Loading cart…
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">⚠️ {error}</div>;
  }

  const items = cartData?.items || cartData || [];
  const total = cartData?.total ?? 0;

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🛒</div>
        <p>Your cart is empty. Add items from the Product Catalog.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="card-title">Cart Items ({items.length})</h3>
        <button className="btn btn-danger btn-sm" onClick={onClear}>
          🗑 Clear All
        </button>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.product?.name || item.product_id}</strong></td>
                <td>{item.product?.type || '-'}</td>
                <td>${parseFloat(item.product?.price || item.unit_price || 0).toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td>
                  ${(parseFloat(item.product?.price || item.unit_price || 0) * item.quantity).toFixed(2)}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onEdit(item)}
                    >
                      Edit Qty
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onRemove(item)}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cart total and Place Order */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Total: ${parseFloat(total).toFixed(2)}
        </span>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/orders')}
          title="Go to Orders page to place your order from this cart"
        >
          📋 Place Order
        </button>
      </div>
    </div>
  );
}

export default ViewCart;
