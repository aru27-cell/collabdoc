import axios from 'axios';

// Single axios instance for the whole app
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Runs before EVERY request — attaches token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If server says 401 (token expired/invalid) — auto logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default API;
