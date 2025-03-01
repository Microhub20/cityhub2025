import axios from 'axios';

// API-Konfiguration
const API_BASE_URL = '/api/admin';
// In einer Produktionsumgebung sollte dieser Wert aus einer Umgebungsvariable kommen
const ADMIN_API_SECRET = 'admin-secret-123'; 

// Konfiguration für alle API-Anfragen
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-api-secret': ADMIN_API_SECRET
  }
});

// Typdefinitionen für unsere API-Struktur
interface AppContent {
  id?: number;
  title: string;
  description: string;
  iconName: string;
  color: string;
  route: string;
  order: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdById: number;
}

// Mock-Daten für die Entwicklung (wird verwendet, wenn API nicht verfügbar ist)
const MOCK_DATA: AppContent[] = [
  {
    id: 1,
    title: 'Stadtführer',
    description: 'Entdecken Sie die Stadt mit unserem digitalen Stadtführer',
    iconName: 'map',
    color: '#4CAF50',
    route: 'stadtfuehrer',
    order: 0,
    isActive: true,
    createdAt: new Date('2023-07-12'),
    updatedAt: new Date('2023-07-12'),
    createdById: 1
  },
  {
    id: 2,
    title: 'Event Kalender',
    description: 'Alle Veranstaltungen in der Stadt auf einen Blick',
    iconName: 'calendar',
    color: '#3F51B5',
    route: 'events',
    order: 1,
    isActive: true,
    createdAt: new Date('2023-06-28'),
    updatedAt: new Date('2023-06-28'),
    createdById: 1
  },
  {
    id: 3,
    title: 'Stadtinformationen',
    description: 'Wichtige Informationen und Telefonnummern',
    iconName: 'info',
    color: '#FF9800',
    route: 'info',
    order: 2,
    isActive: true,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2023-06-15'),
    createdById: 1
  },
  {
    id: 4,
    title: 'Parken',
    description: 'Finden Sie freie Parkplätze in der Stadt',
    iconName: 'map',
    color: '#2196F3',
    route: 'parken',
    order: 3,
    isActive: true,
    createdAt: new Date('2023-05-20'),
    updatedAt: new Date('2023-05-20'),
    createdById: 1
  }
];

// Hilfsfunktion für Mock-API-Antworten
const useMockData = true; // Auf false setzen, um echte API-Anfragen zu verwenden

// Admin API Service
export const adminService = {
  // Alle Inhalte abrufen
  getContents: async (): Promise<AppContent[]> => {
    try {
      if (useMockData) {
        // Simuliert eine Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_DATA;
      }

      const response = await apiClient.get('/contents');
      return response.data;
    } catch (error) {
      console.error('Fehler beim Abrufen der Inhalte:', error);
      throw error;
    }
  },

  // Neuen Inhalt erstellen
  createContent: async (content: AppContent): Promise<AppContent> => {
    try {
      if (useMockData) {
        // Simuliert eine Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 500));
        const newContent = { 
          ...content,
          id: Math.max(...MOCK_DATA.map(item => item.id)) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        MOCK_DATA.push(newContent);
        return newContent;
      }

      const response = await apiClient.post('/contents', content);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Erstellen des Inhalts:', error);
      throw error;
    }
  },

  // Bestehenden Inhalt aktualisieren
  updateContent: async (id: string, content: AppContent): Promise<AppContent> => {
    try {
      if (useMockData) {
        // Simuliert eine Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = MOCK_DATA.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
          MOCK_DATA[index] = { 
            ...content, 
            id: parseInt(id),
            updatedAt: new Date() 
          };
          return MOCK_DATA[index];
        }
        throw new Error('Inhalt nicht gefunden');
      }

      const response = await apiClient.put(`/contents/${id}`, content);
      return response.data;
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Inhalts:', error);
      throw error;
    }
  },

  // Inhalt löschen
  deleteContent: async (id: string): Promise<void> => {
    try {
      if (useMockData) {
        // Simuliert eine Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = MOCK_DATA.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
          MOCK_DATA.splice(index, 1);
          return;
        }
        throw new Error('Inhalt nicht gefunden');
      }

      await apiClient.delete(`/contents/${id}`);
    } catch (error) {
      console.error('Fehler beim Löschen des Inhalts:', error);
      throw error;
    }
  }
};