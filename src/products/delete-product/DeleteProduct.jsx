// DeleteProduct.jsx — Confirmation dialog before deactivating a product
// DELETE /api/products/:id  (soft delete — sets is_active = false)

import { useState } from 'react';
import { deleteProduct } from '../../services/productService';

function DeleteProduct({ product, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      await deleteProduct(product.id);
      onSuccess('Product deactivated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate product.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Warning message */}
      <div className="alert alert-info" style={{ marginBottom: '20px' }}>
        ⚠️ This will <strong>deactivate</strong> the product, not permanently delete it.
        It can be reactivated later by editing it.
      </div>

      <p>
        Are you sure you want to deactivate{' '}
        <strong>"{product.name}"</strong>?
      </p>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '6px' }}>
        Type: {product.type} | Price: ${parseFloat(product.price).toFixed(2)}
      </p>

      {error && <div className="alert alert-error" style={{ marginTop: '16px' }}>⚠️ {error}</div>}

      <div className="form-actions">
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}>
          {loading ? 'Deactivating…' : 'Yes, Deactivate'}
        </button>
      </div>
    </div>
  );
}

export default DeleteProduct;
