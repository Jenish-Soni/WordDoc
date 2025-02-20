import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000'
});

// Add request interceptor to add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token;
    }
    return config;
});

export const authService = {
    login: async (username, password) => {
        const response = await api.post('/auth/login', { username, password });
        return response.data;
    },
    signup: async (username, password) => {
        const response = await api.post('/auth/register', { username, password });
        return response.data;
    }
};

export const documentService = {
    create: async (title) => {
        const response = await api.post('/api/documents/create', { title });
        return response.data;
    },
    list: async () => {
        const response = await api.get('/api/documents/list');
        return response.data;
    },
    getDocument: async (id) => {
        const response = await api.get(`/api/documents/${id}`);
        return response.data;
    },
    updateTitle: async (id, title) => {
        const response = await api.patch(`/api/documents/${id}/title`, { title });
        return response.data;
    },
    updateContent: async (id, content) => {
        const response = await api.patch(`/api/documents/${id}/content`, { content });
        return response.data;
    }
};

export default api; 