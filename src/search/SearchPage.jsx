// SearchPage.jsx — Global search across products, orders, staff, etc.
// GET /api/search?q=term

import { useState } from 'react';
import { search } from '../services/searchService';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null); // null = not searched yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSearch(event) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const result = await search(query.trim());
      // Backend returns result.data which may be an object of { products: [], orders: [], staff: [], ... }
      setResults(result.data || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Helper: render a group of search results (e.g. products, orders)
  function renderResultGroup(label, items, renderItem) {
    if (!items || items.length === 0) return null;
    return (
      <div className="search-result-group">
        <div className="search-result-group-title">
          {label} ({items.length})
        </div>
        {items.map((item, i) => (
          <div key={item.id || i} className="search-result-item">
            {renderItem(item)}
          </div>
        ))}
      </div>
    );
  }

  // Check if there are any results across all groups
  const hasResults = results && Object.values(results).some(
    (v) => Array.isArray(v) && v.length > 0
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🔎 Search</h1>
          <div className="page-header-sub">Search across products, orders, staff, and more</div>
        </div>
      </div>

      {/* Search bar */}
      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label" htmlFor="search-input">Search Query</label>
            <input
              id="search-input"
              type="text"
              className="form-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search products, orders, staff…"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !query.trim()}
            style={{ flex: '0 0 auto' }}
          >
            {loading ? 'Searching…' : '🔎 Search'}
          </button>
        </form>
      </div>

      {/* Error */}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Loading */}
      {loading && (
        <div className="spinner-wrapper"><div className="spinner" /> Searching…</div>
      )}

      {/* Results */}
      {!loading && results !== null && (
        <div className="card">
          {!hasResults ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔎</div>
              <p>No results found for "<strong>{query}</strong>".</p>
              <p>Try a different keyword or check your spelling.</p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '16px', color: '#6b7280', fontSize: '0.85rem' }}>
                Showing results for "<strong>{query}</strong>"
              </div>

              {/* Products */}
              {renderResultGroup('Products', results.products, (item) => (
                <div>
                  <strong>{item.name}</strong> —{' '}
                  <span style={{ color: '#6b7280' }}>{item.type}</span> — $
                  {parseFloat(item.price || 0).toFixed(2)}
                </div>
              ))}

              {/* Orders */}
              {renderResultGroup('Orders', results.orders, (item) => (
                <div>
                  <strong>{item.order_number}</strong> —{' '}
                  {item.customer_name} —{' '}
                  <span className={`badge badge-${item.order_status?.toLowerCase()}`}>
                    {item.order_status}
                  </span>
                </div>
              ))}

              {/* Staff */}
              {renderResultGroup('Staff', results.staff, (item) => (
                <div>
                  <strong>{item.first_name} {item.last_name}</strong> —{' '}
                  {item.email} —{' '}
                  {item.role?.name || 'No role'}
                </div>
              ))}

              {/* Deliveries */}
              {renderResultGroup('Deliveries', results.deliveries, (item) => (
                <div>
                  <strong>{item.tracking_number}</strong> —{' '}
                  {item.recipient_name || '-'} —{' '}
                  <span className={`badge badge-${item.status?.toLowerCase().replace(' ', '') || 'pending'}`}>
                    {item.status}
                  </span>
                </div>
              ))}

              {/* Returns */}
              {renderResultGroup('Returns', results.returns, (item) => (
                <div>
                  <strong>{item.return_number}</strong> —{' '}
                  {item.customer_name} —{' '}
                  <span className={`badge badge-${item.status?.toLowerCase() || 'requested'}`}>
                    {item.status}
                  </span>
                </div>
              ))}

              {/* Any other result groups the backend may return */}
              {Object.entries(results).map(([key, items]) => {
                // Skip known groups already rendered above
                if (['products', 'orders', 'staff', 'deliveries', 'returns'].includes(key)) return null;
                if (!Array.isArray(items) || items.length === 0) return null;
                return renderResultGroup(
                  key.charAt(0).toUpperCase() + key.slice(1),
                  items,
                  (item) => <div>{JSON.stringify(item)}</div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
