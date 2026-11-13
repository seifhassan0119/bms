const getBaseUrl = () => {
  return localStorage.getItem('BANK_API_BASE_URL') || '';
};

export const setBaseUrl = (url) => {
  if (url) {
    localStorage.setItem('BANK_API_BASE_URL', url.replace(/\/+$/, ''));
  } else {
    localStorage.removeItem('BANK_API_BASE_URL');
  }
};

async function apiRequest(endpoint, options = {}) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (data && data.error) ? data.error : `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Health & Auth
  checkHealth: () => apiRequest('/api/health'),
  loginTeller: (username, password) =>
    apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Dashboard
  getDashboard: () => apiRequest('/api/dashboard'),

  // Accounts
  getAccounts: (search = '') => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest(`/api/accounts${q}`);
  },
  getAccount: (idOrNumber) => apiRequest(`/api/accounts/${encodeURIComponent(idOrNumber)}`),
  deleteAccount: (id) =>
    apiRequest(`/api/accounts/${id}`, {
      method: 'DELETE',
    }),

  // Account Requests
  createAccountRequest: (payload) =>
    apiRequest('/api/accounts/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAccountRequests: (status = '') => {
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/api/accounts/requests${q}`);
  },
  reviewAccountRequest: (id, decision) =>
    apiRequest(`/api/accounts/requests/${id}/${decision}`, {
      method: 'POST',
    }),

  // Transactions
  createTransactionRequest: (payload) =>
    apiRequest('/api/transactions/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getTransactions: ({ type = '', status = '', account_id = '' } = {}) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    if (account_id) params.append('account_id', account_id);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/transactions${queryString}`);
  },
  getTransaction: (id) => apiRequest(`/api/transactions/${id}`),
  reviewTransaction: (id, decision) =>
    apiRequest(`/api/transactions/${id}/${decision}`, {
      method: 'POST',
    }),
};

