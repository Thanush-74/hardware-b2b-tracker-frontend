// SearchPage.jsx — Global search across products, orders, staff, etc.
// GET /api/search?q=term

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { search } from '../services/searchService';

const MODULE_CONFIG = {
  products:    { label: 'Products',            icon: '📦', defaultRoute: '/products' },
  orders:      { label: 'Orders',              icon: '📋', defaultRoute: '/orders' },
  deliveries:  { label: 'Deliveries',          icon: '🚚', defaultRoute: '/deliveries' },
  returns:     { label: 'Returns & RMA',       icon: '↩️', defaultRoute: '/returns' },
  inventory:   { label: 'Inventory',           icon: '🗃️', defaultRoute: '/inventory' },
  production:  { label: 'Production Batches',  icon: '⚙️', defaultRoute: '/production' },
  inspections: { label: 'Quality Inspections', icon: '🔍', defaultRoute: '/inspections' },
  staff:       { label: 'Staff Management',    icon: '👥', defaultRoute: '/staff' },
};

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null); // null = not searched yet
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Automatically execute search if query exists in URL
  useEffect(() => {
    const qFromUrl = searchParams.get('q') || '';
    setQuery(qFromUrl);
    if (qFromUrl.trim()) {
      performSearch(qFromUrl.trim());
    }
  }, [searchParams]);

  async function performSearch(searchTerm) {
    if (!searchTerm) {
      setResults(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await search(searchTerm);
      setResults(response.data || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchParams({ q: trimmed });
    performSearch(trimmed);
  }

  function handleClear() {
    setQuery('');
    setResults(null);
    setError('');
    setSearchParams({});
  }

  function handleItemClick(item, defaultRoute) {
    const targetRoute = item.route || defaultRoute;
    if (targetRoute) {
      navigate(targetRoute);
    }
  }

  // Calculate total result count
  const totalCount = results
    ? Object.values(results).reduce(
        (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
        0
      )
    : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🔎 Global Search</h1>
          <div className="page-header-sub">Search across products, orders, inventory, deliveries, returns, staff, and QA</div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0, position: 'relative' }}>
            <label className="form-label" htmlFor="search-input">Search Query</label>
            <div style={{ position: 'relative' }}>
              <input
                id="search-input"
                type="text"
                className="form-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by order #, product name, staff, tracking, batch ID..."
                style={{ paddingRight: query ? '36px' : '12px' }}
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    padding: '2px 6px'
                  }}
                  title="Clear"
                  aria-label="Clear query"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !query.trim()}
            style={{ flex: '0 0 auto', height: '42px', minWidth: '120px' }}
          >
            {loading ? 'Searching…' : '🔎 Search'}
          </button>
        </form>
      </div>

      {/* Error alert */}
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {/* Loading state */}
      {loading && (
        <div className="spinner-wrapper" style={{ padding: '40px 0' }}>
          <div className="spinner" /> Searching across all business modules…
        </div>
      )}

      {/* Results container */}
      {!loading && results !== null && (
        <div className="card">
          {totalCount === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔎</div>
              <h3>No results found</h3>
              <p>No records matched your search for "<strong>{query}</strong>".</p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 4 }}>
                Try searching for a different keyword, order number, or checking permissions.
              </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#4b5563', fontSize: '0.9rem' }}>
                  Showing <strong>{totalCount}</strong> matching result{totalCount === 1 ? '' : 's'} for "<strong>{query}</strong>"
                </span>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Click any result to jump to details</span>
              </div>

              {/* Render each module section */}
              {Object.entries(MODULE_CONFIG).map(([key, config]) => {
                const items = results[key];
                if (!Array.isArray(items) || items.length === 0) return null;

                return (
                  <div key={key} className="search-result-group">
                    <div className="search-result-group-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                      <span style={{ opacity: 0.75, fontWeight: 500 }}>({items.length})</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="search-result-item"
                          onClick={() => handleItemClick(item, config.defaultRoute)}
                          style={{
                            cursor: 'pointer',
                            padding: '12px 16px',
                            borderRadius: '6px',
                            border: '1px solid #edf2f7',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#1565c0';
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#edf2f7';
                            e.currentTarget.style.background = '#ffffff';
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <div style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.95rem' }}>
                              {item.title || item.name}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                              {item.subtitle || item.description || ''}
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {item.status && (
                              <span className={`badge badge-${item.status.toLowerCase().replace(/[\s&]+/g, '') || 'info'}`}>
                                {item.status}
                              </span>
                            )}
                            <span style={{ color: '#1565c0', fontSize: '0.9rem', fontWeight: 600 }}>→</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPage;
