
import React, { useState } from 'react';
import './App.css';

// Sidebar-Komponente
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>Admin Panel</h2>
      </div>
      <nav>
        <ul>
          <li className="active"><a href="#dashboard">Dashboard</a></li>
          <li><a href="#apps">Apps verwalten</a></li>
          <li><a href="#users">Benutzer</a></li>
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
      <div className="search">
        <input type="text" placeholder="Suchen..." />
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

export default function App() {
  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="main-content">
        <Header />
        <DashboardContent />
      </div>
    </div>
  );
}
