import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export const authService = {
  login: async (username, password) => {
    console.log('Sending login request with:', { username, password }); // Debug log
    const response = await api.post('/auth/login', { username, password });
    console.log('Login response:', response.data); // Debug log
    return response.data;
  },
  signup: async (username, password) => {
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  }
};

export default api; 