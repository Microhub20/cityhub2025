
import express from 'express';
import path from 'path';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import { fileURLToPath } from 'url';

// API-Routen-Handler
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// API-Endpunkte
// Auth-Routen
app.post('/api/auth/verify', (req, res) => {
  const { apiKey } = req.body;
  
  // Demo API-Keys
  const validKeys = ['test-api-key-123', 'app-api-key-456'];
  
  if (validKeys.includes(apiKey)) {
    res.json({ success: true, message: 'API-Key ist gültig' });
  } else {
    res.status(401).json({ success: false, message: 'Ungültiger API-Key' });
  }
});

// Sync-Token generieren
app.post('/api/auth/sync-token', (req, res) => {
  const { apiKey } = req.body;
  
  // Demo API-Keys prüfen
  const validKeys = ['test-api-key-123', 'app-api-key-456'];
  
  if (validKeys.includes(apiKey)) {
    // Ein einfaches Token generieren
    const token = Buffer.from(`1:${Date.now()}`).toString('base64');
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Ungültiger API-Key' });
  }
});

// Status-Endpunkt
app.get('/api/sync/status', (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  // Demo API-Keys prüfen
  const validKeys = ['test-api-key-123', 'app-api-key-456'];
  
  if (validKeys.includes(apiKey as string)) {
    res.json({
      lastSync: new Date(),
      status: 'Bereit für Synchronisierung',
      itemCount: 12
    });
  } else {
    res.status(401).json({ success: false, message: 'Ungültiger API-Key' });
  }
});

// Content-Routen
app.get('/api/content', (req, res) => {
  res.json([
    { id: 1, title: 'Willkommen', content: 'Willkommen in CityHub!' },
    { id: 2, title: 'Neuigkeiten', content: 'Aktuelle Nachrichten aus der Stadt' }
  ]);
});

// Mängelmelder-Routen
app.get('/api/maengel', (req, res) => {
  res.json([
    { 
      id: 1, 
      title: 'Straßenbeleuchtung defekt', 
      location: 'Hauptstraße 123',
      status: 'aktiv' 
    },
    { 
      id: 2, 
      title: 'Schlagloch', 
      location: 'Marktplatz',
      status: 'bearbeitet' 
    }
  ]);
});

// In Produktion: Statische Frontend-Dateien ausliefern
if (process.env.NODE_ENV === 'production') {
  // Pfad zum Frontend-Build-Verzeichnis
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.resolve(__dirname, '../../dist');
  
  app.use(express.static(distPath));
  
  // Alle nicht-API-Anfragen zum Frontend-Index weiterleiten
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=== CityHub Server läuft auf Port ${PORT} ===`);
  console.log(`- API-Endpunkte unter http://localhost:${PORT}/api/`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`- Frontend unter http://localhost:${PORT}/`);
  } else {
    console.log(`- Im Entwicklungsmodus: Frontend muss separat gestartet werden`);
  }
});

export default app;
