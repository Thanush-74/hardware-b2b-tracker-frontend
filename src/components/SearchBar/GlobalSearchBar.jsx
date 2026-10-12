// GlobalSearchBar.jsx — Topbar Global Search Bar with Live Debounced Dropdown
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { search } from '../../services/searchService';

// Module configuration with icons and labels
const MODULE_CONFIG = {
  products:    { label: 'Products',    icon: '📦', color: '#1565c0' },
  orders:      { label: 'Orders',      icon: '📋', color: '#2e7d32' },
  deliveries:  { label: 'Deliveries',  icon: '🚚', color: '#e65100' },
  returns:     { label: 'Returns',     icon: '↩️', color: '#c2185b' },
  inventory:   { label: 'Inventory',   icon: '🗃️', color: '#00838f' },
  production:  { label: 'Production',  icon: '⚙️', color: '#6a1b9a' },
  inspections: { label: 'Inspections', icon: '🔍', color: '#455a64' },
  staff:       { label: 'Staff',       icon: '👥', color: '#1a237e' },
};

function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search when user types
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(null);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    const debounceTimer = setTimeout(async () => {
      try {
        const response = await search(trimmed);
        setResults(response.data || {});
        setIsOpen(true);
      } catch (err) {
        setError(err.response?.data?.message || 'Search request failed.');
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle form submit (Pressing Enter)
  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsOpen(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  // Clear query and close dropdown
  function handleClear() {
    setQuery('');
    setResults(null);
    setIsOpen(false);
    setError('');
  }

  // Navigate when selecting a result
  function handleSelectResult(item) {
    setIsOpen(false);
    if (item.route) {
      navigate(item.route);
    }
  }

  // Check total result count across all modules
  const totalCount = results
    ? Object.values(results).reduce(
        (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
        0
      )
    : 0;

  return (
    <div className="topbar-search-container" ref={containerRef}>
      <form className="topbar-search-form" onSubmit={handleSubmit}>
        <span className="topbar-search-icon" aria-hidden="true">🔍</span>
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Global search (order #, product, staff, tracking...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && (results || error)) {
              setIsOpen(true);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          aria-label="Global search"
        />

        {/* Loading Spinner or Clear Button */}
        {loading ? (
          <div className="topbar-search-spinner" title="Searching..." />
        ) : query ? (
          <button
            type="button"
            className="topbar-search-clear-btn"
            onClick={handleClear}
            title="Clear search"
            aria-label="Clear search"
          >
            ✕
          </button>
        ) : null}
      </form>

      {/* Results Dropdown */}
      {isOpen && query.trim() && (
        <div className="search-dropdown" role="region" aria-label="Search results">
          {loading && !results && (
            <div className="search-dropdown-loading">
              <div className="spinner" style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }} />
              Searching across all modules…
            </div>
          )}

          {error && (
            <div className="search-dropdown-error">
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && results && totalCount === 0 && (
            <div className="search-dropdown-empty">
              No matching results found for "<strong>{query.trim()}</strong>"
            </div>
          )}

          {!error && results && totalCount > 0 && (
            <>
              {Object.entries(MODULE_CONFIG).map(([key, config]) => {
                const items = results[key];
                if (!Array.isArray(items) || items.length === 0) return null;

                return (
                  <div key={key} className="search-dropdown-section">
                    <div className="search-dropdown-section-header">
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                      <span style={{ marginLeft: 'auto', opacity: 0.7 }}>({items.length})</span>
                    </div>

                    {items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="search-dropdown-item"
                        onClick={() => handleSelectResult(item)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSelectResult(item);
                        }}
                      >
                        <div className="search-dropdown-item-main">
                          <div className="search-dropdown-item-title">
                            {item.title || item.name}
                          </div>
                          {item.subtitle && (
                            <div className="search-dropdown-item-subtitle">
                              {item.subtitle}
                            </div>
                          )}
                        </div>

                        {item.status && (
                          <div className="search-dropdown-item-badge">
                            {item.status}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              <div className="search-dropdown-footer">
                <button
                  type="button"
                  className="search-dropdown-footer-btn"
                  onClick={handleSubmit}
                >
                  View all {totalCount} results on Search page →
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default GlobalSearchBar;
