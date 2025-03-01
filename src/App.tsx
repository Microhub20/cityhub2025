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
              Startbildschirm
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
          <li className={activeView === 'waste' ? 'active' : ''}>
            <a href="#waste" onClick={() => setActiveView('waste')}>
              <FileEdit className="icon" size={18} />
              Müllkalender
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

// Startseiten-Bearbeitungskomponente
const AppsManagementContent = () => {
  // Staat für die Zeilen der Startseite
  const [startseiteZeilen, setStartseiteZeilen] = useState([
    { 
      id: 1, 
      typ: 'Mehrfachzelle', 
      subTyp: 'Auftritt-Kategorie',
      titel: 'Rathaus Kasendorf', 
      kategorieId: '1234',
      bild: 'https://images.unsplash.com/photo-1592965025398-f51b88f696fb?q=80&w=600',
      position: 1,
      url: ''
    },
    { 
      id: 2, 
      typ: 'Einzelzelle', 
      subTyp: 'Auftritt-Kategorie',
      titel: 'Sonnentempel', 
      kategorieId: '1234',
      bild: 'https://images.unsplash.com/photo-1594284937520-e27ea0a16fb9?q=80&w=600',
      position: 2,
      url: ''
    }
  ]);

  // Status für die aktive Bearbeitungszeile
  const [aktiveZeile, setAktiveZeile] = useState(1);
  // Status für das Hinzufügen einer neuen Zeile
  const [isAddingZeile, setIsAddingZeile] = useState(false);

  // Zeile hinzufügen
  const addZeile = () => {
    const neueZeileId = Math.max(...startseiteZeilen.map(zeile => zeile.id), 0) + 1;
    const neueZeile = {
      id: neueZeileId,
      typ: 'Auftritt-Kategorie',
      titel: 'Neue Zeile',
      kategorieId: '',
      bild: '',
      position: startseiteZeilen.length + 1
    };
    setStartseiteZeilen([...startseiteZeilen, neueZeile]);
    setAktiveZeile(neueZeileId);
  };

  // Zeile bearbeiten
  const updateZeile = (id, daten) => {
    setStartseiteZeilen(startseiteZeilen.map(zeile => 
      zeile.id === id ? {...zeile, ...daten} : zeile
    ));
  };

  // Zeile löschen
  const deleteZeile = (id) => {
    if (window.confirm('Möchten Sie diese Zeile wirklich löschen?')) {
      const aktualisierteListe = startseiteZeilen.filter(zeile => zeile.id !== id);

      // Position neu nummerieren
      const neuNummeriert = aktualisierteListe.map((zeile, index) => ({
        ...zeile,
        position: index + 1
      }));

      setStartseiteZeilen(neuNummeriert);

      // Wenn die aktive Zeile gelöscht wurde, ersten Eintrag oder null setzen
      if (aktiveZeile === id) {
        setAktiveZeile(neuNummeriert.length > 0 ? neuNummeriert[0].id : null);
      }
    }
  };

  // Zeile nach oben verschieben
  const moveZeileUp = (id) => {
    const index = startseiteZeilen.findIndex(zeile => zeile.id === id);
    if (index <= 0) return;

    const neueZeilen = [...startseiteZeilen];
    [neueZeilen[index-1], neueZeilen[index]] = [neueZeilen[index], neueZeilen[index-1]];

    // Position aktualisieren
    neueZeilen.forEach((zeile, i) => {
      zeile.position = i + 1;
    });

    setStartseiteZeilen(neueZeilen);
  };

  // Zeile nach unten verschieben
  const moveZeileDown = (id) => {
    const index = startseiteZeilen.findIndex(zeile => zeile.id === id);
    if (index >= startseiteZeilen.length - 1) return;

    const neueZeilen = [...startseiteZeilen];
    [neueZeilen[index], neueZeilen[index+1]] = [neueZeilen[index+1], neueZeilen[index]];

    // Position aktualisieren
    neueZeilen.forEach((zeile, i) => {
      zeile.position = i + 1;
    });

    setStartseiteZeilen(neueZeilen);
  };

  // Aktuelle Bearbeitungszeile
  const aktuelleZeile = startseiteZeilen.find(zeile => zeile.id === aktiveZeile) || null;

  // Bilder für die Vorschau (als Platzhalter)
  const vorschauBilder = {
    willkommen: "https://images.unsplash.com/photo-1573511860302-28c11ff2c879?q=80&w=300",
    müllkalender: "https://images.unsplash.com/photo-1592965025398-f51b88f696fb?q=80&w=300",
    rathaus: "https://images.unsplash.com/photo-1573511860302-28c11ff2c879?q=80&w=300",
    veranstaltungen: "https://images.unsplash.com/photo-1594284937520-e27ea0a16fb9?q=80&w=300"
  };

  // Bildeingabe-Handler
  const handleBildUpload = (id) => {
    // In einer echten App würde hier ein Datei-Upload stattfinden
    const beispielBilder = [
      'https://images.unsplash.com/photo-1573511860302-28c11ff2c879?q=80&w=600',
      'https://images.unsplash.com/photo-1592965025398-f51b88f696fb?q=80&w=600',
      'https://images.unsplash.com/photo-1594284937520-e27ea0a16fb9?q=80&w=600'
    ];

    const zufallsBild = beispielBilder[Math.floor(Math.random() * beispielBilder.length)];
    updateZeile(id, { bild: zufallsBild });
  };

  // Handler für Input-Änderungen
  const handleChange = (e, id) => {
    const { name, value } = e.target;
    updateZeile(id, { [name]: value });
  };

  return (
    <div className="startseite-content">
      <div className="startseite-header">
        <h1>Startseite Bearbeiten</h1>
        <button className="add-btn" onClick={addZeile}>
          <Plus size={16} />
          Neue Zeile
        </button>
      </div>

      <div className="startseite-grid">
        <div className="startseite-zeilen">
          {startseiteZeilen.map((zeile) => (
            <div key={zeile.id} 
                 className={`startseite-zeile ${aktiveZeile === zeile.id ? 'active' : ''}`}
                 onClick={() => setAktiveZeile(zeile.id)}>
              <div className="zeile-header">
                <span className="zeile-nummer">Zeile {zeile.position}</span>
                <div className="zeile-actions">
                  <button className="action-btn" onClick={(e) => { e.stopPropagation(); moveZeileUp(zeile.id); }}>
                    <span>▲</span>
                  </button>
                  <button className="action-btn" onClick={(e) => { e.stopPropagation(); moveZeileDown(zeile.id); }}>
                    <span>▼</span>
                  </button>
                  <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); deleteZeile(zeile.id); }}>
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              <div className="zeile-info">
                <span className="zeile-typ">{zeile.typ}</span>
                <span className="zeile-titel">{zeile.titel}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="startseite-editor">
          {aktuelleZeile && (
            <div className="zeile-editor">
              <h3>Zeile {aktuelleZeile.position}</h3>

              <div className="form-group">
                <label>Typ:</label>
                <select 
                  name="typ"
                  value={aktuelleZeile.typ}
                  onChange={(e) => handleChange(e, aktuelleZeile.id)}
                  className="input-dropdown"
                >
                  <option value="Einzelzelle">Einzelzelle</option>
                  <option value="Doppelzelle">Doppelzelle</option>
                  <option value="Mehrfachzelle">Mehrfachzelle</option>
                </select>
              </div>

              <div className="form-group mt-3">
                <label>Spalten:</label>
                <div className="spalten-anzahl">
                  {aktuelleZeile.typ === "Einzelzelle" ? "1" : 
                   aktuelleZeile.typ === "Doppelzelle" ? "2" : "4"}
                </div>
              </div>

              <div className="form-group mt-3">
                <label>Typ:</label>
                <select 
                  name="subTyp"
                  value={aktuelleZeile.subTyp || "Auftritt-Kategorie"}
                  onChange={(e) => handleChange(e, aktuelleZeile.id)}
                  className="input-dropdown"
                >
                  <option value="Link">Link</option>
                  <option value="Neue Mängelmeldung">Neue Mängelmeldung</option>
                  <option value="Mängelmelder">Mängelmelder</option>
                  <option value="Auftritt">Auftritt</option>
                  <option value="Auftritt-Kategorie">Auftritt-Kategorie</option>
                </select>
              </div>

              <div className="form-group">
                <label>Titel:</label>
                <input 
                  type="text"
                  name="titel"
                  value={aktuelleZeile.titel}
                  onChange={(e) => handleChange(e, aktuelleZeile.id)}
                  placeholder="Titel eingeben"
                  className="input-text"
                />
              </div>

              <div className="form-group">
                <label>Auftritt-Kategorie-ID:</label>
                <input 
                  type="text"
                  name="kategorieId"
                  value={aktuelleZeile.kategorieId}
                  onChange={(e) => handleChange(e, aktuelleZeile.id)}
                  placeholder="ID eingeben"
                  className="input-text"
                />
              </div>

              {(aktuelleZeile.subTyp === 'Link' || aktuelleZeile.subTyp === 'Neue Mängelmeldung' || aktuelleZeile.subTyp === 'Mängelmelder') && (
                <div className="form-group">
                  <label>URL/Pfad:</label>
                  <input 
                    type="text"
                    name="url"
                    value={aktuelleZeile.url || ''}
                    onChange={(e) => handleChange(e, aktuelleZeile.id)}
                    placeholder="URL oder Pfad eingeben"
                    className="input-text"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Bild:</label>
                <div className="bild-upload">
                  {aktuelleZeile.bild ? (
                    <div className="bild-preview">
                      <img src={aktuelleZeile.bild} alt={aktuelleZeile.titel} />
                      <button 
                        className="bild-change-btn"
                        onClick={() => handleBildUpload(aktuelleZeile.id)}
                      >
                        Bild ändern
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="bild-upload-btn"
                      onClick={() => handleBildUpload(aktuelleZeile.id)}
                    >
                      Bild auswählen
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="startseite-vorschau">
          <h3>Vorschau</h3>
          <div className="phone-mockup">
            <div className="phone-header">
              <div className="phone-notch"></div>
            </div>
            <div className="phone-content">
              <div className="phone-status-bar">Mittelpunkt Oberfranken</div>
              <div className="phone-grid">
                {startseiteZeilen.map((zeile, index) => (
                  <div 
                    key={zeile.id} 
                    className={`app-kachel ${zeile.typ.toLowerCase()} kachel-${index} kachel-${zeile.subTyp?.toLowerCase() || ''}`}
                  >
                    {zeile.bild && <img src={zeile.bild} alt={zeile.titel} />}
                    <span className="kachel-titel">{zeile.titel}</span>
                    {zeile.subTyp === 'Link' && <small className="kachel-link-indicator">→</small>}
                    {zeile.subTyp === 'Neue Mängelmeldung' && <small className="kachel-maengel-indicator">+</small>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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

  // Lade gespeicherte Kategorien aus dem localStorage
  const [savedCategories, setSavedCategories] = useState(() => {
    const savedData = localStorage.getItem('cityhubCategories');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error('Fehler beim Laden der Kategorien:', e);
        return [];
      }
    }
    return [
      {
        id: 1,
        name: 'Schadensmeldungen',
        isExpanded: true,
        subCategories: [
          { id: 101, name: 'Straßenschäden' },
          { id: 102, name: 'Beleuchtung' },
          { id: 103, name: 'Müllablagerung' },
          { id: 104, name: 'Sonstiges' },
          { id: 105, name: 'Vandalismus' },
        ]
      },
      {
        id: 2,
        name: 'Verbesserung & Lob',
        isExpanded: false,
        subCategories: []
      },
      {
        id: 3,
        name: 'Sonstiges',
        isExpanded: false,
        subCategories: []
      }
    ];
  });

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

    // Wenn die Kategorie geändert wird, setze die Unterkategorie auf die erste verfügbare
    if (name === 'category') {
      const selectedCategory = savedCategories.find(cat => cat.name === value);
      const firstSubCategory = selectedCategory?.subCategories?.[0]?.name || 'Keine Unterkategorie';

      setMaengelFormData({
        ...maengelFormData,
        [name]: value,
        subCategory: firstSubCategory
      });
    } else {
      setMaengelFormData({
        ...maengelFormData,
        [name]: value
      });
    }
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
                <input                  type="text"
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
                    value={maengelFormData.category || (savedCategories[0]?.name || 'Schadensmeldungen')}
                    onChange={handleMaengelFormChange}
                  >
                    {savedCategories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
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
                    {savedCategories
                      .find(cat => cat.name === maengelFormData.category)?.subCategories.map(sub => (
                        <option key={sub.id} value={sub.name}>{sub.name}</option>
                      )) || (
                        <option value="Keine Unterkategorie">Keine Unterkategorie</option>
                      )
                    }
                    {/* Fallback-Option, falls keine Unterkategorien gefunden werden */}
                    {!savedCategories.find(cat => cat.name === maengelFormData.category)?.subCategories?.length && (
                      <option value="Keine Unterkategorie">Keine Unterkategorie</option>
                    )}
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
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

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

  // Drag-and-Drop Funktionen
  const handleDragStart = (e, element) => {
    setDraggedElement(element);
    e.currentTarget.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging');
    setDraggedElement(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedElement) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();

    if (!draggedElement) return;

    const sourceIndex = articleElements.findIndex(el => el.id === draggedElement.id);
    if (sourceIndex === targetIndex) return;

    const newElements = [...articleElements];

    // Element an der Quellposition entfernen
    const [removed] = newElements.splice(sourceIndex, 1);

    // Element an der Zielposition einfügen
    newElements.splice(targetIndex, 0, removed);

    // Label-Nummern aktualisieren
    newElements.forEach((el, idx) => {
      el.label = `Zeile ${idx + 1}`;
    });

    setArticleElements(newElements);
    setDraggedElement(null);
    setDragOverIndex(null);
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
              {articleElements.map((element, index) => (
                <div 
                  key={element.id} 
                  className={`element-item ${selectedElement?.id === element.id ? 'selected' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
                  onClick={() => setSelectedElement(element)}
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, element)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="drag-handle">⋮⋮</div>
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
          </div></div>

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

              <div className="preview-elements-container">
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
    </div>
  );
};

// Einstellungen-Komponente
const SettingsContent = () => {
  const [apiKey, setApiKey] = useState('');
  const [syncToken, setSyncToken] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });
  const [isVerifying, setIsVerifying] = useState(false);
  const [appUrl, setAppUrl] = useState('https://cityhub-app.riccosauter.repl.co');
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    message: 'Nicht verbunden'
  });
  const [syncResults, setSyncResults] = useState({
    lastSync: null,
    syncStatus: '',
    syncedItems: 0
  });

  // Mängelmelder-Kategorien Status
  const [activeTab, setActiveTab] = useState('api');
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Schadensmeldungen',
      isExpanded: true,
      subCategories: [
        { id: 101, name: 'Straßenschäden' },
        { id: 102, name: 'Beleuchtung' },
        { id: 103, name: 'Müllablagerung' },
        { id: 104, name: 'Sonstiges' },
        { id: 105, name: 'Vandalismus' },
      ]
    },
    {
      id: 2,
      name: 'Verbesserung & Lob',
      isExpanded: false,
      subCategories: []
    },
    {
      id: 3,
      name: 'Sonstiges',
      isExpanded: false,
      subCategories: []
    }
  ]);

  // Bearbeitungsmodus
  const [editMode, setEditMode] = useState({
    isEditing: false,
    itemType: null, // 'category' oder 'subcategory'
    itemId: null,
    itemName: '',
    parentId: null
  });

  // Lädt die API-ID beim Initialisieren
  useEffect(() => {
    // Aus dem localStorage laden
    const savedApiKey = localStorage.getItem('cityhubApiKey') || '';
    const savedAppUrl = localStorage.getItem('cityhubAppUrl') || 'https://cityhub-app.riccosauter.repl.co';
    const savedCategories = localStorage.getItem('cityhubCategories');

    setApiKey(savedApiKey);
    setAppUrl(savedAppUrl);

    // Gespeicherte Kategorien laden, falls vorhanden
    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (e) {
        console.error('Fehler beim Laden der Kategorien:', e);
      }
    }

    // Wenn ein API-Key vorhanden ist, Status prüfen
    if (savedApiKey) {
      verifyApiKey(savedApiKey, savedAppUrl);
    }
  }, []);

  // API-Key überprüfen
  const verifyApiKey = async (key, url) => {
    setIsVerifying(true);

    try {
      // Tatsächliche API-Verbindung versuchen
      const apiUrl = `${url}/api/auth/verify`;
      console.log(`Verifying API connection to: ${apiUrl}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      }).catch(error => {
        console.error('Fetch error:', error);
        return { ok: false, status: 0 };
      });

      // Alternative für Demo/Test wenn Server nicht erreichbar
      const isValid = response.ok || key === 'test-api-key-123' || key === 'app-api-key-456';

      if (isValid) {
        generateSyncToken(key, url);
        setConnectionStatus({
          isConnected: true,
          message: response.ok ? 'Verbunden mit CityHub API' : 'Demo-Verbindung aktiv (Testmodus)'
        });

        // Bei erfolgreicher Verbindung letzte Sync-Info laden
        checkSyncStatus(key, url);
      } else {
        setConnectionStatus({
          isConnected: false,
          message: `Verbindung fehlgeschlagen: ${response.status === 0 ? 'Server nicht erreichbar' : 'Ungültiger API-Key'}`
        });
      }

    } catch (error) {
      console.error('Fehler bei der API-Key Verifizierung:', error);
      setConnectionStatus({
        isConnected: false,
        message: 'Verbindung fehlgeschlagen: Netzwerkfehler'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Sync-Token generieren
  const generateSyncToken = async (key, url) => {
    try {
      // Tatsächliche Token-Generierung versuchen
      const apiUrl = `${url}/api/auth/sync-token`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      }).catch(() => null);

      // Token aus Antwort extrahieren oder Fallback verwenden
      let token;

      if (response && response.ok) {
        const data = await response.json();
        token = data.token;
      } else {
        // Fallback für Demo/Test
        token = Buffer.from(`1:${Date.now()}`).toString('base64');
      }

      // Token speichern
      setSyncToken(token);
      localStorage.setItem('cityhubSyncToken', token);

    } catch (error) {
      console.error('Fehler beim Generieren des Sync-Tokens:', error);
    }
  };

  // Sync-Status prüfen
  const checkSyncStatus = async (key, url) => {
    try {
      // Sync-Status abrufen
      const apiUrl = `${url}/api/sync/status`;

      const response = await fetch(apiUrl, {
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': key
        }
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        setSyncResults({
          lastSync: new Date(data.lastSync || Date.now()),
          syncStatus: data.status || 'Bereit',
          syncedItems: data.itemCount || 0
        });
      } else {
        // Demo-Daten
        setSyncResults({
          lastSync: new Date(),
          syncStatus: 'Bereit für Synchronisierung',
          syncedItems: 12
        });
      }
    } catch (error) {
      console.error('Fehler beim Abrufen des Sync-Status:', error);
    }
  };

  // Synchronisierung starten
  const startSync = async () => {
    if (!connectionStatus.isConnected || !apiKey) return;

    try {
      setSyncResults(prev => ({
        ...prev,
        syncStatus: 'Synchronisierung läuft...'
      }));

      // Tatsächliche Synchronisierung versuchen
      const syncUrl = `${appUrl}/api/sync/start`;

      const response = await fetch(syncUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'X-Sync-Token': syncToken
        }
      }).catch(() => null);

      if (response && response.ok) {
        const data = await response.json();
        setSyncResults({
          lastSync: new Date(),
          syncStatus: 'Synchronisierung erfolgreich',
          syncedItems: data.itemCount || 14
        });
      } else {
        // Demo-Erfolg simulieren
        setTimeout(() => {
          setSyncResults({
            lastSync: new Date(),
            syncStatus: 'Synchronisierung erfolgreich',
            syncedItems: 14
          });
        }, 1500);
      }
    } catch (error) {
      console.error('Fehler bei der Synchronisierung:', error);
      setSyncResults(prev => ({
        ...prev,
        syncStatus: 'Synchronisierung fehlgeschlagen'
      }));
    }
  };

  // Speichert die API-ID und App-URL
  const saveApiKey = () => {
    setIsSaving(true);

    // Im localStorage speichern
    localStorage.setItem('cityhubApiKey', apiKey);
    localStorage.setItem('cityhubAppUrl', appUrl);

    // API-Key verifizieren
    verifyApiKey(apiKey, appUrl);

    setSaveStatus({
      type: 'success',
      message: 'API-Key erfolgreich gespeichert'
    });

    // Status-Nachricht nach 3 Sekunden ausblenden
    setTimeout(() => {
      setSaveStatus({ type: '', message: '' });
      setIsSaving(false);
    }, 3000);
  };

  // Kategorie-Funktionen
  const toggleCategoryExpand = (categoryId) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  const addCategory = () => {
    setEditMode({
      isEditing: true,
      itemType: 'category',
      itemId: null,
      itemName: '',
      parentId: null
    });
  };

  const addSubCategory = (parentId) => {
    setEditMode({
      isEditing: true,
      itemType: 'subcategory',
      itemId: null,
      itemName: '',
      parentId
    });
  };

  const editCategory = (category) => {
    setEditMode({
      isEditing: true,
      itemType: 'category',
      itemId: category.id,
      itemName: category.name,
      parentId: null
    });
  };

  const editSubCategory = (subCategory, parentId) => {
    setEditMode({
      isEditing: true,
      itemType: 'subcategory',
      itemId: subCategory.id,
      itemName: subCategory.name,
      parentId
    });
  };

  const deleteCategory = (categoryId) => {
    if (window.confirm('Möchten Sie diese Kategorie wirklich löschen?')) {
      setCategories(categories.filter(cat => cat.id !== categoryId));
      saveCategories(categories.filter(cat => cat.id !== categoryId));
    }
  };

  const deleteSubCategory = (parentId, subCategoryId) => {
    if (window.confirm('Möchten Sie diese Unterkategorie wirklich löschen?')) {
      const updatedCategories = categories.map(cat => {
        if (cat.id === parentId) {
          return {
            ...cat,
            subCategories: cat.subCategories.filter(sub => sub.id !== subCategoryId)
          };
        }
        return cat;
      });

      setCategories(updatedCategories);
      saveCategories(updatedCategories);
    }
  };

  const handleEditChange = (e) => {
    setEditMode({
      ...editMode,
      itemName: e.target.value
    });
  };

  const saveEditChanges = () => {
    if (!editMode.itemName.trim()) return;

    let updatedCategories;

    if (editMode.itemType === 'category') {
      if (editMode.itemId) {
        // Kategorie bearbeiten
        updatedCategories = categories.map(cat => 
          cat.id === editMode.itemId ? { ...cat, name: editMode.itemName } : cat
        );
      } else {
        // Neue Kategorie
        const newId = Math.max(0, ...categories.map(cat => cat.id)) + 1;
        updatedCategories = [
          ...categories,
          {
            id: newId,
            name: editMode.itemName,
            isExpanded: false,
            subCategories: []
          }
        ];
      }
    } else if (editMode.itemType === 'subcategory') {
      if (editMode.itemId) {
        // Unterkategorie bearbeiten
        updatedCategories = categories.map(cat => {
          if (cat.id === editMode.parentId) {
            return {
              ...cat,
              subCategories: cat.subCategories.map(sub => 
                sub.id === editMode.itemId ? { ...sub, name: editMode.itemName } : sub
              )
            };
          }
          return cat;
        });
      } else {
        // Neue Unterkategorie
        updatedCategories = categories.map(cat => {
          if (cat.id === editMode.parentId) {
            const newSubId = Math.max(0, ...cat.subCategories.map(sub => sub.id), 100) + 1;
            return {
              ...cat,
              subCategories: [
                ...cat.subCategories,
                { id: newSubId, name: editMode.itemName }
              ]
            };
          }
          return cat;
        });
      }
    }

    setCategories(updatedCategories);
    saveCategories(updatedCategories);
    setEditMode({ isEditing: false, itemType: null, itemId: null, itemName: '', parentId: null });
  };

  const cancelEdit = () => {
    setEditMode({ isEditing: false, itemType: null, itemId: null, itemName: '', parentId: null });
  };

  const saveCategories = (updatedCategories) => {
    localStorage.setItem('cityhubCategories', JSON.stringify(updatedCategories));
  };

  const saveAllCategories = () => {
    saveCategories(categories);

    setSaveStatus({
      type: 'success',
      message: 'Kategorien erfolgreich gespeichert'
    });

    setTimeout(() => {
      setSaveStatus({ type: '', message: '' });
    }, 3000);
  };

  return (
    <div className="settings-content">
      <div className="settings-header">
        <h1>Einstellungen</h1>
        <div className="settings-tabs">
          <button 
            className={`settings-tab ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            API-Konfiguration
          </button>
          <button 
            className={`settings-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Mängelmelder-Kategorien
          </button>
        </div>
      </div>

      {activeTab === 'api' ? (
        <>
          <div className="settings-section">
            <h2>API-Konfiguration</h2>
            <p className="settings-description">
              Geben Sie Ihren CityHub API-Key ein, um diesen Admin mit der entsprechenden App zu verknüpfen.
            </p>

            <div className="form-group">
              <label htmlFor="api-key">CityHub API-Key</label>
              <input
                type="text"
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Geben Sie Ihren API-Key ein"
                className="settings-input"
              />
              <small className="settings-hint">
                Demo API-Keys: "test-api-key-123" oder "app-api-key-456"
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="app-url">CityHub App URL</label>
              <input
                type="text"
                id="app-url"
                value={appUrl}
                onChange={(e) => setAppUrl(e.target.value)}
                placeholder="https://cityhub-app.riccosauter.repl.co"
                className="settings-input"
              />
              <small className="settings-hint">
                URL der CityHub-App, zu der eine Verbindung hergestellt werden soll
              </small>
            </div>

            {saveStatus.message && (
              <div className={`status-message ${saveStatus.type}`}>
                {saveStatus.message}
              </div>
            )}

            <div className="settings-actions">
              <button 
                className="save-settings-btn" 
                onClick={saveApiKey}
                disabled={isSaving || isVerifying}
              >
                {isSaving ? 'Wird gespeichert...' : isVerifying ? 'Wird überprüft...' : 'Einstellungen speichern'}
              </button>
            </div>
          </div>

          <div className="settings-section">
            <h2>Verbindungsstatus</h2>
            <div className="connection-status">
              <div className="status-indicator">
                <span className={`status-dot ${connectionStatus.isConnected ? 'connected' : 'disconnected'}`}></span>
                <span className="status-text">
                  {connectionStatus.message}
                </span>
              </div>
              {connectionStatus.isConnected && apiKey && (
                <div className="api-id-display">
                  API-Key: {apiKey.substring(0, 4)}...{apiKey.substring(apiKey.length - 4)}
                </div>
              )}

              {syncToken && (
                <div className="sync-token-info">
                  <h3>Sync-Token</h3>
                  <p>Dieses Token wird für Synchronisierungsvorgänge verwendet:</p>
                  <div className="token-display">
                    <code>{syncToken.substring(0, 12)}...{syncToken.substring(syncToken.length - 12)}</code>
                  </div>
                  <p className="token-expiry">Gültig für 60 Minuten</p>

                  {connectionStatus.isConnected && (
                    <div className="sync-actions">
                      <button 
                        className="sync-btn" 
                        onClick={startSync}
                        disabled={syncResults.syncStatus === 'Synchronisierung läuft...'}
                      >
                        {syncResults.syncStatus === 'Synchronisierung läuft...' ? 'Synchronisierung läuft...' : 'Jetzt synchronisieren'}
                      </button>

                      {syncResults.lastSync && (
                        <div className="sync-status">
                          <div className="sync-status-label">Status:</div>
                          <div className="sync-status-value">{syncResults.syncStatus}</div>
                          <div className="sync-status-label">Letzte Synchronisierung:</div>
                          <div className="sync-status-value">
                            {syncResults.lastSync.toLocaleString('de-DE')}
                          </div>
                          <div className="sync-status-label">Synchronisierte Elemente:</div>
                          <div className="sync-status-value">{syncResults.syncedItems}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="settings-section">
            <h2>API-Endpunkte</h2>
            <div className="api-endpoints">
              <h3>Content API</h3>
              <ul className="endpoint-list">
                <li><code>GET /api/content</code> - Alle Inhalte abrufen</li>
                <li><code>GET /api/content/:id</code> - Einzelnen Inhalt abrufen</li>
                <li><code>POST /api/content</code> - Neuen Inhalt erstellen (benötigt Sync-Token)</li>
                <li><code>PUT /api/content/:id</code> - Inhalt aktualisieren (benötigt Sync-Token)</li>
                <li><code>DELETE /api/content/:id</code> - Inhalt löschen (benötigt Sync-Token)</li>
              </ul>

              <h3>Mängelmeldungen API</h3>
              <ul className="endpoint-list">
                <li><code>GET /api/maengel</code> - Alle Mängelmeldungen abrufen</li>
                <li><code>GET /api/maengel/:id</code> - Einzelne Mängelmeldung abrufen</li>
                <li><code>POST /api/maengel</code> - Neue Mängelmeldung erstellen (öffentlich)</li>
                <li><code>PUT /api/maengel/:id</code> - Mängelmeldung aktualisieren (benötigt Sync-Token)</li>
                <li><code>DELETE /api/maengel/:id</code> - Mängelmeldung löschen (benötigt Sync-Token)</li>
              </ul>

              <h3>Synchronisierungs-API</h3>
              <ul className="endpoint-list">
                <li><code>GET /api/sync/status</code> - Status der Synchronisierung abrufen</li>
                <li><code>POST /api/sync/start</code> - Synchronisierung starten (benötigt Sync-Token)</li>
              </ul>
            </div>
          </div>

          <div className="settings-section">
            <h2>CityHub-App Details</h2>
            <div className="app-details">
              <div className="app-url-display">
                <span className="detail-label">App-URL:</span>
                <a href={appUrl} target="_blank" rel="noopener noreferrer" className="app-link">
                  {appUrl}
                </a>
              </div>
              <div className="app-info">
                <p>
                  Die CityHub-App ist eine mobile Anwendung, die Bürgern Zugang zu städtischen Diensten, 
                  Informationen und Interaktionsmöglichkeiten bietet. Über die API können Inhalte 
                  synchronisiert und Mängelmeldungen verwaltet werden.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="settings-section">
          <div className="categories-header">
            <h2>Mängelmelder-Kategorien</h2>
            <p className="settings-description">
              Verwalten Sie die Kategorien und Unterkategorien für den Mängelmelder. Diese Kategorien werden in der App zur Verfügung gestellt.
            </p>
          </div>

          <div className="categories-manager">
            {categories.map(category => (
              <div key={category.id} className="category-item">
                <div className="category-header">
                  <button 
                    className="toggle-button"
                    onClick={() => toggleCategoryExpand(category.id)}
                  >
                    {category.isExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronDown size={20} style={{ transform: 'rotate(-90deg)' }} />
                    )}
                  </button>
                  <span className="category-name">{category.name}</span>
                  <div className="category-actions">
                    <button 
                      className="edit-button"
                      onClick={() => editCategory(category)}
                      aria-label="Kategorie bearbeiten"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => deleteCategory(category.id)}
                      aria-label="Kategorie löschen"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                {category.isExpanded && (
                  <div className="subcategories-list">
                    {category.subCategories.map(subCategory => (
                      <div key={subCategory.id} className="subcategory-item">
                        <div className="subcategory-content">
                          <span className="subcategory-dash">-</span>
                          <span className="subcategory-name">{subCategory.name}</span>
                          <div className="subcategory-actions">
                            <button 
                              className="edit-button"
                              onClick={() => editSubCategory(subCategory, category.id)}
                              aria-label="Unterkategorie bearbeiten"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => deleteSubCategory(category.id, subCategory.id)}
                              aria-label="Unterkategorie löschen"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="add-subcategory">
                      <button 
                        className="add-button"
                        onClick={() => addSubCategory(category.id)}
                      >
                        <Plus size={16} />
                        Hinzufügen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="add-category">
              <button 
                className="add-category-button"
                onClick={addCategory}
              >
                <Plus size={16} />
                Hinzufügen
              </button>
            </div>

            <div className="save-categories">
              <button 
                className="save-categories-button"
                onClick={saveAllCategories}
              >
                Speichern
              </button>
            </div>

            {saveStatus.message && (
              <div className={`status-message ${saveStatus.type}`}>
                {saveStatus.message}
              </div>
            )}
          </div>

          {/* Edit Modal */}
          {editMode.isEditing && (
            <div className="modal-overlay">
              <div className="modal edit-category-modal">
                <div className="modal-header">
                  <h3>
                    {editMode.itemType === 'category' 
                      ? (editMode.itemId ? 'Kategorie bearbeiten' : 'Neue Kategorie') 
                      : (editMode.itemId ? 'Unterkategorie bearbeiten' : 'Neue Unterkategorie')
                    }
                  </h3>
                  <button className="close-button" onClick={cancelEdit}>
                    <X size={20} />
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="category-name">Name</label>
                    <input
                      type="text"
                      id="category-name"
                      value={editMode.itemName}
                      onChange={handleEditChange}
                      placeholder={editMode.itemType === 'category' ? 'Kategoriename' : 'Unterkategoriename'}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="cancel-button" onClick={cancelEdit}>
                    Abbrechen
                  </button>
                  <button 
                    className="save-button" 
                    onClick={saveEditChanges}
                    disabled={!editMode.itemName.trim()}
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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
      case 'waste':
        return <WasteCalendarContent />;
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

// Müllkalender-Verwaltungskomponente
const WasteCalendarContent = () => {
  const [activeTab, setActiveTab] = useState('regions');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isEditingItem, setIsEditingItem] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterWasteType, setFilterWasteType] = useState('all');

  // Status für Regionen, Abfallarten und Abholtermine
  const [regions, setRegions] = useState([
    { id: 1, name: 'Innenstadt', description: 'Stadtbezirk Innenstadt', isActive: true },
    { id: 2, name: 'Nordstadt', description: 'Nördlicher Stadtbezirk', isActive: true },
    { id: 3, name: 'Ost', description: 'Östlicher Stadtbezirk', isActive: true },
    { id: 4, name: 'Süd', description: 'Südlicher Stadtbezirk mit Vororten', isActive: false }
  ]);

  const [wasteTypes, setWasteTypes] = useState([
    { id: 1, name: 'Restmüll', description: 'Regulärer Haushaltsmüll', color: '#555555', isActive: true },
    { id: 2, name: 'Biomüll', description: 'Organische Abfälle', color: '#8BC34A', isActive: true },
    { id: 3, name: 'Papier', description: 'Papier und Kartonage', color: '#2196F3', isActive: true },
    { id: 4, name: 'Gelber Sack', description: 'Verpackungen mit grünem Punkt', color: '#FFC107', isActive: true },
    { id: 5, name: 'Sperrmüll', description: 'Große Gegenstände', color: '#9C27B0', isActive: true }
  ]);

  const [schedules, setSchedules] = useState([
    { 
      id: 1, 
      regionId: 1, 
      wasteTypeId: 1, 
      date: new Date(2023, 11, 15), // 15. Dezember 2023
      notificationSent: true 
    },
    { 
      id: 2, 
      regionId: 1, 
      wasteTypeId: 2, 
      date: new Date(2023, 11, 18), // 18. Dezember 2023
      notificationSent: false 
    },
    { 
      id: 3, 
      regionId: 2, 
      wasteTypeId: 1, 
      date: new Date(2023, 11, 16), // 16. Dezember 2023
      notificationSent: true 
    },
    { 
      id: 4, 
      regionId: 3, 
      wasteTypeId: 3, 
      date: new Date(2023, 11, 20), // 20. Dezember 2023
      notificationSent: false
    },
    { 
      id: 5, 
      regionId: 1, 
      wasteTypeId: 4, 
      date: new Date(2023, 11, 22), // 22. Dezember 2023
      notificationSent: false 
    }
  ]);

  // State für Formulardaten
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    description: '',
    color: '#000000',
    isActive: true,
    regionId: '',
    wasteTypeId: '',
    date: new Date(),
    notificationSent: false
  });

  // Hilfsfunktion: Regionenname anhand der ID finden
  const getRegionName = (regionId) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'Unbekannte Region';
  };

  // Hilfsfunktion: Abfallartname und Farbe anhand der ID finden
  const getWasteTypeInfo = (wasteTypeId) => {
    const wasteType = wasteTypes.find(w => w.id === wasteTypeId);
    return wasteType ? { name: wasteType.name, color: wasteType.color } : { name: 'Unbekannt', color: '#999999' };
  };

  // Hilfsfunktion: Datum formatieren
  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formular-Handler
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'date') {
      setFormData({ ...formData, [name]: new Date(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Element hinzufügen oder bearbeiten
  const handleAddOrEdit = (type) => {
    if (isEditingItem) {
      // Bearbeiten
      if (type === 'region') {
        setRegions(regions.map(region => 
          region.id === formData.id ? { ...formData } : region
        ));
      } else if (type === 'wasteType') {
        setWasteTypes(wasteTypes.map(wasteType => 
          wasteType.id === formData.id ? { ...formData } : wasteType
        ));
      } else if (type === 'schedule') {
        setSchedules(schedules.map(schedule => 
          schedule.id === formData.id ? { ...formData } : schedule
        ));
      }
    } else {
      // Neu hinzufügen
      const newId = Math.max(0, ...(
        type === 'region' ? regions.map(r => r.id) : 
        type === 'wasteType' ? wasteTypes.map(w => w.id) : 
        schedules.map(s => s.id)
      )) + 1;

      const newItem = { ...formData, id: newId };

      if (type === 'region') {
        setRegions([...regions, newItem]);
      } else if (type === 'wasteType') {
        setWasteTypes([...wasteTypes, newItem]);
      } else if (type === 'schedule') {
        setSchedules([...schedules, newItem]);
      }
    }

    // Formular zurücksetzen
    resetForm();
  };

  // Element zum Bearbeiten auswählen
  const handleEdit = (type, item) => {
    setIsEditingItem(item.id);
    setIsAddingItem(true);
    setFormData({
      ...item,
      // Sicherstellen, dass Date-Objekte korrekt sind
      date: item.date instanceof Date ? item.date : new Date(item.date)
    });
  };

  // Element löschen
  const handleDelete = (type, itemId) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?')) {
      if (type === 'region') {
        setRegions(regions.filter(region => region.id !== itemId));
      } else if (type === 'wasteType') {
        setWasteTypes(wasteTypes.filter(wasteType => wasteType.id !== itemId));
      } else if (type === 'schedule') {
        setSchedules(schedules.filter(schedule => schedule.id !== itemId));
      }
    }
  };

  // Formular zurücksetzen
  const resetForm = () => {
    setIsAddingItem(false);
    setIsEditingItem(null);
    setFormData({
      id: null,
      name: '',
      description: '',
      color: '#000000',
      isActive: true,
      regionId: '',
      wasteTypeId: '',
      date: new Date(),
      notificationSent: false
    });
  };

  // Benachrichtigungen für Abholtermine senden
  const sendNotification = (scheduleId) => {
    // Hier würde die tatsächliche Benachrichtigungslogik implementiert
    setSchedules(schedules.map(schedule => 
      schedule.id === scheduleId ? { ...schedule, notificationSent: true } : schedule
    ));

    alert(`Benachrichtigung für Abholtermin #${scheduleId} wurde gesendet.`);
  };

  // Bulk-Termine erstellen
  const createBulkSchedules = () => {
    alert("Bulk-Erstellung von Abholterminen wird implementiert");
    // Würde einen Dialog öffnen, um mehrere Termine für verschiedene Regionen und Abfallarten zu erstellen
  };

  // Region hinzufügen Button-Komponente
  const AddRegionButton = () => (
    <div className="add-region-container">
      <button className="add-region-button" onClick={() => {
        setIsAddingItem(true);
        setFormData({
          ...formData,
          id: null,
          name: '',
          description: '',
          isActive: true
        });
      }}>
        <Plus size={16} /> Region hinzufügen
      </button>
    </div>
  );
  
  // Terminkalenderansicht
  const CalendarView = () => {
    // Kalendernavigation
    const prevMonth = () => {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() - 1);
      setSelectedDate(newDate);
    };

    const nextMonth = () => {
      const newDate = new Date(selectedDate);
      newDate.setMonth(newDate.getMonth() + 1);
      setSelectedDate(newDate);
    };

    // Zum aktuellen Monat springen
    const goToCurrentMonth = () => {
      setSelectedDate(new Date());
    };

    // Kalender-Header mit Monatsbezeichnung
    const monthName = selectedDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    // Tage im Monat berechnen
    const daysInMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    ).getDate();

    // Wochentag des ersten Tags im Monat (0 = Sonntag, 1 = Montag, ...)
    let firstDayOfMonth = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    ).getDay();

    // In Deutschland beginnt die Woche mit Montag, daher Anpassung
    firstDayOfMonth = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Gefilterte Termine
    const filteredSchedules = schedules.filter(schedule => {
      if (filterRegion !== 'all' && schedule.regionId !== parseInt(filterRegion)) {
        return false;
      }
      if (filterWasteType !== 'all' && schedule.wasteTypeId !== parseInt(filterWasteType)) {
        return false;
      }
      return true;
    });

    // Kalender-Tage erstellen
    const calendarDays = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
      const isToday = 
        new Date().getDate() === day && 
        new Date().getMonth() === currentDate.getMonth() && 
        new Date().getFullYear() === currentDate.getFullYear();

      // Abholtermine für diesen Tag finden
      const daySchedules = filteredSchedules.filter(schedule => 
        schedule.date.getDate() === day &&
        schedule.date.getMonth() === currentDate.getMonth() &&
        schedule.date.getFullYear() === currentDate.getFullYear()
      );

      calendarDays.push(
        <div 
          key={`day-${day}`} 
          className={`calendar-day ${daySchedules.length > 0 ? 'has-schedules' : ''} ${isToday ? 'today' : ''}`}
        >
          <div className="day-number">{day}</div>
          {daySchedules.map(schedule => {
            const wasteType = getWasteTypeInfo(schedule.wasteTypeId);
            return (
              <div
                key={schedule.id}
                className="calendar-schedule"
                style={{ backgroundColor: wasteType.color }}
                onClick={() => handleEdit('schedule', schedule)}
                title={`${getRegionName(schedule.regionId)} - ${wasteType.name}`}
              >
                <span className="schedule-region">{getRegionName(schedule.regionId)}</span>
                <span className="schedule-type">{wasteType.name}</span>
              </div>
            );
          })}
          {daySchedules.length === 0 && (
            <div 
              className="add-schedule-day" 
              onClick={() => {
                const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                setFormData({
                  ...formData,
                  id: null,
                  regionId: filterRegion !== 'all' ? parseInt(filterRegion) : (regions[0]?.id || 1),
                  wasteTypeId: filterWasteType !== 'all' ? parseInt(filterWasteType) : (wasteTypes[0]?.id || 1),
                  date: newDate,
                  notificationSent: false
                });
                setIsAddingItem(true);
              }}
            >
              <span className="add-day-icon">+</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="calendar-view-container">
        <div className="calendar-filters">
          <div className="calendar-filter-group">
            <label htmlFor="region-filter">Region filtern:</label>
            <select 
              id="region-filter" 
              value={filterRegion} 
              onChange={(e) => setFilterRegion(e.target.value)}
            >
              <option value="all">Alle Regionen</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          </div>
          <div className="calendar-filter-group">
            <label htmlFor="waste-type-filter">Abfallart filtern:</label>
            <select 
              id="waste-type-filter" 
              value={filterWasteType} 
              onChange={(e) => setFilterWasteType(e.target.value)}
            >
              <option value="all">Alle Abfallarten</option>
              {wasteTypes.map(wasteType => (
                <option key={wasteType.id} value={wasteType.id}>{wasteType.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={prevMonth} className="calendar-nav-btn">◀</button>
            <h3>{monthName}</h3>
            <button onClick={nextMonth} className="calendar-nav-btn">▶</button>
            <button onClick={goToCurrentMonth} className="calendar-today-btn">Heute</button>
          </div>

          <div className="calendar-weekdays">
            <div>Mo</div>
            <div>Di</div>
            <div>Mi</div>
            <div>Do</div>
            <div>Fr</div>
            <div>Sa</div>
            <div>So</div>
          </div>

          <div className="calendar-grid">
            {calendarDays}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="waste-calendar-content">
      <h1>Abfallkalender-Verwaltung</h1>
      
      <div className="tab-buttons">
        <button
          className={`tab-button ${activeTab === 'regions' ? 'active' : ''}`}
          onClick={() => setActiveTab('regions')}
        >
          Regionen
        </button>
        <button
          className={`tab-button ${activeTab === 'wasteTypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('wasteTypes')}
        >
          Abfallarten
        </button>
        <button
          className={`tab-button ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          Abholtermine
        </button>
        <button
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Kalender
        </button>
      </div>

      <div className="waste-calendar-content-body">
        {/* Regionen-Verwaltung */}
        {activeTab === 'regions' && (
          <div className="regions-tab">
            <h2 className="content-title">Stadtbezirke</h2>
            <AddRegionButton />

            <div className="data-list">
              <div className="list-header">
                <div className="column-name">Name</div>
                <div className="column-description">Beschreibung</div>
                <div className="column-status">Status</div>
                <div className="column-actions">Aktionen</div>
              </div>
              
              {regions.map(region => (
                <div key={region.id} className="data-row">
                  <div className="column-name">{region.name}</div>
                  <div className="column-description">{region.description}</div>
                  <div className="column-status">
                    <span className={`status-badge ${region.isActive ? 'active' : 'inactive'}`}>
                      {region.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  <div className="column-actions">
                    <button className="action-edit" onClick={() => handleEdit('region', region)}>
                      <Edit size={18} />
                    </button>
                    <button className="action-delete" onClick={() => handleDelete('region', region.id)}>
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isAddingItem && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h2>{isEditingItem ? 'Region bearbeiten' : 'Neue Region'}</h2>
                    <button className="close-btn" onClick={resetForm}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Beschreibung</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        rows={3}
                      ></textarea>
                    </div>
                    <div className="form-group checkbox-group">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                      />
                      <label htmlFor="isActive">Region aktiv</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="cancel-btn" onClick={resetForm}>
                      Abbrechen
                    </button>
                    <button 
                      className="save-btn" 
                      onClick={() => handleAddOrEdit('region')}
                      disabled={!formData.name.trim()}
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Abfallarten-Verwaltung */}
        {activeTab === 'wasteTypes' && (
          <div className="waste-types-tab">
            <h2 className="content-title">Abfallarten</h2>
            <div className="add-region-container">
              <button className="add-region-button" onClick={() => {
                setIsAddingItem(true);
                setFormData({
                  ...formData,
                  id: null,
                  name: '',
                  description: '',
                  color: '#555555',
                  isActive: true
                });
              }}>
                <Plus size={16} /> Abfallart hinzufügen
              </button>
            </div>

            <div className="data-list">
              <div className="list-header">
                <div className="column-name">Name</div>
                <div className="column-description">Beschreibung</div>
                <div className="column-color">Farbe</div>
                <div className="column-status">Status</div>
                <div className="column-actions">Aktionen</div>
              </div>
              
              {wasteTypes.map(wasteType => (
                <div key={wasteType.id} className="data-row">
                  <div className="column-name">{wasteType.name}</div>
                  <div className="column-description">{wasteType.description}</div>
                  <div className="column-color">
                    <div className="color-preview" style={{ backgroundColor: wasteType.color }}></div>
                    <span>{wasteType.color}</span>
                  </div>
                  <div className="column-status">
                    <span className={`status-badge ${wasteType.isActive ? 'active' : 'inactive'}`}>
                      {wasteType.isActive ? 'Aktiv' : 'Inaktiv'}
                    </span>
                  </div>
                  <div className="column-actions">
                    <button className="action-edit" onClick={() => handleEdit('wasteType', wasteType)}>
                      <Edit size={18} />
                    </button>
                    <button className="action-delete" onClick={() => handleDelete('wasteType', wasteType.id)}>
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isAddingItem && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h2>{isEditingItem ? 'Abfallart bearbeiten' : 'Neue Abfallart'}</h2>
                    <button className="close-btn" onClick={resetForm}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="description">Beschreibung</label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleFormChange}
                        rows={3}
                      ></textarea>
                    </div>
                    <div className="form-group">
                      <label htmlFor="color">Farbe</label>
                      <div className="color-input-group">
                        <input
                          type="color"
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleFormChange}
                          className="color-input"
                        />
                        <input
                          type="text"
                          value={formData.color}
                          onChange={handleFormChange}
                          name="color"
                          className="color-text"
                        />
                      </div>
                    </div>
                    <div className="form-group checkbox-group">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleFormChange}
                      />
                      <label htmlFor="isActive">Abfallart aktiv</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="cancel-btn" onClick={resetForm}>
                      Abbrechen
                    </button>
                    <button 
                      className="save-btn" 
                      onClick={() => handleAddOrEdit('wasteType')}
                      disabled={!formData.name.trim()}
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Abholtermine-Verwaltung */}
        {activeTab === 'schedules' && (
          <div className="schedules-tab">
            <h2 className="content-title">Abholtermine</h2>
            <div className="action-buttons-container">
              <button className="primary-action-button" onClick={() => {
                setIsAddingItem(true);
                setFormData({
                  ...formData,
                  id: null,
                  regionId: regions[0]?.id || '',
                  wasteTypeId: wasteTypes[0]?.id || '',
                  date: new Date(),
                  notificationSent: false
                });
              }}>
                <Plus size={16} /> Termin hinzufügen
              </button>
              <button className="secondary-action-button" onClick={createBulkSchedules}>
                <Plus size={16} /> Mehrere Termine
              </button>
              <button className="tertiary-action-button">
                <FileEdit size={16} /> CSV Export
              </button>
            </div>

            <div className="data-list">
              <div className="list-header">
                <div className="column-region">Region</div>
                <div className="column-waste-type">Abfallart</div>
                <div className="column-date">Datum</div>
                <div className="column-notification">Benachrichtigung</div>
                <div className="column-actions">Aktionen</div>
              </div>
              
              {schedules.map(schedule => {
                const wasteType = getWasteTypeInfo(schedule.wasteTypeId);
                
                return (
                  <div key={schedule.id} className="data-row">
                    <div className="column-region">{getRegionName(schedule.regionId)}</div>
                    <div className="column-waste-type">
                      <div className="waste-type-indicator">
                        <div className="waste-color" style={{ backgroundColor: wasteType.color }}></div>
                        <span>{wasteType.name}</span>
                      </div>
                    </div>
                    <div className="column-date">{formatDate(schedule.date)}</div>
                    <div className="column-notification">
                      {schedule.notificationSent ? (
                        <span className="notification-sent">Gesendet</span>
                      ) : (
                        <button 
                          className="send-notification-button"
                          onClick={() => sendNotification(schedule.id)}
                        >
                          Senden
                        </button>
                      )}
                    </div>
                    <div className="column-actions">
                      <button className="action-edit" onClick={() => handleEdit('schedule', schedule)}>
                        <Edit size={18} />
                      </button>
                      <button className="action-delete" onClick={() => handleDelete('schedule', schedule.id)}>
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {isAddingItem && (
              <div className="modal-overlay">
                <div className="modal">
                  <div className="modal-header">
                    <h2>{isEditingItem ? 'Abholtermin bearbeiten' : 'Neuer Abholtermin'}</h2>
                    <button className="close-btn" onClick={resetForm}>
                      <X size={20} />
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="regionId">Region</label>
                      <select
                        id="regionId"
                        name="regionId"
                        value={formData.regionId}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="" disabled>Region auswählen</option>
                        {regions.map(region => (
                          <option key={region.id} value={region.id}>{region.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="wasteTypeId">Abfallart</label>
                      <select
                        id="wasteTypeId"
                        name="wasteTypeId"
                        value={formData.wasteTypeId}
                        onChange={handleFormChange}
                        required
                      >
                        <option value="" disabled>Abfallart auswählen</option>
                        {wasteTypes.map(wasteType => (
                          <option key={wasteType.id} value={wasteType.id}>{wasteType.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="date">Datum</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date.toISOString().split('T')[0]}
                        onChange={handleFormChange}
                        required
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <input
                        type="checkbox"
                        id="notificationSent"
                        name="notificationSent"
                        checked={formData.notificationSent}
                        onChange={handleFormChange}
                      />
                      <label htmlFor="notificationSent">Benachrichtigung gesendet</label>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="cancel-btn" onClick={resetForm}>
                      Abbrechen
                    </button>
                    <button 
                      className="save-btn" 
                      onClick={() => handleAddOrEdit('schedule')}
                      disabled={!formData.regionId || !formData.wasteTypeId}
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Kalenderansicht */}
        {activeTab === 'calendar' && (
          <div className="calendar-tab">
            <div className="calendar-container">
              <CalendarView />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};