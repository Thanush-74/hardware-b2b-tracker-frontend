// CreateReturn.jsx — Form to create a new return request
// POST /api/returns

import { useState, useEffect } from 'react';
import { createReturn } from '../../services/returnService';
import { getAllOrders } from '../../services/orderService';
import { getProducts } from '../../services/productService';

function CreateReturn({ onSuccess, onCancel }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [returnReason, setReturnReason] = useState('');
  const [replacementRequired, setReplacementRequired] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersResult, productsResult] = await Promise.all([
          getAllOrders(),
          getProducts(),
        ]);
        const orderList = ordersResult.data?.orders || ordersResult.data || [];
        const productList = productsResult.data?.products || productsResult.data || [];
        setOrders(Array.isArray(orderList) ? orderList : []);
        setProducts(Array.isArray(productList) ? productList : []);
      } catch {
        setError('Could not load orders/products.');
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await createReturn({
        order_id: orderId,
        product_id: productId,
        customer_name: customerName.trim(),
        quantity: parseInt(quantity, 10),
        return_reason: returnReason.trim(),
        replacement_required: replacementRequired,
        notes: notes.trim() || null,
      });
      onSuccess('Return request created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create return request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">⚠️ {error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="return-order">Order *</label>
          <select
            id="return-order"
            className="form-select"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
            disabled={loadingData}
          >
            <option value="">Select order…</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>{o.order_number} — {o.customer_name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="return-product">Product *</label>
          <select
            id="return-product"
            className="form-select"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            disabled={loadingData}
          >
            <option value="">Select product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.type})</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="return-customer">Customer Name *</label>
          <input
            id="return-customer"
            type="text"
            className="form-input"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="return-qty">Quantity *</label>
          <input
            id="return-qty"
            type="number"
            className="form-input"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="return-reason">Return Reason *</label>
        <textarea
          id="return-reason"
          className="form-textarea"
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          placeholder="Describe why the product is being returned…"
          required
        />
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.875rem' }}>
          <input
            type="checkbox"
            checked={replacementRequired}
            onChange={(e) => setReplacementRequired(e.target.checked)}
          />
          Replacement required
        </label>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="return-notes">Notes</label>
        <textarea
          id="return-notes"
          className="form-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading || loadingData}>
          {loading ? 'Submitting…' : 'Create Return Request'}
        </button>
      </div>
    </form>
  );
}

export default CreateReturn;
