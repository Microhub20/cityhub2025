
import React, { useState } from 'react';
import './App.css';

// Sidebar-Komponente
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>CityHub</h2>
      </div>
      <nav>
        <ul>
          <li><a href="#dashboard">Dashboard</a></li>
          <li><a href="#apps">Apps verwalten</a></li>
          <li><a href="#users">Benutzer</a></li>
          <li className="active"><a href="#startseite">Startseite</a></li>
          <li><a href="#settings">Einstellungen</a></li>
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
        <button className="logout-btn">Abmelden</button>
      </div>
    </header>
  );
};

// Dashboard-Inhalt
const DashboardContent = () => {
  return (
    <div className="dashboard-content">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Gesamte Apps</h3>
          <p className="stat-number">12</p>
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
      
      <h2>Neueste Apps</h2>
      <div className="app-list">
        <div className="app-item">
          <h3>Stadtführer</h3>
          <p>Erstellt: 12.07.2023</p>
          <div className="app-actions">
            <button>Bearbeiten</button>
            <button className="delete">Löschen</button>
          </div>
        </div>
        <div className="app-item">
          <h3>Event Kalender</h3>
          <p>Erstellt: 28.06.2023</p>
          <div className="app-actions">
            <button>Bearbeiten</button>
            <button className="delete">Löschen</button>
          </div>
        </div>
      </div>
    </div>
  );
};

import { adminService } from './api/adminService';

// Typdefinitionen für unsere API-Struktur
interface Spalte {
  id?: number;
  typ: string;
  titel: string;
  auftritt_kategorie_id?: string;
  bild?: string;
}

interface Zeile {
  id?: number | string;
  typ: string;
  spalten: Spalte[];
  position?: number;
}

