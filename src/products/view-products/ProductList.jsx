// ProductList.jsx — View all products in a table
// Supports filtering by type and search by name

import { useState, useEffect } from 'react';
import { getProducts } from '../../services/productService';
import { addToCart } from '../../services/cartService';
import { useAuth } from '../../context/AuthContext';

// The canonical product types the catalog focuses on
const PRODUCT_TYPES = ['GPU', 'RAM', 'ROM', 'Motherboard'];

function ProductList({ onEdit, onDelete, onAdd }) {
  const { hasPermission } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');   // e.g. "GPU"
  const [searchName, setSearchName] = useState('');   // text search
  const [cartMessage, setCartMessage] = useState(''); // success or error for add-to-cart
  const [cartMessageType, setCartMessageType] = useState('success'); // 'success' | 'error'
  const [addingToCart, setAddingToCart] = useState(null); // product id currently being added

  // Load products whenever the filter changes
  useEffect(() => {
    loadProducts();
  }, [filterType]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterType) params.type = filterType;

      const result = await getProducts(params);
      // The backend returns data in result.data — could be an array or { products: [...] }
      const list = result.data?.products || result.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }

  // Filter by name in the browser (no extra API call needed)
  const displayedProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchName.toLowerCase())
  );

  async function handleAddToCart(product) {
    setAddingToCart(product.id);
    setCartMessage('');
    try {
      await addToCart(product.id, 1);
      setCartMessageType('success');
      setCartMessage(`"${product.name}" added to cart!`);
    } catch (err) {
      setCartMessageType('error');
      setCartMessage(err.response?.data?.message || 'Failed to add to cart.');
    } finally {
      setAddingToCart(null);
      setTimeout(() => setCartMessage(''), 4000);
    }
  }

  function getStatusBadge(isActive) {
    return isActive
      ? <span className="badge badge-active">Active</span>
      : <span className="badge badge-inactive">Inactive</span>;
  }

  // Available types in filter: canonical 4 types plus any additional distinct types in DB
  const availableTypes = Array.from(
    new Set([...PRODUCT_TYPES, ...products.map((p) => p.type).filter(Boolean)])
  );

  return (
    <div>
      {/* Filter and search bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="form-input"
          placeholder="Search by name…"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
        <select
          className="form-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Types</option>
          {availableTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {hasPermission('products.create') && (
          <button className="btn btn-primary" onClick={onAdd}>
            + Add Product
          </button>
        )}
      </div>

      {/* Error message */}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Cart feedback message */}
      {cartMessage && (
        <div className={`alert alert-${cartMessageType === 'success' ? 'success' : 'error'}`}>
          {cartMessageType === 'success' ? '✔' : '⚠️'} {cartMessage}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="spinner-wrapper">
          <div className="spinner" />
          Loading products…
        </div>
      )}

      {/* Products table */}
      {!loading && !error && (
        <div className="card" style={{ padding: 0 }}>
          {displayedProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <p>No products found.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Price (₹)</th>
                    <th>Qty Available</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>#{product.id}</td>
                      <td>
                        <strong>{product.name}</strong>
                        {product.description && (
                          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                            {product.description.slice(0, 50)}…
                          </div>
                        )}
                      </td>
                      <td>{product.type}</td>
                      <td>₹{parseFloat(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td>{product.available_quantity}</td>
                      <td>{getStatusBadge(product.is_active)}</td>
                      <td>
                        <div className="table-actions">
                          {hasPermission('cart.edit') && product.is_active && product.available_quantity > 0 && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={addingToCart === product.id}
                            >
                              {addingToCart === product.id ? 'Adding…' : '🛒 Add to Cart'}
                            </button>
                          )}
                          {hasPermission('products.edit') && (
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => onEdit(product)}
                            >
                              Edit
                            </button>
                          )}
                          {hasPermission('products.delete') && product.is_active && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => onDelete(product)}
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductList;
