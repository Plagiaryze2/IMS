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

// ─── Inventory ────────────────────────────────────────────────────────────
export const inventoryAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/inventory?${q}`);
  },
  getCategories: () => request('/inventory/categories'),
  create:  (data) => request('/inventory', { method: 'POST', body: data }),
  update:  (id, data) => request(`/inventory/${id}`, { method: 'PUT', body: data }),
  remove:  (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
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
