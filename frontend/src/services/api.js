// Central API helper
const BASE_URL = 'http://localhost:5000/api';

export function getToken() {
  return localStorage.getItem('ims_token');
}

export function setToken(token) {
  localStorage.setItem('ims_token', token);
}

export function clearToken() {
  localStorage.removeItem('ims_token');
  localStorage.removeItem('ims_user');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

// ─── Auth ──────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),
  register: (data) =>
    request('/auth/register', { method: 'POST', body: data }),
};


// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => request('/dashboard/stats'),
  getChart: (mode = 'VOL') => request(`/dashboard/chart?mode=${mode}`),
  getLogs:  () => request('/dashboard/logs'),
  addLog:   (message) => request('/dashboard/logs', { method: 'POST', body: { message } }),
};

export const userDashboardAPI = {
  getSummary:  () => request('/user/dashboard/stats'),
  getActivity: () => request('/user/dashboard/activity'),
};

// ─── Inventory ────────────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory?${q}`);
  },
  getStats: () => request('/inventory/stats'),
  getCategories: () => request('/inventory/categories'),
  create:  (data) => request('/inventory', { method: 'POST', body: data }),
  update:  (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: data }),
  adjust:  (data) => request('/inventory/adjust', { method: 'PATCH', body: data }),
  bulkAdjust: (data) => request('/inventory/batch-sync', { method: 'POST', body: data }),
  remove:  (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
};

// ─── Sales ────────────────────────────────────────────────────────────────
export const salesAPI = {
  getCustomers: () => request('/customers'),
  getInvoices: (params) => request(`/sales/invoices?search=${params?.search || ''}&status=${params?.status || 'ALL'}`),
  getInvoice: (id) => request(`/sales/invoice/${id}`),
  createInvoice: (data) => request('/sales/invoice', { method: 'POST', body: data }),
  updateStatus: (id, status) => request(`/sales/invoice/${id}/status`, { method: 'PATCH', body: { status } }),
  getShipments: () => request('/shipments'),
};

// ─── Procurement ──────────────────────────────────────────────────────────
export const procurementAPI = {
  getSuppliers: () => request('/suppliers'),
  createSupplier: (data) => request('/suppliers', { method: 'POST', body: data }),
  updateSupplier: (id, data) => request(`/suppliers/${id}`, { method: 'PUT', body: data }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),
  getOrders: () => request('/purchase-orders'),
  getOrderDetails: (id) => request(`/purchase-orders/${id}`),
  createOrder: (data) => request('/purchase-orders', { method: 'POST', body: data }),
  updateOrderStatus: (id, status) => request(`/purchase-orders/${id}/status`, { method: 'PATCH', body: { status } }),
};

// ─── Warehouse ────────────────────────────────────────────────────────────
export const warehouseAPI = {
  getWarehouses: () => request('/warehouses'),
  getInventory: (params) => request(`/warehouse/inventory?warehouseId=${params?.warehouseId || ''}&aisle=${params?.aisle || ''}`),
  transfer: (data) => request('/warehouse/transfer', { method: 'POST', body: data }),
};

// ─── Analytics ────────────────────────────────────────────────────────────
export const reportsAPI = {
  getStats: () => request('/user/reports/stats'),
};

// ─── Users ────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll:  () => request('/users'),
  create:  (data) => request('/users', { method: 'POST', body: data }),
  toggle:  (id) => request(`/users/${id}/toggle`, { method: 'PUT' }),
  getRoles: () => request('/roles'),
};

// ─── Alerts ───────────────────────────────────────────────────────────────
export const alertsAPI = {
  getAll:       (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/alerts?${q}`);
  },
  acknowledge:  (id) => request(`/alerts/${id}/acknowledge`, { method: 'PUT' }),
  create:       (data) => request('/alerts', { method: 'POST', body: data }),
};

// ─── Global Search ─────────────────────────────────────────────────────────
export const searchAPI = {
  query: (q) => request(`/search?q=${encodeURIComponent(q)}`),
};
