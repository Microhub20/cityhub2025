
// Server-Starter für Produktion
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

// Prüfe, ob der Dist-Ordner existiert
if (!fs.existsSync('./dist')) {
  console.log('Frontend-Build nicht gefunden. Starte Build-Prozess...');
  exec('npm run build', (error, stdout, stderr) => {
    if (error) {
      console.error(`Build-Fehler: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Build-Fehler: ${stderr}`);
      return;
    }
    console.log(`Build abgeschlossen: ${stdout}`);
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  // Setze Produktionsmodus
  process.env.NODE_ENV = 'production';
  
  // Starte den Server
  console.log('Starte CityHub-Server...');
  import('./src/api/server.js');
}
