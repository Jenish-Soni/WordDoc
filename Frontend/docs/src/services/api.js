import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Include credentials for cookie-based auth
});

// Add request interceptor to include token if needed
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // If using local storage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Include token in headers
    }
    return config;
});

export const authService = {
    setAuthHeader(token) {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    },

    removeAuthHeader() {
        delete api.defaults.headers.common['Authorization'];
    },

    async login(username, password) {
        const response = await api.post('/auth/login', { username, password });
        if (response.data.token) {
            this.setAuthHeader(response.data.token);
        }
        return response.data;
    },

    async logout() {
        try {
            await api.post('/auth/logout');
        } finally {
            this.removeAuthHeader();
        }
    },

    async checkAuth() {
        try {
            const response = await api.get('/auth/check');
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                // If endpoint doesn't exist, assume token is valid (temporary solution)
                return { authenticated: true };
            }
            throw error;
        }
    }
};

export const documentService = {
    create: async (title) => {
        const response = await api.post('/api/documents/create', { title });
        return response.data;
    },
    list: async () => {
        console.log('Listing documents...');
        const response = await api.get('/api/documents/list');
        console.log('Documents:', response.data);
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

export const grammarService = {
    async checkGrammar(text) {
        const response = await api.post('/api/grammar/check', { text });
        return response.data;
    }
};

// Intercept 401/403 responses
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            // Clear token and redirect to login
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 