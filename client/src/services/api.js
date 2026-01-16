import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ==================== AUTH ====================
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
};

// ==================== KNOWLEDGE ====================
export const knowledgeAPI = {
    getAll: (params = {}) => api.get('/knowledge', { params }),
    getById: (id) => api.get(`/knowledge/${id}`),
    create: (data, config = {}) => api.post('/knowledge', data, config),
    update: (id, data, config = {}) => api.put(`/knowledge/${id}`, data, config),
    delete: (id) => api.delete(`/knowledge/${id}`),
    review: (id, data) => api.put(`/knowledge/${id}/approve`, data),
    archive: (id) => api.put(`/knowledge/${id}/archive`),
    manageQuality: (id, data) => api.put(`/knowledge/${id}/quality`, data),
    search: (query, filters = {}) => api.get('/knowledge', { params: { search: query, ...filters } }),
};

// ==================== VALIDATIONS ====================
export const validationAPI = {
    getAll: (params = {}) => api.get('/validations', { params }),
    getMyValidations: () => api.get('/validations', { params: { assignedToMe: 'true' } }),
    create: (data) => api.post('/validations', data),
    update: (id, data) => api.put(`/validations/${id}`, data),
    reassign: (id, newReviewerId) => api.put(`/validations/${id}/reassign`, { newReviewerId }),
};

// ==================== LEADERBOARD ====================
export const leaderboardAPI = {
    getLeaderboard: (params = {}) => api.get('/leaderboard', { params }),
    getMyStats: () => api.get('/leaderboard/me'),
    getTopByCategory: (category) => api.get(`/leaderboard/top/${category}`),
};

// ==================== DASHBOARD ====================
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getRoleData: (role) => api.get(`/dashboard/${role.toLowerCase()}`),
};

// ==================== ADMIN ====================
export const adminAPI = {
    getAuditLogs: (params = {}) => api.get('/admin/audit-logs', { params }),
    getSystemStats: () => api.get('/admin/stats'),
    getUsers: (params = {}) => api.get('/admin/users', { params }),
    createUser: (userData) => api.post('/admin/users', userData),
    deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
    updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
    updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
    getMigrations: (params = {}) => api.get('/admin/migrations', { params }),
    getConfigurations: (category) => api.get('/admin/config', { params: { category } }),
    updateConfiguration: (key, value) => api.put(`/admin/config/${key}`, { value }),
};

// ==================== RECOMMENDATIONS ====================
export const recommendationAPI = {
    getRecommendations: (params = {}) => api.get('/recommendations', { params }),
    recordInteraction: (data) => api.post('/recommendations/interaction', data),
    getTrending: (params = {}) => api.get('/recommendations/trending', { params }),
};

// ==================== AUDIT ====================
export const auditAPI = {
    getContentLogs: (params = {}) => api.get('/audit/content', { params }),
    getItemTrail: (id) => api.get(`/audit/content/${id}`),
    getSummary: (params = {}) => api.get('/audit/summary', { params }),
    createEntry: (data) => api.post('/audit', data),
};

// ==================== MIGRATION ====================
export const migrationAPI = {
    getAll: (params = {}) => api.get('/migration', { params }),
    getById: (id) => api.get(`/migration/${id}`),
    create: (data) => api.post('/migration', data),
    start: (id) => api.post(`/migration/${id}/start`),
    cancel: (id) => api.post(`/migration/${id}/cancel`),
};

// ==================== CONFIG ====================
export const configAPI = {
    getAll: (params = {}) => api.get('/config', { params }),
    getByKey: (key) => api.get(`/config/${key}`),
    update: (key, data) => api.put(`/config/${key}`, data),
    delete: (key) => api.delete(`/config/${key}`),
    reset: () => api.post('/config/reset'),
};

// ==================== MENTORSHIP ====================
export const mentorshipAPI = {
    getAll: (params = {}) => api.get('/mentorship', { params }),
    getMentors: (params = {}) => api.get('/mentorship/mentors', { params }),
    create: (data) => api.post('/mentorship', data),
    update: (id, data) => api.put(`/mentorship/${id}`, data),
    addSession: (id, data) => api.post(`/mentorship/${id}/sessions`, data),
    addFeedback: (id, data) => api.post(`/mentorship/${id}/feedback`, data),
};

// ==================== TRAINING ====================
export const trainingAPI = {
    getAll: () => api.get('/training'),
    enroll: (id) => api.post(`/training/${id}/enroll`),
    updateProgress: (id, data) => api.put(`/training/${id}/progress`, data),
    getSessions: (params) => api.get('/training/sessions', { params }),
    createSession: (data) => api.post('/training/sessions', data),
    registerForSession: (id) => api.post(`/training/sessions/${id}/register`),
    markAttendance: (id, userId, status) => api.put(`/training/sessions/${id}/attendance`, { userId, status })
};

export const managerAPI = {
    evaluateUser: (userId, data) => api.put(`/manager/users/${userId}/evaluate`, data)
};

export default api;
