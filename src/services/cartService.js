// cartService.js — All API calls for the Cart
import api from './api';

// GET /api/cart  — view current cart contents and total
export async function getCart() {
  const response = await api.get('/cart');
  return response.data;
}

// POST /api/cart  — add an item to the cart
// body: { product_id, quantity }
export async function addToCart(product_id, quantity) {
  const response = await api.post('/cart', { product_id, quantity });
  return response.data;
}

// PUT /api/cart/:id  — update quantity of a specific cart item
// body: { quantity }
export async function updateCartItem(cartItemId, quantity) {
  const response = await api.put(`/cart/${cartItemId}`, { quantity });
  return response.data;
}

// DELETE /api/cart/:id  — remove one specific item from the cart
export async function removeCartItem(cartItemId) {
  const response = await api.delete(`/cart/${cartItemId}`);
  return response.data;
}

// DELETE /api/cart  — clear the entire cart
export async function clearCart() {
  const response = await api.delete('/cart');
  return response.data;
}
