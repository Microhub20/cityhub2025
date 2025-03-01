import { useState, useEffect, useRef } from 'react';
import './App.css';
import { adminService } from './api/adminService';
import { Check, ChevronDown, Edit, FileEdit, Grid, Home, LogOut, Plus, Settings, Trash, User, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';

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
  const [editingMaengel, setEditingMaengel] = useState(null);
  const [maengelFormData, setMaengelFormData] = useState({
    id: null,
    title: '',
    image: '',
    status: 'aktiv',
    location: '',
    description: '',
    response: '',
    reporterName: '',
    reporterEmail: '',
    category: 'Schadensmeldungen',
    subCategory: 'Straßenschäden',
    createdAt: new Date()
  });
  const [mapTab, setMapTab] = useState('karte');

  // Handler für das Öffnen des Bearbeitungsmodals
  const openEditModal = (maengel) => {
    setEditingMaengel(maengel);
    setMaengelFormData({
      ...maengel
    });
  };

  // Handler für Änderungen an Formularfeldern
  const handleMaengelFormChange = (e) => {
    const { name, value } = e.target;
    setMaengelFormData({
      ...maengelFormData,
      [name]: value
    });
  };

  // Handler für das Speichern der Änderungen
  const handleMaengelSave = (e) => {
    e.preventDefault();

    // Aktualisierte Liste erstellen
    const updatedList = maengelList.map(maengel => 
      maengel.id === maengelFormData.id ? maengelFormData : maengel
    );

    setMaengelList(updatedList);
    setEditingMaengel(null);
  };

  // PDF Export-Funktion
  const exportPDF = (maengel) => {
    // PDF-Dokument erstellen
    const doc = new jsPDF();

    // Titel hinzufügen
    doc.setFontSize(18);
    doc.text('Mängelmeldung - ' + maengel.title, 14, 22);

    // Statusbalken
    doc.setFillColor(maengel.status === 'aktiv' ? 76 : 120, maengel.status === 'aktiv' ? 175 : 120, maengel.status === 'aktiv' ? 80 : 120);
    doc.rect(14, 28, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('Status: ' + (maengel.status === 'aktiv' ? 'Aktiv' : 'Inaktiv'), 18, 34);

    // Zurück zur schwarzen Textfarbe
    doc.setTextColor(0, 0, 0);

    // Bild laden und einfügen (wenn vorhanden)
    if (maengel.image) {
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = maengel.image;
        doc.addImage(img, 'JPEG', 14, 45, 80, 60);
      } catch (error) {
        console.error('Fehler beim Laden des Bildes:', error);
      }
    }

    // Informationsabschnitt
    doc.setFontSize(14);
    doc.text('Informationen', 14, 120);

    doc.setFontSize(11);
    doc.text('Standort: ' + (maengel.location || 'Nicht angegeben'), 14, 130);
    doc.text('Kategorie: ' + (maengel.category || 'Nicht kategorisiert'), 14, 140);
    doc.text('Unterkategorie: ' + (maengel.subCategory || 'Keine'), 14, 150);
    doc.text('Gemeldet von: ' + (maengel.reporterName || 'Anonym'), 14, 160);
    doc.text('Kontakt: ' + (maengel.reporterEmail || 'Keine E-Mail angegeben'), 14, 170);

    // Datum formatieren
    const createdDate = maengel.createdAt instanceof Date 
      ? maengel.createdAt.toLocaleDateString('de-DE') 
      : new Date(maengel.createdAt).toLocaleDateString('de-DE');

    doc.text('Meldedatum: ' + createdDate, 14, 180);

    // Beschreibung
    doc.setFontSize(14);
    doc.text('Beschreibung', 14, 200);

    // Text umbrechen
    const splitDescription = doc.splitTextToSize(maengel.description || 'Keine Beschreibung vorhanden', 180);
    doc.setFontSize(11);
    doc.text(splitDescription, 14, 210);

    // Zweite Seite, wenn eine Rückmeldung existiert
    if (maengel.response) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text('Rückmeldung', 14, 20);

      const splitResponse = doc.splitTextToSize(maengel.response, 180);
      doc.setFontSize(11);
      doc.text(splitResponse, 14, 30);
    }

    // PDF speichern
    doc.save('Maengelmeldung-' + maengel.id + '.pdf');
  };

  const [maengelList, setMaengelList] = useState([
    {
      id: 1,
      title: 'Prelitz - Straßenbeleuchtung defekt',
      image: 'https://images.unsplash.com/photo-1573511860302-28c11ff2c879?q=80&w=200',
      status: 'aktiv',
      location: 'Prelitz',
      description: 'Die Straßenbeleuchtung in Prelitz ist seit mehreren Tagen ausgefallen. Mehrere Laternen in der Hauptstraße funktionieren nicht mehr.',
      createdAt: new Date('2023-06-15')
    },
    {
      id: 2,
      title: 'Gulli verschmiert',
      image: 'https://images.unsplash.com/photo-1592965025398-f51b88f696fb?q=80&w=200',
      status: 'aktiv',
      location: '95359 Kasendorf Simonweg kurz vor dem Festplatz',
      description: 'Der Gulli funktioniert nicht mehr, weil anscheinend Farbeimer und Baumaterialien darin geleert wurden.',
      reporterName: 'Max Mustermann',
      reporterEmail: 'max@example.com',
      category: 'Schadensmeldungen',
      subCategory: 'Straßenschäden',
      createdAt: new Date('2023-06-18')
    },
    {
      id: 3,
      title: 'Regenschutz an der Bushaltestelle Bahnhof / alt',
      image: 'https://images.unsplash.com/photo-1594284937520-e27ea0a16fb9?q=80&w=200',
      status: 'aktiv',
      location: 'Bahnhof',
      createdAt: new Date('2023-06-20')
    },
    {
      id: 4,
      title: 'Zufahrt Sportplatz, Anwohner Schutz',
      image: 'https://images.unsplash.com/photo-1484506176121-c919d361c432?q=80&w=200',
      status: 'aktiv',
      location: 'Sportplatz',
      createdAt: new Date('2023-06-22')
    }
  ]);

  return (
    <div className="maengel-content">
      <div className="maengel-header">
        <h1>Mängelmeldungen</h1>
      </div>

      <div className="maengel-table">
        <div className="maengel-table-header">
          <div className="column-bild">Bild</div>
          <div className="column-titel">Titel</div>
          <div className="column-aktiv">Aktiv</div>
          <div className="column-aktionen">Aktionen</div>
        </div>

        {maengelList.map(maengel => (
          <div key={maengel.id} className="maengel-row">
            <div className="column-bild">
              <img src={maengel.image} alt={maengel.title} className="maengel-image" />
            </div>
            <div className="column-titel">{maengel.title}</div>
            <div className="column-aktiv">
              {maengel.status === 'aktiv' && (
                <div className="status-check">
                  <Check size={18} color="#4CAF50" />
                </div>
              )}
            </div>
            <div className="column-aktionen">
              <button className="action-btn edit" title="Bearbeiten" onClick={() => openEditModal(maengel)}>
                <Edit size={18} />
              </button>
              <button className="action-btn pdf" title="Als PDF exportieren" onClick={() => exportPDF(maengel)}>
                <FileEdit size={18} />
              </button>
              <button className="action-btn delete" title="Löschen">
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingMaengel && (
        <div className="modal-overlay">
          <div className="modal maengel-modal">
            <div className="modal-header">
              <h2>Ticket Bearbeiten</h2>
              <button className="close-btn" onClick={() => setEditingMaengel(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleMaengelSave}>
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={maengelFormData.status === 'aktiv'}
                  onChange={(e) => setMaengelFormData({
                    ...maengelFormData,
                    status: e.target.checked ? 'aktiv' : 'inaktiv'
                  })}
                />
                <label htmlFor="isActive">Mängelmeldung aktiv</label>
              </div>

              <div className="form-group">
                <label htmlFor="title">Titel</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={maengelFormData.title}
                  onChange={handleMaengelFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <div className="image-preview">
                  <img src={maengelFormData.image} alt={maengelFormData.title} />
                </div>
                <div className="image-upload">
                  <button type="button" className="upload-btn">
                    Bild ersetzen
                  </button>
                  <span className="upload-info">Keine ausgewählt</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Beschreibung</label>
                <textarea
                  id="description"
                  name="description"
                  value={maengelFormData.description || ''}
                  onChange={handleMaengelFormChange}
                  rows={5}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="response">Rückmeldung</label>
                <textarea
                  id="response"
                  name="response"
                  value={maengelFormData.response || ''}
                  onChange={handleMaengelFormChange}
                  rows={3}
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="location">Standort</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={maengelFormData.location || ''}
                  onChange={handleMaengelFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reporterName">Name des Melders</label>
                <input
                  type="text"
                  id="reporterName"
                  name="reporterName"
                  value={maengelFormData.reporterName || ''}
                  onChange={handleMaengelFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reporterEmail">E-Mail des Melders</label>
                <input
                  type="email"
                  id="reporterEmail"
                  name="reporterEmail"
                  value={maengelFormData.reporterEmail || ''}
                  onChange={handleMaengelFormChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Kategorie</label>
                  <select
                    id="category"
                    name="category"
                    value={maengelFormData.category || 'Schadensmeldungen'}
                    onChange={handleMaengelFormChange}
                  >
                    <option value="Schadensmeldungen">Schadensmeldungen</option>
                    <option value="Reinigung">Reinigung</option>
                    <option value="Beleuchtung">Beleuchtung</option>
                    <option value="Sonstiges">Sonstiges</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subCategory">Sub-Kategorie</label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={maengelFormData.subCategory || 'Straßenschäden'}
                    onChange={handleMaengelFormChange}
                  >
                    <option value="Straßenschäden">Straßenschäden</option>
                    <option value="Gehwegschäden">Gehwegschäden</option>
                    <option value="Schilder">Schilder</option>
                    <option value="Sonstiges">Sonstiges</option>
                  </select>
                </div>
              </div>

              <div className="map-container">
                <div className="map-tabs">
                  <button type="button" className={`map-tab ${mapTab === 'karte' ? 'active' : ''}`} onClick={() => setMapTab('karte')}>Karte</button>
                  <button type="button" className={`map-tab ${mapTab === 'satellit' ? 'active' : ''}`} onClick={() => setMapTab('satellit')}>Satellit</button>
                </div>
                <div className="map-placeholder">
                  <div className="map-image">
                    {/* Karte würde hier eingebunden werden */}
                    <img src="https://maps.googleapis.com/maps/api/staticmap?center=Kasendorf&zoom=14&size=600x300&key=YOUR_API_KEY" alt="Kartenansicht" />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingMaengel(null)}>
                  Abbrechen
                </button>
                <button type="button" className="reset-btn">
                  Zurücksetzen
                </button>
                <button type="submit" className="save-btn">
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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