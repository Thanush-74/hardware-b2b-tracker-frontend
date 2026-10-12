// CartPage.jsx — Parent page that coordinates all cart actions

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { clearCart } from '../services/cartService';
import ViewCart from './view-cart/ViewCart';
import AddToCart from './add-to-cart/AddToCart';
import UpdateCartQuantity from './update-quantity/UpdateCartQuantity';
import RemoveCartItem from './remove-item/RemoveCartItem';

function CartPage() {
  const { hasPermission } = useAuth();

  // Which modal/panel is open
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'remove' | 'clear'
  const [selectedItem, setSelectedItem] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Increment this key to force ViewCart to reload from API
  const [refreshKey, setRefreshKey] = useState(0);

  function handleSuccess(message) {
    setSuccessMessage(message);
    setModal(null);
    setSelectedItem(null);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function handleClose() {
    setModal(null);
    setSelectedItem(null);
  }

  async function handleClearAll() {
    if (!window.confirm('Are you sure you want to clear the entire cart?')) return;
    try {
      await clearCart();
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
        {hasPermission('cart.edit') && (
          <button className="btn btn-primary" onClick={() => setModal('add')}>
            + Add Item
          </button>
        )}
      </div>

      {successMessage && (
        <div className="alert alert-success">✔ {successMessage}</div>
      )}

      {/* Cart list */}
      {modal === null && (
        <ViewCart
          refreshKey={refreshKey}
          onEdit={(item) => { setSelectedItem(item); setModal('edit'); }}
          onRemove={(item) => { setSelectedItem(item); setModal('remove'); }}
          onClear={handleClearAll}
        />
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
