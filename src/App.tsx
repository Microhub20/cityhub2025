
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

// Startseite Bearbeiten Komponente
const StartseiteBearbeiten = () => {
  const [zeilen, setZeilen] = useState([
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

  const handleTitelChange = (zeileIndex: number, spalteIndex: number, value: string) => {
    const neueZeilen = [...zeilen];
    neueZeilen[zeileIndex].spalten[spalteIndex].titel = value;
    setZeilen(neueZeilen);
  };

  const handleKategorieIdChange = (zeileIndex: number, spalteIndex: number, value: string) => {
    const neueZeilen = [...zeilen];
    neueZeilen[zeileIndex].spalten[spalteIndex].auftritt_kategorie_id = value;
    setZeilen(neueZeilen);
  };

  return (
    <div className="startseite-content">
      <div className="startseite-header">
        <h1>Startseite Bearbeiten</h1>
        <button className="save-btn">Speichern</button>
      </div>

      <div className="startseite-editor">
        <div className="editor-section">
          {zeilen.map((zeile, zeileIndex) => (
            <div key={zeile.id} className="zeile-container">
              <h2>Zeile {zeile.id}</h2>
              
              <div className="zeile-typ">
                <label>Typ</label>
                <div className="select-wrapper">
                  <select value={zeile.typ}>
                    <option value="Doppelzeile">Doppelzeile</option>
                    <option value="Einzelzeile">Einzelzeile</option>
                    <option value="Banner">Banner</option>
                  </select>
                </div>
              </div>

              <div className="spalten-container">
                <label>Spalten:</label>
                
                {zeile.spalten.map((spalte, spalteIndex) => (
                  <div key={spalte.id} className="spalte-container">
                    <div className="spalte-typ">
                      <label>Typ</label>
                      <div className="select-wrapper">
                        <select value={spalte.typ}>
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
                    
                    <div className="spalte-kategorie-id">
                      <label>Auftritt-Kategorie-Id</label>
                      <input 
                        type="text" 
                        value={spalte.auftritt_kategorie_id} 
                        onChange={(e) => handleKategorieIdChange(zeileIndex, spalteIndex, e.target.value)}
                      />
                    </div>
                    
                    {spalte.typ === 'Bild' && (
                      <div className="spalte-bild">
                        <label>Bild</label>
                        <div className="bild-upload">
                          <input type="file" id="bild-upload" hidden />
                          <label htmlFor="bild-upload" className="bild-upload-btn">
                            <span className="icon">📷</span> Bild hochladen
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <button className="add-zeile-btn">+ Neue Zeile hinzufügen</button>
        </div>
        
        <div className="preview-section">
          <h3>Vorschau</h3>
          <div className="phone-preview">
            <div className="phone-frame">
              <div className="phone-content">
                <div className="preview-grid">
                  {zeilen[0].spalten.map((spalte) => (
                    <div key={spalte.id} className="preview-item">
                      <div className="preview-label">{spalte.titel}</div>
                    </div>
                  ))}
                </div>
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
