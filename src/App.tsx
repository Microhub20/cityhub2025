
import React, { useState, useEffect } from 'react';
import './App.css';
import { adminService } from './api/adminService';
import { Check, ChevronDown, Edit, FileEdit, Grid, Home, LogOut, Plus, Settings, Trash, User, X } from 'lucide-react';

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

// Sidebar-Komponente
const Sidebar = ({ activeView, setActiveView }) => {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>CityHub</h2>
      </div>
      <nav>
        <ul>
          <li className={activeView === 'dashboard' ? 'active' : ''}>
            <a href="#dashboard" onClick={() => setActiveView('dashboard')}>
              <Home className="icon" size={18} />
              Dashboard
            </a>
          </li>
          <li className={activeView === 'apps' ? 'active' : ''}>
            <a href="#apps" onClick={() => setActiveView('apps')}>
              <Grid className="icon" size={18} />
              Apps verwalten
            </a>
          </li>
          <li className={activeView === 'maengel' ? 'active' : ''}>
            <a href="#maengel" onClick={() => setActiveView('maengel')}>
              <FileEdit className="icon" size={18} />
              Mängelmeldungen
            </a>
          </li>
          <li className={activeView === 'users' ? 'active' : ''}>
            <a href="#users" onClick={() => setActiveView('users')}>
              <User className="icon" size={18} />
              Benutzer
            </a>
          </li>
          <li className={activeView === 'settings' ? 'active' : ''}>
            <a href="#settings" onClick={() => setActiveView('settings')}>
              <Settings className="icon" size={18} />
              Einstellungen
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// Header-Komponente
const Header = () => {
  return (
    <header className="header">
      <div className="city-name">
        <h3>Tuttlingen</h3>
      </div>
      <div className="user-menu">
        <span>Admin</span>
        <button className="user-btn">
          <User size={16} />
        </button>
        <button className="logout-btn">
          <LogOut size={16} />
          Abmelden
        </button>
      </div>
    </header>
  );
};

// Dashboard-Inhalt
const DashboardContent = () => {
  return (
    <div className="dashboard-content">
      <h1>Dashboard</h1>
      <p className="welcome-message">Willkommen zurück, Admin!</p>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Aktive Apps</h3>
          <p className="stat-number">8</p>
        </div>
        <div className="stat-card">
          <h3>Aktive Benutzer</h3>
          <p className="stat-number">845</p>
        </div>
        <div className="stat-card">
          <h3>Neue Registrierungen</h3>
          <p className="stat-number">23</p>
        </div>
        <div className="stat-card">
          <h3>Server Status</h3>
          <p className="stat-number">Online</p>
        </div>
      </div>
      
      <h2>Neueste Aktivitäten</h2>
      <div className="activity-list">
        <div className="activity-item">
          <div className="activity-icon">
            <FileEdit size={20} />
          </div>
          <div className="activity-details">
            <h4>App "Stadtführer" aktualisiert</h4>
            <p>Vor 2 Stunden · Admin</p>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon">
            <Plus size={20} />
          </div>
          <div className="activity-details">
            <h4>Neue App "Event Kalender" erstellt</h4>
            <p>Vor 1 Tag · Admin</p>
          </div>
        </div>
        <div className="activity-item">
          <div className="activity-icon">
            <User size={20} />
          </div>
          <div className="activity-details">
            <h4>5 neue Benutzer registriert</h4>
            <p>Vor 2 Tagen</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// App-Verwaltungskomponente
const AppsManagementContent = () => {
  const [appContents, setAppContents] = useState<AppContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingApp, setEditingApp] = useState<AppContent | null>(null);
  const [formData, setFormData] = useState<AppContent>({
    title: '',
    description: '',
    iconName: 'map',
    color: '#4CAF50',
    route: '',
    order: 0,
    isActive: true,
    createdById: 1
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Apps beim ersten Laden holen
  useEffect(() => {
    fetchApps();
  }, []);

  // Apps von der API holen
  const fetchApps = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminService.getContents();
      setAppContents(response);
    } catch (err) {
      console.error('Fehler beim Laden der Apps:', err);
      setError('Fehler beim Laden der Apps. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // App erstellen
  const createApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      if (editingApp && editingApp.id) {
        await adminService.updateContent(editingApp.id.toString(), formData);
      } else {
        await adminService.createContent(formData);
      }
      
      await fetchApps();
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Fehler beim Speichern der App:', err);
      setError('Fehler beim Speichern. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // App löschen
  const deleteApp = async (id: number) => {
    if (window.confirm('Möchten Sie diese App wirklich löschen?')) {
      try {
        setIsLoading(true);
        setError(null);
        
        await adminService.deleteContent(id.toString());
        await fetchApps();
      } catch (err) {
        console.error('Fehler beim Löschen der App:', err);
        setError('Fehler beim Löschen. Bitte versuchen Sie es später erneut.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Modal zum Bearbeiten/Erstellen öffnen
  const openEditModal = (app: AppContent | null) => {
    if (app) {
      setEditingApp(app);
      setFormData({...app});
    } else {
      setEditingApp(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      iconName: 'map',
      color: '#4CAF50',
      route: '',
      order: appContents.length,
      isActive: true,
      createdById: 1
    });
  };

  // Input-Änderung verarbeiten
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <div className="apps-content">
      <div className="apps-header">
        <h1>Apps verwalten</h1>
        <button className="add-btn" onClick={() => openEditModal(null)}>
          <Plus size={16} />
          Neue App
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Schließen</button>
        </div>
      )}

      {isLoading && <div className="loading">Daten werden geladen...</div>}

      <div className="apps-grid">
        {appContents.map((app) => (
          <div key={app.id} className="app-card" style={{ borderTop: `3px solid ${app.color}` }}>
            <div className="app-header">
              <h3>{app.title}</h3>
              <div className="app-badge" style={{ background: app.isActive ? '#4CAF50' : '#757575' }}>
                {app.isActive ? 'Aktiv' : 'Inaktiv'}
              </div>
            </div>
            <p className="app-description">{app.description}</p>
            <div className="app-details">
              <span className="app-route">/{app.route}</span>
              <span className="app-order">Reihenfolge: {app.order}</span>
            </div>
            <div className="app-actions">
              <button className="edit-btn" onClick={() => openEditModal(app)}>
                <Edit size={16} />
                Bearbeiten
              </button>
              <button className="delete-btn" onClick={() => deleteApp(app.id)}>
                <Trash size={16} />
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingApp ? 'App bearbeiten' : 'Neue App erstellen'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createApp}>
              <div className="form-group">
                <label htmlFor="title">Titel</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Beschreibung</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="iconName">Icon</label>
                  <select 
                    id="iconName" 
                    name="iconName" 
                    value={formData.iconName}
                    onChange={handleInputChange}
                  >
                    <option value="map">Karte</option>
                    <option value="calendar">Kalender</option>
                    <option value="info">Info</option>
                    <option value="settings">Einstellungen</option>
                    <option value="user">Benutzer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="color">Farbe</label>
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="route">Route</label>
                  <input
                    type="text"
                    id="route"
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="order">Reihenfolge</label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive">Aktiv</label>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  Abbrechen
                </button>
                <button type="submit" className="save-btn" disabled={isLoading}>
                  {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Mängelmeldung-Komponente
const MaengelContent = () => {
  const [maengelList, setMaengelList] = useState([
    {
      id: 1,
      title: 'Straßenbeleuchtung defekt',
      image: 'https://images.unsplash.com/photo-1573511860302-28c11ff2c879?q=80&w=200',
      status: 'offen',
      createdAt: new Date('2023-06-15')
    },
    {
      id: 2,
      title: 'Gullideckel verschmutzt',
      image: 'https://images.unsplash.com/photo-1592965025398-f51b88f696fb?q=80&w=200',
      status: 'in Bearbeitung',
      createdAt: new Date('2023-06-18')
    },
    {
      id: 3,
      title: 'Regenschutz an der Bushaltestelle beschädigt',
      image: 'https://images.unsplash.com/photo-1594284937520-e27ea0a16fb9?q=80&w=200',
      status: 'erledigt',
      createdAt: new Date('2023-06-20')
    },
    {
      id: 4,
      title: 'Zufahrt Sportplatz, Anwohner-Schutz',
      image: 'https://images.unsplash.com/photo-1484506176121-c919d361c432?q=80&w=200',
      status: 'offen',
      createdAt: new Date('2023-06-22')
    }
  ]);

  return (
    <div className="maengel-content">
      <h1>Mängelmeldungen</h1>
      
      <div className="maengel-table">
        <div className="maengel-header">
          <div className="column-bild">Bild</div>
          <div className="column-titel">Titel</div>
          <div className="column-status">Status</div>
          <div className="column-aktionen">Aktionen</div>
        </div>
        
        {maengelList.map(maengel => (
          <div key={maengel.id} className="maengel-row">
            <div className="column-bild">
              <img src={maengel.image} alt={maengel.title} className="maengel-image" />
            </div>
            <div className="column-titel">{maengel.title}</div>
            <div className="column-status">
              <span className={`status-badge status-${maengel.status.replace(' ', '-')}`}>
                {maengel.status === 'offen' && <Check size={14} />}
                {maengel.status}
              </span>
            </div>
            <div className="column-aktionen">
              <button className="action-btn edit">
                <Edit size={16} />
              </button>
              <button className="action-btn delete">
                <Trash size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Benutzer-Verwaltungskomponente (Platzhalter)
const UsersManagementContent = () => {
  return (
    <div className="users-content">
      <h1>Benutzer verwalten</h1>
      <p>Diese Funktion wird in einer zukünftigen Version implementiert.</p>
    </div>
  );
};

// Einstellungen-Komponente (Platzhalter)
const SettingsContent = () => {
  return (
    <div className="settings-content">
      <h1>Einstellungen</h1>
      <p>Diese Funktion wird in einer zukünftigen Version implementiert.</p>
    </div>
  );
};

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  // Funktion zum Anzeigen der entsprechenden Ansicht
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardContent />;
      case 'apps':
        return <AppsManagementContent />;
      case 'maengel':
        return <MaengelContent />;
      case 'users':
        return <UsersManagementContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="main-content">
        <Header />
        {renderContent()}
      </div>
    </div>
  );
}
