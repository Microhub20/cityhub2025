
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import contentRoutes from './routes/content';
import maengelRoutes from './routes/maengel';
import authRoutes from './routes/auth';

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// API-Routen
app.use('/api/content', contentRoutes);
app.use('/api/maengel', maengelRoutes);
app.use('/api/auth', authRoutes);

// Sync-Route hinzufügen
app.get('/api/sync/status', (req, res) => {
  res.json({
    status: 'Bereit für Synchronisierung',
    lastSync: new Date().toISOString(),
    itemCount: 12
  });
});

app.post('/api/sync/start', (req, res) => {
  res.json({
    status: 'Synchronisierung erfolgreich',
    timestamp: new Date().toISOString(),
    itemCount: 14
  });
});

// Basis-Route für API-Status
app.get('/api', (req, res) => {
  res.json({
    status: 'API ist online',
    endpoints: [
      '/api/content',
      '/api/maengel',
      '/api/auth',
      '/api/sync'
    ]
  });
});

// Basis-Route
app.get('/', (req, res) => {
  res.json({ message: 'Willkommen bei der CityHub API' });
});

export default app;
