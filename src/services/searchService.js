// searchService.js — API call for global search
import api from './api';

// GET /api/search?q=term  — search across products, orders, staff, etc.
export async function search(query) {
  const response = await api.get('/search', { params: { q: query } });
  return response.data;
}
