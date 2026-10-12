// ViewCart.jsx — Displays the current cart with all items and totals
// GET /api/cart

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../../services/cartService';

function ViewCart({ refreshKey, onEdit, onRemove, onClear, onPlaceOrder, isPlacingOrder, onCartLoaded }) {
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
      const data = result.data;
      setCartData(data);
      if (onCartLoaded) {
        onCartLoaded(data);
      }
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

  const items = cartData?.items || (Array.isArray(cartData) ? cartData : []);

  // Accurately calculate total from items
  const calculatedTotal = items.reduce((sum, item) => {
    const price = parseFloat(item.product?.price || item.unit_price || 0);
    const qty = parseInt(item.quantity, 10) || 0;
    const itemTotal = item.item_total != null ? parseFloat(item.item_total) : (price * qty);
    return sum + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  const displayTotal = cartData?.cart_total != null
    ? parseFloat(cartData.cart_total)
    : (cartData?.total != null ? parseFloat(cartData.total) : calculatedTotal);

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
            {items.map((item) => {
              const name = item.product?.name || item.product_name || `Product #${item.product_id}`;
              const type = item.product?.type || item.product_type || '-';
              const price = parseFloat(item.product?.price || item.unit_price || 0);
              const qty = item.quantity;
              const subtotal = item.item_total != null
                ? parseFloat(item.item_total)
                : price * qty;

              return (
                <tr key={item.id}>
                  <td><strong>{name}</strong></td>
                  <td>{type}</td>
                  <td>${price.toFixed(2)}</td>
                  <td>{qty}</td>
                  <td>${subtotal.toFixed(2)}</td>
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cart total and Place Order */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
          Total: ${displayTotal.toFixed(2)}
        </span>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (onPlaceOrder) {
              onPlaceOrder(cartData);
            } else {
              navigate('/orders');
            }
          }}
          disabled={isPlacingOrder}
          title={isPlacingOrder ? 'Order form is displayed below' : 'Place order from this cart'}
        >
          {isPlacingOrder ? '📋 Order Form Open ↓' : '📋 Place Order'}
        </button>
      </div>
    </div>
  );
}

export default ViewCart;
