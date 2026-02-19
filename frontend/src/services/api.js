import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401/403 — redirect to login
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
};

// Materials
export const materialsAPI = {
    getAll: () => api.get('/materials'),
    getById: (id) => api.get(`/materials/${id}`),
    create: (data) => api.post('/materials', data),
    update: (id, data) => api.put(`/materials/${id}`, data),
    delete: (id) => api.delete(`/materials/${id}`),
};

// Transactions
export const transactionsAPI = {
    getInward: () => api.get('/transactions/inward'),
    createInward: (data) => api.post('/transactions/inward', data),
    getOutward: () => api.get('/transactions/outward'),
    createOutward: (data) => api.post('/transactions/outward', data),
};

// Dashboard
export const dashboardAPI = {
    getData: () => api.get('/dashboard'),
};

export default api;
