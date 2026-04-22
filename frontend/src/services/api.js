import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include JWT token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const roomService = {
  getAll: () => api.get('/rooms'),
  getOne: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.patch(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

export const equipmentService = {
  getAll: () => api.get('/equipment'),
  getOne: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.patch(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
};

export const reservationService = {
  getAll: () => api.get('/reservations'),
  getMy: () => api.get('/reservations/my'),
  getOne: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  updateStatus: (id, status) => api.patch(`/reservations/${id}/status`, { status }),
  getReports: () => api.get('/reservations/reports'),
};

export default api;
