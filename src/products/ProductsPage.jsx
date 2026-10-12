// ProductsPage.jsx — Parent page that assembles all product action components
// Acts as the "Products" screen that users navigate to

import { useState } from 'react';
import ProductList from './view-products/ProductList';
import AddProduct from './add-product/AddProduct';
import EditProduct from './edit-product/EditProduct';
import DeleteProduct from './delete-product/DeleteProduct';

function ProductsPage() {
  // Controls which modal/panel is open
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit' | 'delete'
  const [selectedProduct, setSelectedProduct] = useState(null); // the product being edited/deleted
  const [successMessage, setSuccessMessage] = useState('');

  // Reload the list by toggling view back to 'list'
  // We use a key on ProductList to force a fresh API fetch after changes
  const [listKey, setListKey] = useState(0);

  function handleSuccess(message) {
    setSuccessMessage(message);
    setView('list');
    setSelectedProduct(null);
    setListKey((k) => k + 1); // forces ProductList to re-fetch
    // Clear the success message after 4 seconds
    setTimeout(() => setSuccessMessage(''), 4000);
  }

  function handleEdit(product) {
    setSelectedProduct(product);
    setView('edit');
  }

  function handleDelete(product) {
    setSelectedProduct(product);
    setView('delete');
  }

  function handleCancel() {
    setView('list');
    setSelectedProduct(null);
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>📦 Products</h1>
          <div className="page-header-sub">
            Manage GPU, RAM, ROM/SSD, and Motherboard catalog
          </div>
        </div>
      </div>

      {/* Success notification */}
      {successMessage && (
        <div className="alert alert-success">✔ {successMessage}</div>
      )}

      {/* Show the correct view based on state */}
      {view === 'list' && (
        <ProductList
          key={listKey}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={() => setView('add')}
        />
      )}

      {view === 'add' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Add New Product</h2>
          </div>
          <AddProduct onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      )}

      {view === 'edit' && selectedProduct && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Edit Product: {selectedProduct.name}</h2>
          </div>
          <EditProduct
            product={selectedProduct}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}

      {view === 'delete' && selectedProduct && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Deactivate Product</h2>
          </div>
          <DeleteProduct
            product={selectedProduct}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
