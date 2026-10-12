// RemoveCartItem.jsx — Confirmation before removing one item from the cart
// DELETE /api/cart/:id

import { useState } from 'react';
import { removeCartItem } from '../../services/cartService';

function RemoveCartItem({ cartItem, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      await removeCartItem(cartItem.id);
      onSuccess('Item removed from cart.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p>
        Remove <strong>{cartItem.product?.name || `Item #${cartItem.id}`}</strong> from the cart?
      </p>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '6px' }}>
        Quantity: {cartItem.quantity}
      </p>

      {error && <div className="alert alert-error" style={{ marginTop: '16px' }}>⚠️ {error}</div>}

      <div className="form-actions">
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Removing…' : 'Yes, Remove'}
        </button>
      </div>
    </div>
  );
}

export default RemoveCartItem;
