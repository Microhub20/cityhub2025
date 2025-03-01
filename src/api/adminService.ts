
// API-Service für die Admin-Funktionalität
interface Content {
  id?: string;
  type: string;
  title: string;
  category_id?: string;
  image?: string;
  position?: number;
}

interface Row {
  id?: string;
  type: string;
  columns: Content[];
  position?: number;
}

// Diese Variable sollte aus einer .env-Datei oder einer sicheren Quelle kommen
const ADMIN_API_SECRET = 'your-api-secret-here';

export const adminService = {
  // Inhalte (Zeilen) abrufen
  getContents: async (): Promise<Row[]> => {
    try {
      const response = await fetch('/api/admin/contents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-secret': ADMIN_API_SECRET
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Abrufen der Inhalte:', error);
      throw error;
    }
  },
  
  // Neuen Inhalt (Zeile) erstellen
  createContent: async (content: Row): Promise<Row> => {
    try {
      const response = await fetch('/api/admin/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-secret': ADMIN_API_SECRET
        },
        body: JSON.stringify(content)
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Erstellen des Inhalts:', error);
      throw error;
    }
  },
  
  // Inhalt (Zeile) aktualisieren
  updateContent: async (id: string, content: Row): Promise<Row> => {
    try {
      const response = await fetch(`/api/admin/contents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-secret': ADMIN_API_SECRET
        },
        body: JSON.stringify(content)
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Inhalts:', error);
      throw error;
    }
  },
  
  // Inhalt (Zeile) löschen
  deleteContent: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/contents/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-secret': ADMIN_API_SECRET
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Inhalts:', error);
      throw error;
    }
  }
};
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
interface Column {
  id?: string;
  type: string;
  title: string;
  category_id?: string;
  image?: string;
}

interface Content {
  id?: string;
  type: string;
  columns: Column[];
  position?: number;
}

// Mock-Daten für die Entwicklung (wird verwendet, wenn API nicht verfügbar ist)
const MOCK_DATA: Content[] = [
  {
    id: '1',
    type: 'Doppelzeile',
    position: 0,
    columns: [
      {
        id: '1',
        type: 'Auftritt-Kategorie',
        title: 'Veranstaltungen',
        category_id: '147',
        image: ''
      },
      {
        id: '2',
        type: 'Auftritt-Kategorie',
        title: 'Stadtführungen',
        category_id: '148',
        image: ''
      }
    ]
  },
  {
    id: '2',
    type: 'Einzelzeile',
    position: 1,
    columns: [
      {
        id: '3',
        type: 'Auftritt-Kategorie',
        title: 'Sehenswürdigkeiten',
        category_id: '149',
        image: ''
      }
    ]
  }
];

// Hilfsfunktion für Mock-API-Antworten
const useMockData = true; // Auf false setzen, um echte API-Anfragen zu verwenden

// Admin API Service
export const adminService = {
  // Alle Inhalte abrufen
  getContents: async (): Promise<Content[]> => {
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
  createContent: async (content: Content): Promise<Content> => {
    try {
      if (useMockData) {
        // Simuliert eine Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 500));
        const newContent = { ...content, id: Date.now().toString() };
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
  updateContent: async (id: string, content: Content): Promise<Content> => {
    try {
      if (useMockData) {
        // Simuliert eine Netzwerkverzögerung
        await new Promise(resolve => setTimeout(resolve, 500));
        const index = MOCK_DATA.findIndex(item => item.id === id);
        if (index !== -1) {
          MOCK_DATA[index] = { ...content, id };
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
        const index = MOCK_DATA.findIndex(item => item.id === id);
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
