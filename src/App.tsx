import { useState, useEffect, useRef } from 'react';
import './App.css';
import { adminService } from './api/adminService';
import { Check, ChevronDown, Edit, FileEdit, Grid, Home, LogOut, Plus, Settings, Trash, User, X } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
          <li className={activeView === 'menu' ? 'active' : ''}>
            <a href="#menu" onClick={() => setActiveView('menu')}>
              <FileEdit className="icon" size={18} />
              Auftritte
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
    
    // Karte nach dem Öffnen des Modals initialisieren
    setTimeout(() => {
      if (document.getElementById('maengel-map')) {
        const mapElement = document.getElementById('maengel-map');
        if (mapElement._leaflet_id) {
          // Karte existiert bereits, entfernen
          mapElement._leaflet = null;
        }
        
        // Karte initialisieren (Kasendorf als Standardpunkt)
        const map = L.map('maengel-map').setView([50.0771, 11.3673], 13);
        
        // Kartenlayer hinzufügen
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        // Marker platzieren, wenn die Position vorhanden ist
        if (maengel.location) {
          // Hier würde normaleweise ein Geocoding stattfinden
          // Für die Demo verwenden wir einen festen Punkt
          const marker = L.marker([50.0771, 11.3673]).addTo(map);
          marker.bindPopup(maengel.location).openPopup();
        }
        
        // Karte nach 100ms aktualisieren, um Rendering-Probleme zu vermeiden
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    }, 500);
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
                  <div id="maengel-map" className="leaflet-container"></div>
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

// Menü-Editor-Komponente
const MenuEditorContent = () => {
  const [menuItems, setMenuItems] = useState([
    { id: 259, title: 'Nachrichten', type: 'menu', isExpanded: false, order: 1 },
    { id: 260, title: 'Müllkalender', type: 'menu', isExpanded: true, order: 2 },
    { id: 264, title: 'Restmüll-Abfuhr', type: 'submenu', parentId: 260, order: 1 },
    { id: 265, title: 'Papier', type: 'submenu', parentId: null, isExpanded: false, order: 3 },
    { id: 266, title: 'Gelber Sack', type: 'submenu', parentId: null, isExpanded: false, order: 4 },
    { id: 267, title: 'Abfuhrkalender / Abfall-App', type: 'submenu', parentId: null, isExpanded: false, order: 5 },
    { id: 261, title: 'Ansprechpartner & Öffnungszeiten', type: 'menu', isExpanded: false, order: 6 },
    { id: 275, title: 'Veranstaltungen', type: 'menu', isExpanded: false, order: 7 }
  ]);
  
  const [editingItem, setEditingItem] = useState(null);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    id: null,
    title: '',
    type: 'menu',
    parentId: null,
    order: 0,
    isExpanded: false
  });
  
  // Menüeintrag verwalten
  const handleAddItem = (type, parentId = null) => {
    const newId = Math.max(...menuItems.map(item => item.id)) + 1;
    const newOrder = menuItems.length + 1;
    
    const newItem = {
      id: newId,
      title: type === 'menu' ? 'Neuer Eintrag' : 'Neue Unterkategorie',
      type,
      parentId,
      order: newOrder,
      isExpanded: false
    };
    
    setMenuItems([...menuItems, newItem]);
    setEditingItem(newItem);
    setMenuFormData({...newItem});
  };
  
  // Menüeintrag bearbeiten
  const handleEditItem = (item) => {
    setEditingItem(item);
    setMenuFormData({...item});
  };
  
  // Öffne Artikel-Editor für ein bestimmtes Element
  const openArticleEditor = (itemId) => {
    setSelectedArticleId(itemId);
  };
  
  // Menüeintrag entfernen
  const handleDeleteItem = (itemId) => {
    if (window.confirm('Möchten Sie diesen Menüeintrag wirklich löschen?')) {
      // Alle abhängigen Untermenüs auch entfernen
      const updatedItems = menuItems.filter(item => 
        item.id !== itemId && item.parentId !== itemId
      );
      setMenuItems(updatedItems);
    }
  };
  
  // Menüeintrag speichern
  const handleSaveItem = (e) => {
    e.preventDefault();
    
    const updatedItems = menuItems.map(item => 
      item.id === menuFormData.id ? {...menuFormData} : item
    );
    
    setMenuItems(updatedItems);
    setEditingItem(null);
  };
  
  // Ein-/Ausklappen eines Menüpunkts
  const toggleExpand = (itemId) => {
    setMenuItems(menuItems.map(item => 
      item.id === itemId ? {...item, isExpanded: !item.isExpanded} : item
    ));
  };
  
  // Nach oben verschieben
  const moveItemUp = (itemId) => {
    const itemIndex = menuItems.findIndex(item => item.id === itemId);
    if (itemIndex <= 0) return;
    
    const currentItem = menuItems[itemIndex];
    const prevItem = menuItems[itemIndex - 1];
    
    // Stelle sicher, dass wir nicht über Kategoriegrenzen verschieben
    if (currentItem.parentId !== prevItem.parentId && currentItem.type === 'submenu') return;
    
    // Tausche Order-Werte
    const updatedItems = menuItems.map(item => {
      if (item.id === currentItem.id) {
        return {...item, order: prevItem.order};
      }
      if (item.id === prevItem.id) {
        return {...item, order: currentItem.order};
      }
      return item;
    });
    
    setMenuItems(updatedItems.sort((a, b) => a.order - b.order));
  };
  
  // Nach unten verschieben
  const moveItemDown = (itemId) => {
    const itemIndex = menuItems.findIndex(item => item.id === itemId);
    if (itemIndex >= menuItems.length - 1) return;
    
    const currentItem = menuItems[itemIndex];
    const nextItem = menuItems[itemIndex + 1];
    
    // Stelle sicher, dass wir nicht über Kategoriegrenzen verschieben
    if (currentItem.parentId !== nextItem.parentId && currentItem.type === 'submenu') return;
    
    // Tausche Order-Werte
    const updatedItems = menuItems.map(item => {
      if (item.id === currentItem.id) {
        return {...item, order: nextItem.order};
      }
      if (item.id === nextItem.id) {
        return {...item, order: currentItem.order};
      }
      return item;
    });
    
    setMenuItems(updatedItems.sort((a, b) => a.order - b.order));
  };
  
  // Ändere Formularfelder
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setMenuFormData({
      ...menuFormData,
      [name]: value
    });
  };
  
  // Sortiere Menüeinträge für die Anzeige
  const sortedMenuItems = [...menuItems].sort((a, b) => a.order - b.order);
  
  // Wenn ein Artikel ausgewählt ist, zeige den Artikel-Editor an
  if (selectedArticleId) {
    const selectedItem = menuItems.find(item => item.id === selectedArticleId);
    return <ArticleEditorContent item={selectedItem} onClose={() => setSelectedArticleId(null)} />;
  }
  
  return (
    <div className="menu-editor-content">
      <div className="menu-editor-header">
        <h1>Auftritte verwalten</h1>
        <button className="add-btn" onClick={() => handleAddItem('menu')}>
          <Plus size={16} />
          Neuer Eintrag
        </button>
      </div>
      
      <div className="menu-list">
        <div className="menu-title">Auftritte</div>
        
        {sortedMenuItems.map((item) => {
          // Nur oberste Menüeinträge oder Untereinträge mit passendem parent anzeigen
          if (item.type === 'menu') {
            return (
              <div key={item.id} className="menu-item">
                <div className="menu-item-header">
                  {item.isExpanded ? (
                    <button className="toggle-btn" onClick={() => toggleExpand(item.id)}>
                      <ChevronDown size={16} />
                    </button>
                  ) : (
                    <button className="toggle-btn" onClick={() => toggleExpand(item.id)}>
                      <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                  )}
                  <span className="menu-item-title">{item.title}</span>
                  <div className="menu-item-id">{item.id}</div>
                  <div className="menu-item-actions">
                    <button className="action-btn edit" onClick={() => handleEditItem(item)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-btn edit" onClick={() => openArticleEditor(item.id)} title="Artikel bearbeiten">
                      <FileEdit size={16} />
                    </button>
                    <button className="action-btn up" onClick={() => moveItemUp(item.id)}>
                      <span>▲</span>
                    </button>
                    <button className="action-btn down" onClick={() => moveItemDown(item.id)}>
                      <span>▼</span>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteItem(item.id)}>
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Zeige Untermenüs an, wenn expandiert */}
                {item.isExpanded && (
                  <div className="submenu-container">
                    {sortedMenuItems
                      .filter(subItem => subItem.parentId === item.id)
                      .map(subItem => (
                        <div key={subItem.id} className="submenu-item">
                          <div className="menu-item-header">
                            <span className="submenu-dash">-</span>
                            <span className="menu-item-title">{subItem.title}</span>
                            <div className="menu-item-id">{subItem.id}</div>
                            <div className="menu-item-actions">
                              <button className="action-btn edit" onClick={() => handleEditItem(subItem)}>
                                <Edit size={16} />
                              </button>
                              <button className="action-btn edit" onClick={() => openArticleEditor(subItem.id)} title="Artikel bearbeiten">
                                <FileEdit size={16} />
                              </button>
                              <button className="action-btn up" onClick={() => moveItemUp(subItem.id)}>
                                <span>▲</span>
                              </button>
                              <button className="action-btn down" onClick={() => moveItemDown(subItem.id)}>
                                <span>▼</span>
                              </button>
                              <button className="action-btn delete" onClick={() => handleDeleteItem(subItem.id)}>
                                <Trash size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                    ))}
                    
                    {/* Button zum Hinzufügen einer Unterkategorie */}
                    <div className="add-submenu">
                      <button className="add-submenu-btn" onClick={() => handleAddItem('submenu', item.id)}>
                        <Plus size={14} />
                        Sub-Kategorie Hinzufügen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          } else if (item.type === 'submenu' && item.parentId === null) {
            // Eigenständige Untermenüeinträge ohne parent
            return (
              <div key={item.id} className="menu-item">
                <div className="menu-item-header">
                  {item.isExpanded ? (
                    <button className="toggle-btn" onClick={() => toggleExpand(item.id)}>
                      <ChevronDown size={16} />
                    </button>
                  ) : (
                    <button className="toggle-btn" onClick={() => toggleExpand(item.id)}>
                      <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
                    </button>
                  )}
                  <span className="menu-item-title">{item.title}</span>
                  <div className="menu-item-id">{item.id}</div>
                  <div className="menu-item-actions">
                    <button className="action-btn edit" onClick={() => handleEditItem(item)}>
                      <Edit size={16} />
                    </button>
                    <button className="action-btn edit" onClick={() => openArticleEditor(item.id)} title="Artikel bearbeiten">
                      <FileEdit size={16} />
                    </button>
                    <button className="action-btn up" onClick={() => moveItemUp(item.id)}>
                      <span>▲</span>
                    </button>
                    <button className="action-btn down" onClick={() => moveItemDown(item.id)}>
                      <span>▼</span>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteItem(item.id)}>
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Zeige "Kategorie hinzufügen" Button, wenn expandiert */}
                {item.isExpanded && (
                  <div className="submenu-container">
                    <div className="add-submenu">
                      <button className="add-submenu-btn" onClick={() => handleAddItem('submenu', item.id)}>
                        <Plus size={14} />
                        Kategorie Hinzufügen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
        
        {/* Button zum Hinzufügen von Kategorien */}
        <div className="add-category">
          <button className="add-category-btn" onClick={() => handleAddItem('menu')}>
            <Plus size={14} />
            Kategorie Hinzufügen
          </button>
        </div>
      </div>
      
      {/* Bearbeitungsmodal */}
      {editingItem && (
        <div className="modal-overlay">
          <div className="modal menu-modal">
            <div className="modal-header">
              <h2>{editingItem.type === 'menu' ? 'Menüeintrag bearbeiten' : 'Unterkategorie bearbeiten'}</h2>
              <button className="close-btn" onClick={() => setEditingItem(null)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveItem}>
              <div className="form-group">
                <label htmlFor="title">Titel</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={menuFormData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>
              
              {menuFormData.type === 'submenu' && (
                <div className="form-group">
                  <label htmlFor="parentId">Übergeordneter Eintrag</label>
                  <select
                    id="parentId"
                    name="parentId"
                    value={menuFormData.parentId || ''}
                    onChange={handleFormChange}
                  >
                    <option value="">Kein übergeordneter Eintrag</option>
                    {menuItems
                      .filter(item => item.type === 'menu' || (item.type === 'submenu' && item.id !== menuFormData.id))
                      .map(item => (
                        <option key={item.id} value={item.id}>
                          {item.title} (ID: {item.id})
                        </option>
                      ))
                    }
                  </select>
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setEditingItem(null)}>
                  Abbrechen
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

// Artikeleditor-Komponente
const ArticleEditorContent = ({ item, onClose }) => {
  const [articleTitle, setArticleTitle] = useState(item.title || "");
  const [articleElements, setArticleElements] = useState([
    { id: 1, type: 'text', content: '', label: 'Zeile 1' },
    { id: 2, type: 'image', content: '', label: 'Zeile 2' }
  ]);
  const [selectedElement, setSelectedElement] = useState(null);
  
  // Artikelelement hinzufügen
  const addArticleElement = (type) => {
    const newId = Math.max(...articleElements.map(el => el.id), 0) + 1;
    const newElement = {
      id: newId,
      type,
      content: '',
      label: `Zeile ${newId}`
    };
    
    setArticleElements([...articleElements, newElement]);
  };
  
  // Artikelelement entfernen
  const removeArticleElement = (id) => {
    setArticleElements(articleElements.filter(el => el.id !== id));
    if (selectedElement && selectedElement.id === id) {
      setSelectedElement(null);
    }
  };
  
  // Artikelelement aktualisieren
  const updateArticleElement = (id, data) => {
    setArticleElements(articleElements.map(el => 
      el.id === id ? {...el, ...data} : el
    ));
  };
  
  // Komponente für Textelement
  const TextElementEditor = ({ element }) => {
    return (
      <div className="element-editor text-editor">
        <textarea
          value={element.content}
          onChange={(e) => updateArticleElement(element.id, { content: e.target.value })}
          placeholder="Text eingeben..."
          rows={4}
        ></textarea>
      </div>
    );
  };
  
  // Komponente für Bild-Element
  const ImageElementEditor = ({ element }) => {
    const [imageSrc, setImageSrc] = useState(element.content || '');
    
    // Simuliere Bildauswahl
    const handleImageSelect = () => {
      // In einer echten App würde hier ein Datei-Upload stattfinden
      const sampleImage = 'https://images.unsplash.com/photo-1573511860302-28c11ff2c879?q=80&w=600';
      setImageSrc(sampleImage);
      updateArticleElement(element.id, { content: sampleImage });
    };
    
    return (
      <div className="element-editor image-editor">
        {imageSrc ? (
          <div className="image-preview">
            <img src={imageSrc} alt="Vorschau" />
            <button type="button" className="change-image-btn" onClick={handleImageSelect}>
              Bild ändern
            </button>
          </div>
        ) : (
          <div className="image-placeholder" onClick={handleImageSelect}>
            <div className="placeholder-content">
              <span>Klicken um ein Bild auszuwählen</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Komponente für Link-Element
  const LinkElementEditor = ({ element }) => {
    const [linkData, setLinkData] = useState({
      url: element.content || '',
      text: element.linkText || 'Link anzeigen'
    });
    
    const handleLinkChange = (e) => {
      const { name, value } = e.target;
      const newData = { ...linkData, [name]: value };
      setLinkData(newData);
      
      // Update parent component
      updateArticleElement(element.id, { 
        content: newData.url,
        linkText: newData.text
      });
    };
    
    return (
      <div className="element-editor link-editor">
        <div className="form-group">
          <label htmlFor={`link-url-${element.id}`}>URL</label>
          <input
            type="url"
            id={`link-url-${element.id}`}
            name="url"
            value={linkData.url}
            onChange={handleLinkChange}
            placeholder="https://beispiel.de"
            className="link-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`link-text-${element.id}`}>Linktext</label>
          <input
            type="text"
            id={`link-text-${element.id}`}
            name="text"
            value={linkData.text}
            onChange={handleLinkChange}
            placeholder="Hier klicken"
            className="link-input"
          />
        </div>
      </div>
    );
  };
  
  // Komponente für Datei-Element
  const FileElementEditor = ({ element }) => {
    const [fileName, setFileName] = useState(element.fileName || '');
    
    const handleFileSelect = () => {
      // Simuliere Dateiauswahl
      const sampleFile = 'beispiel-dokument.pdf';
      setFileName(sampleFile);
      updateArticleElement(element.id, { 
        content: '/files/beispiel-dokument.pdf',
        fileName: sampleFile
      });
    };
    
    return (
      <div className="element-editor file-editor">
        <div className="file-selector">
          {fileName ? (
            <div className="file-preview">
              <div className="file-info">
                <span className="file-name">{fileName}</span>
                <span className="file-type">PDF</span>
              </div>
              <button type="button" className="change-file-btn" onClick={handleFileSelect}>
                Datei ändern
              </button>
            </div>
          ) : (
            <div className="file-placeholder" onClick={handleFileSelect}>
              <div className="placeholder-content">
                <span>Klicken um eine Datei auszuwählen</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Komponente für E-Mail-Element
  const EmailElementEditor = ({ element }) => {
    const [emailData, setEmailData] = useState({
      email: element.content || '',
      text: element.emailText || ''
    });
    
    const handleEmailChange = (e) => {
      const { name, value } = e.target;
      const newData = { ...emailData, [name]: value };
      setEmailData(newData);
      
      // Update parent component
      updateArticleElement(element.id, { 
        content: newData.email,
        emailText: newData.text
      });
    };
    
    return (
      <div className="element-editor email-editor">
        <div className="form-group">
          <label htmlFor={`email-address-${element.id}`}>E-Mail-Adresse</label>
          <input
            type="email"
            id={`email-address-${element.id}`}
            name="email"
            value={emailData.email}
            onChange={handleEmailChange}
            placeholder="beispiel@gemeinde.de"
            className="email-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`email-text-${element.id}`}>Anzeigetext (optional)</label>
          <input
            type="text"
            id={`email-text-${element.id}`}
            name="text"
            value={emailData.text}
            onChange={handleEmailChange}
            placeholder="Kontakt"
            className="email-input"
          />
        </div>
      </div>
    );
  };
  
  // Komponente für Telefonnummer-Element
  const PhoneElementEditor = ({ element }) => {
    const [phoneData, setPhoneData] = useState({
      number: element.content || '',
      text: element.phoneText || ''
    });
    
    const handlePhoneChange = (e) => {
      const { name, value } = e.target;
      const newData = { ...phoneData, [name]: value };
      setPhoneData(newData);
      
      // Update parent component
      updateArticleElement(element.id, { 
        content: newData.number,
        phoneText: newData.text
      });
    };
    
    return (
      <div className="element-editor phone-editor">
        <div className="form-group">
          <label htmlFor={`phone-number-${element.id}`}>Telefonnummer</label>
          <input
            type="tel"
            id={`phone-number-${element.id}`}
            name="number"
            value={phoneData.number}
            onChange={handlePhoneChange}
            placeholder="+49 1234 567890"
            className="phone-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor={`phone-text-${element.id}`}>Anzeigetext (optional)</label>
          <input
            type="text"
            id={`phone-text-${element.id}`}
            name="text"
            value={phoneData.text}
            onChange={handlePhoneChange}
            placeholder="Rathaus"
            className="phone-input"
          />
        </div>
      </div>
    );
  };
  
  // Komponente für Datum-Element
  const DateElementEditor = ({ element }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    
    const monthData = [
      { month: 'Januar', dates: '24.01.2025' },
      { month: 'Februar', dates: '07.02.2025 & 21.02.2025' },
      { month: 'März', dates: '07.03.2025 & 21.03.2025' },
      { month: 'April', dates: '04.04.2025 & Donnerstag 17.04.2025' },
      { month: 'Mai', dates: 'Samstag 03.05.2025 & Samstag 31.05.2025' }
    ];
    
    return (
      <div className="element-editor date-editor">
        <div className="date-selector">
          <button 
            type="button" 
            className="date-toggle-btn"
            onClick={() => setShowCalendar(!showCalendar)}
          >
            {showCalendar ? 'Kalender schließen' : 'Termine auswählen'}
          </button>
          
          {showCalendar && (
            <div className="date-calendar">
              {monthData.map((item, index) => (
                <div key={index} className="date-month">
                  <div className="month-name">{item.month}:</div>
                  <div className="month-dates">{item.dates}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Artikel speichern
  const saveArticle = () => {
    // Hier würde die Speicherlogik implementiert werden
    alert('Artikel wurde gespeichert!');
    onClose();
  };
  
  return (
    <div className="article-editor-content">
      <div className="article-editor-header">
        <div className="article-info">
          <h1>Auftritt - {item.id}</h1>
          <div className="article-meta">
            Kategorie: {item.type === 'menu' ? 'Hauptkategorie' : 'Unterkategorie'}
          </div>
        </div>
        <div className="article-actions">
          <button className="save-btn" onClick={saveArticle}>
            Speichern
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Zurück
          </button>
        </div>
      </div>
      
      <div className="article-editor-container">
        <div className="article-sidebar">
          <div className="article-elements">
            <h3>Elemente</h3>
            <div className="element-list">
              {articleElements.map(element => (
                <div 
                  key={element.id} 
                  className={`element-item ${selectedElement?.id === element.id ? 'selected' : ''}`}
                  onClick={() => setSelectedElement(element)}
                >
                  <div className="element-title">{element.label}</div>
                  <div className="element-type">Typ: {element.type}</div>
                  <button 
                    className="remove-element-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeArticleElement(element.id);
                    }}
                  >
                    <Trash size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="add-element-buttons">
              <button className="add-element-btn" onClick={() => addArticleElement('text')}>
                + Text hinzufügen
              </button>
              <button className="add-element-btn" onClick={() => addArticleElement('link')}>
                + Link hinzufügen
              </button>
              <button className="add-element-btn" onClick={() => addArticleElement('image')}>
                + Bild hinzufügen
              </button>
              <button className="add-element-btn" onClick={() => addArticleElement('file')}>
                + Datei hinzufügen
              </button>
              <button className="add-element-btn" onClick={() => addArticleElement('email')}>
                + E-Mail hinzufügen
              </button>
              <button className="add-element-btn" onClick={() => addArticleElement('phone')}>
                + Telefonnummer hinzufügen
              </button>
              <button className="add-element-btn" onClick={() => addArticleElement('date')}>
                + Termine hinzufügen
              </button>
            </div>
          </div>
        </div>
        
        <div className="article-main">
          <div className="article-title-editor">
            <label htmlFor="article-title">Titel</label>
            <input
              type="text"
              id="article-title"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              placeholder="Artikeltitel eingeben"
            />
          </div>
          
          <div className="article-content-editor">
            {selectedElement ? (
              <div className="selected-element-editor">
                <h3>{selectedElement.label} bearbeiten</h3>
                <div className="element-type-selector">
                  <label>Typ:</label>
                  <select 
                    value={selectedElement.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      // Zurücksetzen der zugehörigen Daten beim Wechsel des Typs
                      const updatedElement = {
                        ...selectedElement,
                        type: newType,
                        content: '',  // Inhalt zurücksetzen
                        // Zusätzliche typspezifische Daten zurücksetzen
                        linkText: newType === 'link' ? 'Link anzeigen' : undefined,
                        emailText: newType === 'email' ? '' : undefined,
                        phoneText: newType === 'phone' ? '' : undefined,
                        fileName: newType === 'file' ? '' : undefined
                      };
                      setSelectedElement(updatedElement);
                      updateArticleElement(selectedElement.id, updatedElement);
                    }}
                  >
                    <option value="text">Text</option>
                    <option value="link">Link</option>
                    <option value="image">Bild</option>
                    <option value="file">Datei</option>
                    <option value="email">E-Mail</option>
                    <option value="phone">Telefonnummer</option>
                    <option value="date">Termine</option>
                  </select>
                </div>
                
                {selectedElement.type === 'text' && <TextElementEditor element={selectedElement} />}
                {selectedElement.type === 'link' && <LinkElementEditor element={selectedElement} />}
                {selectedElement.type === 'image' && <ImageElementEditor element={selectedElement} />}
                {selectedElement.type === 'file' && <FileElementEditor element={selectedElement} />}
                {selectedElement.type === 'email' && <EmailElementEditor element={selectedElement} />}
                {selectedElement.type === 'phone' && <PhoneElementEditor element={selectedElement} />}
                {selectedElement.type === 'date' && <DateElementEditor element={selectedElement} />}
                
                <div className="element-actions">
                  <button 
                    className="delete-element-btn"
                    onClick={() => removeArticleElement(selectedElement.id)}
                  >
                    <Trash size={16} /> Element löschen
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-element-selected">
                <p>Bitte wählen Sie ein Element aus der Seitenleiste aus, um es zu bearbeiten.</p>
              </div>
            )}
          </div>
          
          <div className="article-preview">
            <h3>Vorschau</h3>
            <div className="preview-container">
              <h2 className="preview-title">{articleTitle || "Artikeltitel"}</h2>
              
              {articleElements.map(element => (
                <div key={element.id} className={`preview-element preview-${element.type}`}>
                  {element.type === 'text' && (
                    <div className="preview-text">
                      {element.content ? element.content : <em>Text wird hier angezeigt...</em>}
                    </div>
                  )}
                  
                  {element.type === 'link' && (
                    <div className="preview-link">
                      {element.content ? (
                        <a href={element.content} target="_blank" rel="noopener noreferrer" className="preview-link-item">
                          {element.linkText || element.content}
                        </a>
                      ) : (
                        <em>Link wird hier angezeigt...</em>
                      )}
                    </div>
                  )}
                  
                  {element.type === 'image' && (
                    <div className="preview-image">
                      {element.content ? (
                        <img src={element.content} alt="Bild" />
                      ) : (
                        <div className="image-placeholder-preview">Bild wird hier angezeigt</div>
                      )}
                    </div>
                  )}
                  
                  {element.type === 'file' && (
                    <div className="preview-file">
                      {element.fileName ? (
                        <a href={element.content} className="file-download-link">
                          <span className="file-icon">📄</span>
                          <span className="file-name">{element.fileName}</span>
                        </a>
                      ) : (
                        <em>Datei wird hier angezeigt...</em>
                      )}
                    </div>
                  )}
                  
                  {element.type === 'email' && (
                    <div className="preview-email">
                      {element.content ? (
                        <a href={`mailto:${element.content}`} className="email-link">
                          <span className="email-icon">✉️</span>
                          <span className="email-text">{element.emailText || element.content}</span>
                        </a>
                      ) : (
                        <em>E-Mail wird hier angezeigt...</em>
                      )}
                    </div>
                  )}
                  
                  {element.type === 'phone' && (
                    <div className="preview-phone">
                      {element.content ? (
                        <a href={`tel:${element.content.replace(/\s/g, '')}`} className="phone-link">
                          <span className="phone-icon">📞</span>
                          <span className="phone-text">{element.phoneText || element.content}</span>
                        </a>
                      ) : (
                        <em>Telefonnummer wird hier angezeigt...</em>
                      )}
                    </div>
                  )}
                  
                  {element.type === 'date' && (
                    <div className="preview-date">
                      <h4>Termine:</h4>
                      <ul>
                        <li>Januar: 24.01.2025</li>
                        <li>Februar: 07.02.2025 & 21.02.2025</li>
                        <li>März: 07.03.2025 & 21.03.2025</li>
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
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
      case 'menu':
        return <MenuEditorContent />;
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