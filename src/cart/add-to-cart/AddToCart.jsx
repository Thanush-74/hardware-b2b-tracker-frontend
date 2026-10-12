// AddToCart.jsx — Form to add a product to the cart
// POST /api/cart

import { useState, useEffect } from 'react';
import { addToCart } from '../../services/cartService';
import { getProducts } from '../../services/productService';

function AddToCart({ onSuccess, onCancel }) {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');

  // Load active products for the dropdown
  useEffect(() => {
    async function fetchProducts() {
      try {
        const result = await getProducts();
        const list = result.data?.products || result.data || [];
        // Only show active products
        const activeProducts = Array.isArray(list)
          ? list.filter((p) => p.is_active)
          : [];
        setProducts(activeProducts);
        if (activeProducts.length > 0) {
          setSelectedProductId(activeProducts[0].id);
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
    if (!selectedProductId) {
      setError('Please select a product.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addToCart(selectedProductId, parseInt(quantity, 10));
      onSuccess('Item added to cart!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="cart-product">Select Product *</label>
        {loadingProducts ? (
          <div className="spinner-wrapper" style={{ padding: '12px' }}>
            <div className="spinner" /> Loading products…
          </div>
        ) : (
          <select
            id="cart-product"
            className="form-select"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type}) — ${parseFloat(p.price).toFixed(2)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="cart-qty">Quantity *</label>
        <input
          id="cart-qty"
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
        <button type="submit" className="btn btn-primary" disabled={loading || loadingProducts}>
          {loading ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>
    </form>
  );
}

export default AddToCart;
