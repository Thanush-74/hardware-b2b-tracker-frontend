// CartPage.jsx — Parent page that coordinates all cart actions

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clearCart } from '../services/cartService';
import ViewCart from './view-cart/ViewCart';
import AddToCart from './add-to-cart/AddToCart';
import UpdateCartQuantity from './update-quantity/UpdateCartQuantity';
import RemoveCartItem from './remove-item/RemoveCartItem';
import CreateOrder from '../orders/create-order/CreateOrder';

function CartPage() {
  const { hasPermission } = useAuth();

  // Which modal/panel is open
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'remove' | 'clear'
  const [selectedItem, setSelectedItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [cartData, setCartData] = useState(null);

  // Increment this key to force ViewCart to reload from API
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess(message) {
    setSuccessMessage(message);
    setModal(null);
    setSelectedItem(null);
    setIsPlacingOrder(false);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setSuccessMessage(''), 5000);
  }

  function handleClose() {
    setModal(null);
    setSelectedItem(null);
  }

  function handlePlaceOrder(data) {
    setCartData(data);
    setIsPlacingOrder(true);
    setTimeout(() => {
      const el = document.getElementById('cart-inline-order-form');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  async function handleClearAll() {
    if (!window.confirm('Are you sure you want to clear the entire cart?')) return;
    try {
      await clearCart();
      setIsPlacingOrder(false);
      handleSuccess('Cart cleared.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear cart.');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>🛒 Cart</h1>
          <div className="page-header-sub">
            Review items and quantities before creating an order
          </div>
        </div>
        {hasPermission('cart.edit') && modal === null && (
          <button className="btn btn-primary" onClick={() => { setIsPlacingOrder(false); setModal('add'); }}>
            + Add Item
          </button>
        )}
      </div>

      {successMessage && (
        <div className="alert alert-success">✔ {successMessage}</div>
      )}

      {/* Cart list — stays visible on the Cart screen */}
      {modal === null && (
        <ViewCart
          refreshKey={refreshKey}
          onEdit={(item) => { setSelectedItem(item); setModal('edit'); setIsPlacingOrder(false); }}
          onRemove={(item) => { setSelectedItem(item); setModal('remove'); setIsPlacingOrder(false); }}
          onClear={handleClearAll}
          onPlaceOrder={handlePlaceOrder}
          isPlacingOrder={isPlacingOrder}
          onCartLoaded={(data) => setCartData(data)}
        />
      )}

      {/* Inline Create New Order Form — displayed directly on the same Cart screen below cart items */}
      {modal === null && isPlacingOrder && (
        <div className="card" style={{ marginTop: '24px' }} id="cart-inline-order-form">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 className="card-title">📋 Create New Order</h2>
              <div style={{ color: 'var(--color-text-muted, #64748b)', fontSize: '0.85rem', marginTop: '2px' }}>
                Complete customer details below to finalize order from current cart
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setIsPlacingOrder(false)}
            >
              ✕ Close
            </button>
          </div>
          <div style={{ paddingTop: '8px' }}>
            <CreateOrder
              cartData={cartData}
              onSuccess={handleSuccess}
              onCancel={() => setIsPlacingOrder(false)}
            />
          </div>
        </div>
      )}

      {modal === 'add' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Add Item to Cart</h2>
          </div>
          <AddToCart onSuccess={handleSuccess} onCancel={handleClose} />
        </div>
      )}

      {modal === 'edit' && selectedItem && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Update Quantity</h2>
          </div>
          <UpdateCartQuantity
            cartItem={selectedItem}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}

      {modal === 'remove' && selectedItem && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Remove Item</h2>
          </div>
          <RemoveCartItem
            cartItem={selectedItem}
            onSuccess={handleSuccess}
            onCancel={handleClose}
          />
        </div>
      )}
    </div>
  );
}

export default CartPage;
