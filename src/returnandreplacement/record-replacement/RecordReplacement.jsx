// RecordReplacement.jsx — Record replacement product details for a return
// PATCH /api/returns/:id/replacement

import { useState, useEffect } from 'react';
import { recordReplacement } from '../../services/returnService';
import { getProducts } from '../../services/productService';

function RecordReplacement({ returnRecord, onSuccess, onCancel }) {
  const [products, setProducts] = useState([]);
  const [replacementProductId, setReplacementProductId] = useState(
    returnRecord.replacement_product_id || ''
  );
  const [replacementQuantity, setReplacementQuantity] = useState(
    returnRecord.replacement_quantity || returnRecord.quantity || 1
  );
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const result = await getProducts();
        const list = result.data?.products || result.data || [];
        const active = Array.isArray(list) ? list.filter((p) => p.is_active) : [];
        setProducts(active);
        if (!replacementProductId && active.length > 0) {
          setReplacementProductId(active[0].id);
        }
      } catch {
        setError('Could not load products.');
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await recordReplacement(returnRecord.id, {
        replacement_product_id: replacementProductId,
        replacement_quantity: parseInt(replacementQuantity, 10),
      });
      onSuccess('Replacement recorded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record replacement.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ marginBottom: '16px' }}>
        Recording replacement for return: <strong>{returnRecord.return_number}</strong>
      </p>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="replacement-product">Replacement Product *</label>
        {loadingProducts ? (
          <div className="spinner-wrapper" style={{ padding: '10px' }}><div className="spinner" /></div>
        ) : (
          <select
            id="replacement-product"
            className="form-select"
            value={replacementProductId}
            onChange={(e) => setReplacementProductId(e.target.value)}
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
            ))}
          </select>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="replacement-qty">Replacement Quantity *</label>
        <input
          id="replacement-qty"
          type="number"
          className="form-input"
          value={replacementQuantity}
          onChange={(e) => setReplacementQuantity(e.target.value)}
          min="1"
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || loadingProducts}>
          {loading ? 'Saving…' : 'Record Replacement'}
        </button>
      </div>
    </form>
  );
}

export default RecordReplacement;
