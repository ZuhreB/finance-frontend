import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Attaching token to request:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Unauthorized! Redirecting to login.');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
};

export const transactionAPI = {
  create: (transactionData) => api.post('/transactions', transactionData),
  getFiltered: (filters) => api.get('/transactions', { params: filters }),
  getAll: () => api.get('/transactions'),
  getBalance: () => api.get('/transactions/balance'),
  getByType: (type) => api.get(`/transactions/type/${type}`),
  getTransactionsByDateRange: (startDate, endDate) => {
    return api.get(`/transactions/reports/summary`, {
      params: {
        startDate: startDate,
        endDate: endDate,
      },
    });
  },
};

export default api;