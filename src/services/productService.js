// productService.js — All API calls for Products
import api from './api';

// GET /api/products  — list all products (supports query params like ?type=GPU)
export async function getProducts(params = {}) {
  const response = await api.get('/products', { params });
  return response.data;
}

// GET /api/products/:id  — get one product by ID
export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

// POST /api/products  — create a new product
export async function createProduct(productData) {
  const response = await api.post('/products', productData);
  return response.data;
}

// PUT /api/products/:id  — update a product
export async function updateProduct(id, productData) {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
}

// DELETE /api/products/:id  — soft-delete (deactivate) a product
export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}
