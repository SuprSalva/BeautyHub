const API_BASE = 'http://localhost:5037/api'; // Standard dev port for HTTP

const getSubdomain = () => {
  const host = window.location.hostname;
  return host.split('.')[0];
};

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Tenant-Subdomain': getSubdomain()
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Interceptor global para fetch
const fetchApi = async (url, options = {}) => {
  const res = await fetch(url, options);
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }
  return res;
};

// --- Auth API ---
export const login = async (email, password) => {
  const res = await fetchApi(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const registerTenant = async (salonData) => {
  const res = await fetchApi(`${API_BASE}/auth/register-tenant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(salonData)
  });
  if (!res.ok) throw new Error('Error al registrar tu cuenta. El subdominio podría estar en uso.');
  return res.json();
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const fetchCurrentUser = async () => {
  const res = await fetchApi(`${API_BASE}/auth/me`, { headers: getHeaders() });
  if (!res.ok) throw new Error('No se pudo obtener el perfil del usuario');
  return res.json();
};

export const fetchServices = async () => {
  const res = await fetchApi(`${API_BASE}/booking/services`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching services');
  return res.json();
};

export const fetchEmployees = async () => {
  const res = await fetchApi(`${API_BASE}/booking/employees`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching employees');
  return res.json();
};

export const createAppointment = async (appointmentData) => {
  const res = await fetchApi(`${API_BASE}/booking/appointments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(appointmentData),
  });
  if (!res.ok) throw new Error('Error creating appointment');
  return res.json();
};

// --- Owner API ---
export const fetchOwnerServices = async () => {
  const res = await fetchApi(`${API_BASE}/services`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching owner services');
  return res.json();
};

export const createOwnerService = async (serviceData) => {
  const res = await fetchApi(`${API_BASE}/booking/services`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(serviceData)
  });
  if (!res.ok) throw new Error('Error creating service');
  return res.json();
};

export const updateOwnerService = async (id, serviceData) => {
  const res = await fetchApi(`${API_BASE}/booking/services/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(serviceData)
  });
  if (!res.ok) throw new Error('Error updating service');
  return res.json();
};

export const deleteOwnerService = async (id) => {
  const res = await fetchApi(`${API_BASE}/booking/services/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error('Error deleting service');
  return true;
};

// --- Search & Notifications API ---
export const globalSearch = async (query) => {
  if (!query) return null;
  const res = await fetchApi(`${API_BASE}/search?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error searching');
  return res.json();
};

export const fetchNotifications = async () => {
  const res = await fetchApi(`${API_BASE}/notifications`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching notifications');
  return res.json();
};

export const markNotificationRead = async (id) => {
  const res = await fetchApi(`${API_BASE}/notifications/${id}/read`, { 
    method: 'POST',
    headers: getHeaders() 
  });
  if (!res.ok) throw new Error('Error marking notification read');
  return res.json();
};

// --- Employees API ---
export const createOwnerEmployee = async (employeeData) => {
  const res = await fetchApi(`${API_BASE}/employees`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(employeeData),
  });
  if (!res.ok) throw new Error('Error creating employee');
  return res.json();
};

export const updateOwnerEmployee = async (id, employeeData) => {
  const res = await fetchApi(`${API_BASE}/employees/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(employeeData),
  });
  if (!res.ok) throw new Error('Error updating employee');
  return res.json();
};

export const deleteOwnerEmployee = async (id) => {
  const res = await fetchApi(`${API_BASE}/employees/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Error deleting employee');
};

// --- Agenda API ---
export const fetchAgenda = async (dateStr, mode = 'day') => {
  let url = `${API_BASE}/agenda?mode=${mode}`;
  if (dateStr) url += `&date=${dateStr}`;
  const res = await fetchApi(url, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching agenda');
  return res.json();
};

export const updateAppointmentStatus = async (id, status, finalServiceIds = null, penaltyFee = null) => {
  const res = await fetchApi(`${API_BASE}/agenda/${id}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status, finalServiceIds, penaltyFee })
  });
  if (!res.ok) throw new Error('Error updating appointment status');
  return res.json();
};

// --- Inventory (Products) API ---
export const fetchProducts = async () => {
  const res = await fetchApi(`${API_BASE}/products`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching products');
  return res.json();
};

export const createProduct = async (productData) => {
  const res = await fetchApi(`${API_BASE}/products`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error('Error creating product');
  return res.json();
};

export const updateProduct = async (id, productData) => {
  const res = await fetchApi(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error('Error updating product');
  return res.json();
};

export const deleteProduct = async (id) => {
  const res = await fetchApi(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Error deleting product');
};

// --- POS (Transactions) API ---
export const fetchTransactions = async (mode = 'today') => {
  const res = await fetchApi(`${API_BASE}/transactions?mode=${mode}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching transactions');
  return res.json();
};

export const createTransaction = async (transactionData) => {
  const res = await fetchApi(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(transactionData),
  });
  if (!res.ok) throw new Error('Error creating transaction');
  return res.json();
};

export const sellItem = async (sellData) => {
  const res = await fetchApi(`${API_BASE}/transactions/sell`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(sellData),
  });
  if (!res.ok) throw new Error('Error selling item');
  return res.json();
};

// --- Settings API ---
export const fetchTenantSettings = async () => {
  const res = await fetchApi(`${API_BASE}/tenants/me`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching tenant settings');
  return res.json();
};

export const updateTenantSettings = async (data) => {
  const res = await fetchApi(`${API_BASE}/tenants/me`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error updating tenant settings');
  return res.json();
};

// --- Reports API ---
export const fetchDashboardReports = async () => {
  const res = await fetchApi(`${API_BASE}/reports/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Error fetching dashboard reports');
  return res.json();
};
