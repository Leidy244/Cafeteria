import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const TOKEN_KEY = 'juyasia_token';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Error de conexión';
    console.error('[API Error]', message);
    return Promise.reject(error);
  }
);

export default api;
