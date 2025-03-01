
import app from './index';

// Starte den API-Server
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`CityHub API-Server läuft auf Port ${port}`);
  console.log(`API-Endpunkte verfügbar unter: ${port}/api/...`);
  
  // Alle verfügbaren Endpunkte ausgeben
  console.log(`API-Endpunkte:`);
  console.log(`- GET    /api/content`);
  console.log(`- GET    /api/content/:id`);
  console.log(`- POST   /api/content`);
  console.log(`- PUT    /api/content/:id`);
  console.log(`- DELETE /api/content/:id`);
  console.log(`- GET    /api/maengel`);
  console.log(`- GET    /api/maengel/:id`);
  console.log(`- POST   /api/maengel`);
  console.log(`- PUT    /api/maengel/:id`);
  console.log(`- DELETE /api/maengel/:id`);
  console.log(`- POST   /api/auth/verify`);
  console.log(`- POST   /api/auth/sync-token`);
});
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// Beispiel-Route für Auth-Verifizierung
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

// Server starten
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API-Server läuft auf Port ${PORT}`);
});
