// API client for Campus Resource Sharing Prototype

const BASE_URL = '/api';

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const savedUser = localStorage.getItem('crs_user');
  if (savedUser) {
    try {
      const parsed = JSON.parse(savedUser);
      if (parsed && parsed.id) {
        headers['x-user-id'] = parsed.id;
      }
    } catch (e) {
      // ignore
    }
  }

  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { ...getHeaders(), ...(options.headers || {}) };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const message = data.error || `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),

  getCurrentUser: () => request('/auth/me'),

  getDemoUsers: () => request('/auth/demo-users'),

  // Resources
  getResources: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.availability && params.availability !== 'All') query.append('availability', params.availability);
    if (params.sort) query.append('sort', params.sort);
    if (params.ownerId) query.append('ownerId', params.ownerId);

    const queryString = query.toString();
    return request(`/resources${queryString ? `?${queryString}` : ''}`);
  },

  getResourceById: (id) => request(`/resources/${id}`),

  createResource: (resourceData) =>
    request('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    }),

  updateResource: (id, updates) =>
    request(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  deleteResource: (id) =>
    request(`/resources/${id}`, {
      method: 'DELETE'
    }),

  // Requests
  getRequests: (params = {}) => {
    const query = new URLSearchParams();
    if (params.borrowerId) query.append('borrowerId', params.borrowerId);
    if (params.ownerId) query.append('ownerId', params.ownerId);
    if (params.status && params.status !== 'All') query.append('status', params.status);

    const queryString = query.toString();
    return request(`/requests${queryString ? `?${queryString}` : ''}`);
  },

  createRequest: (requestData) =>
    request('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    }),

  updateRequestStatus: (id, status) =>
    request(`/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getRequestMessages: (id) => request(`/requests/${id}/messages`),

  sendRequestMessage: (id, text) =>
    request(`/requests/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text })
    }),

  // Stats
  getStats: () => request('/stats'),

  resetDemoData: () =>
    request('/stats/reset', {
      method: 'POST'
    })
};
