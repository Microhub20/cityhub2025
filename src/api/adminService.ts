
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
