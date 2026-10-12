// AddProduct.jsx — Form to create a new product
// POST /api/products

import { useState } from 'react';
import { createProduct } from '../../services/productService';

// Catalog is limited to these four types only
const PRODUCT_TYPES = ['GPU', 'RAM', 'ROM/SSD', 'Motherboard'];

function AddProduct({ onSuccess, onCancel }) {
  // Form field state
  const [name, setName] = useState('');
  const [type, setType] = useState(PRODUCT_TYPES[0]);
  const [price, setPrice] = useState('');
  const [availableQuantity, setAvailableQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Build the product data object
      const productData = {
        name: name.trim(),
        type,
        price: parseFloat(price),
        available_quantity: parseInt(availableQuantity, 10),
        description: description.trim() || null,
      };

      // If the user typed specifications JSON, try to parse it
      if (specifications.trim()) {
        try {
          productData.specifications = JSON.parse(specifications.trim());
        } catch {
          setError('Specifications must be valid JSON (e.g. {"cores": 8})');
          setLoading(false);
          return;
        }
      }

      await createProduct(productData);
      onSuccess('Product created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="product-name">Product Name *</label>
          <input
            id="product-name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. NVIDIA RTX 5090"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="product-type">Type *</label>
          <select
            id="product-type"
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="product-price">Price ($) *</label>
          <input
            id="product-price"
            type="number"
            className="form-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="product-qty">Available Quantity *</label>
          <input
            id="product-qty"
            type="number"
            className="form-input"
            value={availableQuantity}
            onChange={(e) => setAvailableQuantity(e.target.value)}
            placeholder="0"
            min="0"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="product-desc">Description</label>
        <textarea
          id="product-desc"
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional product description…"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="product-specs">
          Specifications (JSON format, optional)
        </label>
        <textarea
          id="product-specs"
          className="form-textarea"
          value={specifications}
          onChange={(e) => setSpecifications(e.target.value)}
          placeholder={'e.g. {"cores": 8, "memory": "16GB"}'}
          style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
        />
        <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
          Must be valid JSON or leave blank.
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}

export default AddProduct;
