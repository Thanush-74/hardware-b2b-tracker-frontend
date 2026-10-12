// searchService.js — API call for global search
import api from './api';

// GET /api/search?q=term  — search across products, orders, staff, inventory, etc.
export async function search(query) {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return {
      success: true,
      message: 'Empty query',
      data: {
        products: [],
        staff: [],
        orders: [],
        deliveries: [],
        returns: [],
        inventory: [],
        production: [],
        inspections: []
      }
    };
  }
  const response = await api.get('/search', { params: { q: trimmed } });
  return response.data;
}
