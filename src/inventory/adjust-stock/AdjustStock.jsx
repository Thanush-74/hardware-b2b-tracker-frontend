// AdjustStock.jsx — Form to increase, decrease, or set exact stock for an inventory item
// Uses POST /api/inventory/:id/increase, POST /api/inventory/:id/decrease,
// or PUT /api/inventory/:id

import { useState } from 'react';
import {
  increaseStock,
  decreaseStock,
  updateStock,
} from '../../services/inventoryService';

function AdjustStock({ inventoryItem, onSuccess, onCancel }) {
  // 'increase' | 'decrease' | 'set'
  const [adjustType, setAdjustType] = useState('increase');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState(inventoryItem.location || 'Main Warehouse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // The inventoryItem object comes from the API which returns flat fields,
  // not a nested product object (product_name, not product?.name).
  const productName = inventoryItem.product_name || `Item #${inventoryItem.id}`;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const value = parseInt(amount, 10);
    if (isNaN(value) || value < 1) {
      setError('Please enter a valid positive number.');
      setLoading(false);
      return;
    }

    try {
      if (adjustType === 'increase') {
        await increaseStock(inventoryItem.id, value);
      } else if (adjustType === 'decrease') {
        await decreaseStock(inventoryItem.id, value);
      } else {
        // Set exact quantity
        await updateStock(inventoryItem.id, { quantity: value, location });
      }
      onSuccess('Inventory updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update inventory.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--color-bg)', borderRadius: '8px' }}>
        <strong>{productName}</strong>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '4px' }}>
          Current Stock: {inventoryItem.total_quantity} | Reserved: {inventoryItem.reserved_quantity}
        </div>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label">Adjustment Type</label>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['increase', 'decrease', 'set'].map((t) => (
            <label
              key={t}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              <input
                type="radio"
                name="adjustType"
                value={t}
                checked={adjustType === t}
                onChange={() => setAdjustType(t)}
              />
              {t === 'increase' ? '▲ Increase' : t === 'decrease' ? '▼ Decrease' : '= Set Exact'}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="adjust-amount">
          {adjustType === 'set' ? 'New Exact Quantity' : 'Amount to ' + adjustType} *
        </label>
        <input
          id="adjust-amount"
          type="number"
          className="form-input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="1"
          required
        />
      </div>

      {adjustType === 'set' && (
        <div className="form-group">
          <label className="form-label" htmlFor="adjust-location">Storage Location</label>
          <input
            id="adjust-location"
            type="text"
            className="form-input"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Apply Adjustment'}
        </button>
      </div>
    </form>
  );
}

export default AdjustStock;