// Startseite Bearbeiten Komponente
const StartseiteBearbeiten = () => {
  const [zeilen, setZeilen] = useState<Zeile[]>([
    {
      id: 1,
      typ: 'Doppelzeile',
      spalten: [
        {
          id: 1,
          typ: 'Auftritt-Kategorie',
          titel: 'Kategorie',
          auftritt_kategorie_id: '147',
          bild: ''
        },
        {
          id: 2,
          typ: 'Auftritt-Kategorie',
          titel: 'Subkategorie',
          auftritt_kategorie_id: '148',
          bild: ''
        }
      ]
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Daten beim ersten Laden holen
  useEffect(() => {
    fetchZeilen();
  }, []);

  // Zeilen von der API holen
  const fetchZeilen = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // API-Daten in unser Format konvertieren
      const apiZeilen = await adminService.getContents();
      
      // Format anpassen (falls nötig)
      const formattedZeilen = apiZeilen.map(row => ({
        id: row.id,
        typ: row.type,
        spalten: row.columns.map(col => ({
          id: col.id,
          typ: col.type,
          titel: col.title,
          auftritt_kategorie_id: col.category_id,
          bild: col.image
        }))
      }));
      
      setZeilen(formattedZeilen.length > 0 ? formattedZeilen : zeilen);
    } catch (err) {
      console.error('Fehler beim Laden der Daten:', err);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // Änderungen speichern
  const saveChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Zeilen ins API-Format konvertieren
      const apiZeilen = zeilen.map(zeile => ({
        id: zeile.id?.toString(),
        type: zeile.typ,
        columns: zeile.spalten.map(spalte => ({
          id: spalte.id?.toString(),
          type: spalte.typ,
          title: spalte.titel,
          category_id: spalte.auftritt_kategorie_id,
          image: spalte.bild
        })),
        position: zeile.position
      }));
      
      // Alle Zeilen einzeln speichern
      for (const zeile of apiZeilen) {
        if (zeile.id) {
          await adminService.updateContent(zeile.id.toString(), zeile);
        } else {
          await adminService.createContent(zeile);
        }
      }
      
      alert('Änderungen erfolgreich gespeichert!');
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      setError('Fehler beim Speichern der Änderungen. Bitte versuchen Sie es später erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler für Titeländerungen
  const handleTitelChange = (zeileIndex: number, spalteIndex: number, value: string) => {
    const neueZeilen = [...zeilen];
    neueZeilen[zeileIndex].spalten[spalteIndex].titel = value;
    setZeilen(neueZeilen);
  };

  // Handler für Kategorie-ID-Änderungen
  const handleKategorieIdChange = (zeileIndex: number, spalteIndex: number, value: string) => {
    const neueZeilen = [...zeilen];
    neueZeilen[zeileIndex].spalten[spalteIndex].auftritt_kategorie_id = value;
    setZeilen(neueZeilen);
  };
  
  // Neue Zeile hinzufügen
  const addNewZeile = () => {
    const neueZeile: Zeile = {
      typ: 'Doppelzeile',
      spalten: [
        {
          typ: 'Auftritt-Kategorie',
          titel: 'Neue Kategorie',
          auftritt_kategorie_id: '',
          bild: ''
        },
        {
          typ: 'Auftritt-Kategorie',
          titel: 'Neue Kategorie',
          auftritt_kategorie_id: '',
          bild: ''
        }
      ],
      position: zeilen.length
    };
    
    setZeilen([...zeilen, neueZeile]);
  };
  
  // Zeile löschen
  const deleteZeile = async (index: number) => {
    if (window.confirm('Möchten Sie diese Zeile wirklich löschen?')) {
      const zeileToDelete = zeilen[index];
      
      try {
        if (zeileToDelete.id) {
          await adminService.deleteContent(zeileToDelete.id.toString());
        }
        
        const neueZeilen = [...zeilen];
        neueZeilen.splice(index, 1);
        setZeilen(neueZeilen);
      } catch (err) {
        console.error('Fehler beim Löschen:', err);
        setError('Fehler beim Löschen der Zeile. Bitte versuchen Sie es später erneut.');
      }
    }
  };
  
  // Handler für Typenänderungen
  const handleZeileTypChange = (zeileIndex: number, value: string) => {
    const neueZeilen = [...zeilen];
    neueZeilen[zeileIndex].typ = value;
    setZeilen(neueZeilen);
  };
  
  const handleSpalteTypChange = (zeileIndex: number, spalteIndex: number, value: string) => {
    const neueZeilen = [...zeilen];
    neueZeilen[zeileIndex].spalten[spalteIndex].typ = value;
    setZeilen(neueZeilen);
  };

  return (
    <div className="startseite-content">
      <div className="startseite-header">
        <h1>Startseite Bearbeiten</h1>
        <button 
          className="save-btn" 
          onClick={saveChanges} 
          disabled={isLoading}
        >
          {isLoading ? 'Wird gespeichert...' : 'Speichern'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Schließen</button>
        </div>
      )}

      <div className="startseite-editor">
        <div className="editor-section">
          {isLoading && <div className="loading-overlay"><div className="spinner"></div></div>}
          
          {zeilen.map((zeile, zeileIndex) => (
            <div key={zeile.id || `new-${zeileIndex}`} className="zeile-container">
              <div className="zeile-header">
                <h2>Zeile {zeileIndex + 1}</h2>
                <button 
                  className="delete-zeile-btn" 
                  onClick={() => deleteZeile(zeileIndex)}
                >
                  Löschen
                </button>
              </div>
              
              <div className="zeile-typ">
                <label>Typ</label>
                <div className="select-wrapper">
                  <select 
                    value={zeile.typ}
                    onChange={(e) => handleZeileTypChange(zeileIndex, e.target.value)}
                  >
                    <option value="Doppelzeile">Doppelzeile</option>
                    <option value="Einzelzeile">Einzelzeile</option>
                    <option value="Banner">Banner</option>
                  </select>
                </div>
              </div>

              <div className="spalten-container">
                <label>Spalten:</label>
                
                {zeile.spalten.map((spalte, spalteIndex) => (
                  <div key={spalte.id || `new-${zeileIndex}-${spalteIndex}`} className="spalte-container">
                    <div className="spalte-typ">
                      <label>Typ</label>
                      <div className="select-wrapper">
                        <select 
                          value={spalte.typ}
                          onChange={(e) => handleSpalteTypChange(zeileIndex, spalteIndex, e.target.value)}
                        >
                          <option value="Auftritt-Kategorie">Auftritt-Kategorie</option>
                          <option value="Bild">Bild</option>
                          <option value="Text">Text</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="spalte-titel">
                      <label>Titel</label>
                      <input 
                        type="text" 
                        value={spalte.titel} 
                        onChange={(e) => handleTitelChange(zeileIndex, spalteIndex, e.target.value)}
                      />
                    </div>
                    
                    {spalte.typ === 'Auftritt-Kategorie' && (
                      <div className="spalte-kategorie-id">
                        <label>Auftritt-Kategorie-Id</label>
                        <input 
                          type="text" 
                          value={spalte.auftritt_kategorie_id || ''} 
                          onChange={(e) => handleKategorieIdChange(zeileIndex, spalteIndex, e.target.value)}
                        />
                      </div>
                    )}
                    
                    {spalte.typ === 'Bild' && (
                      <div className="spalte-bild">
                        <label>Bild</label>
                        <div className="bild-upload">
                          <input 
                            type="file" 
                            id={`bild-upload-${zeileIndex}-${spalteIndex}`} 
                            hidden 
                          />
                          <label 
                            htmlFor={`bild-upload-${zeileIndex}-${spalteIndex}`} 
                            className="bild-upload-btn"
                          >
                            <span className="icon">📷</span> Bild hochladen
                          </label>
                          {spalte.bild && (
                            <div className="preview-image-container">
                              <img 
                                src={spalte.bild} 
                                alt="Vorschau" 
                                className="preview-image" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button className="add-zeile-btn" onClick={addNewZeile}>
            + Neue Zeile hinzufügen
          </button>
        </div>
        
        <div className="preview-section">
          <h3>Vorschau</h3>
          <div className="phone-preview">
            <div className="phone-frame">
              <div className="phone-content">
                {zeilen.map((zeile, zeileIndex) => (
                  <div 
                    key={zeile.id || `preview-${zeileIndex}`} 
                    className={`preview-${zeile.typ.toLowerCase()}`}
                  >
                    <div className={`preview-grid-${zeile.spalten.length}`}>
                      {zeile.spalten.map((spalte, spalteIndex) => (
                        <div 
                          key={spalte.id || `preview-${zeileIndex}-${spalteIndex}`} 
                          className="preview-item"
                        >
                          {spalte.typ === 'Bild' && spalte.bild && (
                            <img src={spalte.bild} alt={spalte.titel} className="preview-image" />
                          )}
                          <div className="preview-label">{spalte.titel}</div>
                        </div>
                      ))}
                    </div>
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

export default function App() {
  const [activeView, setActiveView] = useState('startseite');

  // Funktion zum Anzeigen der entsprechenden Ansicht
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardContent />;
      case 'startseite':
        return <StartseiteBearbeiten />;
      default:
        return <StartseiteBearbeiten />;
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="main-content">
        <Header />
        {renderContent()}
      </div>
    </div>
  );
}
