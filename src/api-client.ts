
import axios from 'axios';

// API-Basisadresse - dynamische Ermittlung basierend auf aktueller URL
const isDevelopment = import.meta.env.DEV;
// In der Entwicklung nutze den dev-Server, sonst relative Pfade für Deployments
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001/api'  // Entwicklungsserver auf Port 3001
  : '/api';                     // Im Deployment: relativer Pfad

// Hilfsfunktion, um korrekte URLs zu erstellen
const formatApiUrl = (endpoint) => {
  // Entferne führenden Schrägstrich aus dem Endpunkt, falls vorhanden
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

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
  getAll: () => apiClient.get(formatApiUrl('content')),
  getById: (id) => apiClient.get(formatApiUrl(`content/${id}`)),
  create: (data) => apiClient.post(formatApiUrl('content'), data),
  update: (id, data) => apiClient.put(formatApiUrl(`content/${id}`), data),
  delete: (id) => apiClient.delete(formatApiUrl(`content/${id}`))
};

export const maengelApi = {
  getAll: () => apiClient.get(formatApiUrl('maengel')),
  getById: (id) => apiClient.get(formatApiUrl(`maengel/${id}`)),
  create: (data) => apiClient.post(formatApiUrl('maengel'), data),
  update: (id, data) => apiClient.put(formatApiUrl(`maengel/${id}`), data),
  delete: (id) => apiClient.delete(formatApiUrl(`maengel/${id}`))
};

export const authApi = {
  verifyApiKey: (apiKey) => apiClient.post(formatApiUrl('auth/verify'), { apiKey }),
  getSyncToken: (apiKey) => apiClient.post(formatApiUrl('auth/sync-token'), { apiKey })
};

export default apiClient;
