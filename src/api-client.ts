
import axios from 'axios';

// API-Basisadresse
const API_BASE_URL = window.location.origin + '/api'; // Verwendet die aktuelle Domain

// API-Client erstellen
const createApiClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request-Interceptor für Authentication-Headers
  client.interceptors.request.use(config => {
    const apiKey = localStorage.getItem('cityhubApiKey');
    const syncToken = localStorage.getItem('cityhubSyncToken');

    if (apiKey) {
      config.headers['X-API-Key'] = apiKey;
    }

    if (syncToken) {
      config.headers['X-Sync-Token'] = syncToken;
    }

    return config;
  });

  return client;
};

const apiClient = createApiClient();

// API-Methoden
export const contentApi = {
  getAll: () => apiClient.get('/content'),
  getById: (id) => apiClient.get(`/content/${id}`),
  create: (data) => apiClient.post('/content', data),
  update: (id, data) => apiClient.put(`/content/${id}`, data),
  delete: (id) => apiClient.delete(`/content/${id}`)
};

export const maengelApi = {
  getAll: () => apiClient.get('/maengel'),
  getById: (id) => apiClient.get(`/maengel/${id}`),
  create: (data) => apiClient.post('/maengel', data),
  update: (id, data) => apiClient.put(`/maengel/${id}`, data),
  delete: (id) => apiClient.delete(`/maengel/${id}`)
};

export const authApi = {
  verifyApiKey: (apiKey) => apiClient.post('/auth/verify', { apiKey }),
  getSyncToken: (apiKey) => apiClient.post('/auth/sync-token', { apiKey })
};

export default apiClient;
