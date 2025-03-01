
import app from './index';

// Starte den API-Server
const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`CityHub API-Server läuft auf Port ${port}`);
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
