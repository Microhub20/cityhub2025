import { Router, Request, Response } from 'express';

const router = Router();

// API-Key verifizieren
router.post('/verify', (req: Request, res: Response) => {
  const { apiKey } = req.body;

  // In einer realen Anwendung würden wir hier gegen eine Datenbank prüfen
  // Für Demo-Zwecke akzeptieren wir bestimmte Test-Keys
  const validApiKeys = ['test-api-key-123', 'app-api-key-456'];

  if (validApiKeys.includes(apiKey)) {
    res.json({ valid: true, message: 'API-Key ist gültig' });
  } else {
    res.status(401).json({ valid: false, message: 'Ungültiger API-Key' });
  }
});

// Sync-Token generieren
router.post('/sync-token', (req: Request, res: Response) => {
  const { apiKey } = req.body;

  // Prüfen, ob der API-Key gültig ist
  const validApiKeys = ['test-api-key-123', 'app-api-key-456'];

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Ungültiger API-Key' });
  }

  // Token generieren (in einer realen Anwendung würde man JWT verwenden)
  const tokenData = `${apiKey}:${Date.now()}`;
  const token = Buffer.from(tokenData).toString('base64');

  // Token zurückgeben
  res.json({
    token,
    expiresIn: '60m'
  });
});

export default router;