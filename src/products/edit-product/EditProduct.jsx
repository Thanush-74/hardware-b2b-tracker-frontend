// EditProduct.jsx — Form to edit an existing product
// PUT /api/products/:id

import { useState } from 'react';
import { updateProduct } from '../../services/productService';

const PRODUCT_TYPES = ['GPU', 'RAM', 'ROM/SSD', 'Motherboard'];

function EditProduct({ product, onSuccess, onCancel }) {
  // Pre-fill the form with the existing product data
  const [name, setName] = useState(product.name || '');
  const [type, setType] = useState(product.type || PRODUCT_TYPES[0]);
  const [price, setPrice] = useState(product.price || '');
  const [availableQuantity, setAvailableQuantity] = useState(
    product.available_quantity ?? ''
  );
  const [description, setDescription] = useState(product.description || '');
  const [specifications, setSpecifications] = useState(
    product.specifications ? JSON.stringify(product.specifications, null, 2) : ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updateData = {
        name: name.trim(),
        type,
        price: parseFloat(price),
        available_quantity: parseInt(availableQuantity, 10),
        description: description.trim() || null,
      };

      if (specifications.trim()) {
        try {
          updateData.specifications = JSON.parse(specifications.trim());
        } catch {
          setError('Specifications must be valid JSON.');
          setLoading(false);
          return;
        }
      }

      await updateProduct(product.id, updateData);
      onSuccess('Product updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="edit-product-name">Product Name *</label>
          <input
            id="edit-product-name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-product-type">Type *</label>
          <select
            id="edit-product-type"
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-product-price">Price (₹) *</label>
          <input
            id="edit-product-price"
            type="number"
            className="form-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-product-qty">Available Quantity *</label>
          <input
            id="edit-product-qty"
            type="number"
            className="form-input"
            value={availableQuantity}
            onChange={(e) => setAvailableQuantity(e.target.value)}
            min="0"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-product-desc">Description</label>
        <textarea
          id="edit-product-desc"
          className="form-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-product-specs">Specifications (JSON)</label>
        <textarea
          id="edit-product-specs"
          className="form-textarea"
          value={specifications}
          onChange={(e) => setSpecifications(e.target.value)}
          style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
        />
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
          {loading ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default EditProduct;
