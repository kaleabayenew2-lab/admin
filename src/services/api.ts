import axios from 'axios';
import { decryptString } from '../utils/secureStorage';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const WITH_CREDENTIALS = (import.meta.env.VITE_API_WITH_CREDENTIALS || 'false').toLowerCase() === 'true';

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: WITH_CREDENTIALS,
});

// Add authorization header if token exists
api.interceptors.request.use(async (config) => {
  try {
    const raw = localStorage.getItem('authTokenEnc');
    if (raw) {
      const token = await decryptString(raw);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('admin:api-request')); } catch (e) {}
  return config;
});

api.interceptors.response.use(
  (response) => {
    try { window.dispatchEvent(new CustomEvent('admin:api-response')); } catch (e) {}
    // emit success toast for mutating requests that return a message
    try {
      const method = (response.config && response.config.method) || '';
      if (['post', 'put', 'delete', 'patch'].includes(method.toLowerCase())) {
        const msg = response.data && (response.data.message || response.data.msg || response.data.result || null);
        if (msg) window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: msg } }));
      }
    } catch (e) {}
    return response;
  },
  (error) => {
    try { window.dispatchEvent(new CustomEvent('admin:api-response')); } catch (e) {}
    // show error toast
    try {
      const msg = error?.response?.data?.message || error?.message || 'Request failed';
      window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'error', message: String(msg) } }));
    } catch (e) {}
    return Promise.reject(error);
  }
);

export default api;
