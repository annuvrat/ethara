const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // Response might not be JSON
    }
    throw new Error(errorMessage);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Products
  getProducts: () => fetch(`${API_URL}/products`).then(handleResponse),
  getProduct: (id) => fetch(`${API_URL}/products/${id}`).then(handleResponse),
  createProduct: (data) => fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  updateProduct: (id, data) => fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteProduct: (id) => fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Customers
  getCustomers: () => fetch(`${API_URL}/customers`).then(handleResponse),
  getCustomer: (id) => fetch(`${API_URL}/customers/${id}`).then(handleResponse),
  createCustomer: (data) => fetch(`${API_URL}/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteCustomer: (id) => fetch(`${API_URL}/customers/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Orders
  getOrders: () => fetch(`${API_URL}/orders`).then(handleResponse),
  getOrder: (id) => fetch(`${API_URL}/orders/${id}`).then(handleResponse),
  createOrder: (data) => fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),
  deleteOrder: (id) => fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE'
  }).then(handleResponse),

  // Dashboard
  getDashboardSummary: () => fetch(`${API_URL}/dashboard/summary`).then(handleResponse),
};
