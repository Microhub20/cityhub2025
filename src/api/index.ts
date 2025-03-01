import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import contentRoutes from './routes/content';
import maengelRoutes from './routes/maengel';
import authRoutes from './routes/auth';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// API-Routen
app.use('/api/content', contentRoutes);
app.use('/api/maengel', maengelRoutes);
app.use('/api/auth', authRoutes);

// Basis-Route für API-Status
app.get('/api', (req, res) => {
  res.json({
    status: 'API ist online',
    endpoints: [
      '/api/content',
      '/api/maengel',
      '/api/auth'
    ]
  });
});

// Basis-Route
app.get('/', (req, res) => {
  res.json({ message: 'Willkommen bei der CityHub API' });
});

// Starte den Server
app.listen(port, '0.0.0.0', () => {
  console.log(`API-Server läuft auf Port ${port}`);
});

export default app;