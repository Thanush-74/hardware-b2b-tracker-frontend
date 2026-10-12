// UpdateCartQuantity.jsx — Form to change the quantity of a cart item
// PUT /api/cart/:id

import { useState } from 'react';
import { updateCartItem } from '../../services/cartService';

function UpdateCartQuantity({ cartItem, onSuccess, onCancel }) {
  const [quantity, setQuantity] = useState(cartItem.quantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateCartItem(cartItem.id, parseInt(quantity, 10));
      onSuccess('Quantity updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update quantity.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <p style={{ marginBottom: '16px' }}>
        Update quantity for: <strong>{cartItem.product?.name || `Item #${cartItem.id}`}</strong>
      </p>

      <div className="form-group">
        <label className="form-label" htmlFor="update-cart-qty">New Quantity *</label>
        <input
          id="update-cart-qty"
          type="number"
          className="form-input"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Updating…' : 'Update Quantity'}
        </button>
      </div>
    </form>
  );
}

export default UpdateCartQuantity;
