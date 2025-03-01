
import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Gültige API-Keys (im Produktionsbetrieb würde man diese in einer Datenbank speichern)
const validApiKeys = [
  'test-api-key-123',
  'app-api-key-456'
];

// Temporäre Sync-Tokens (im Produktionsbetrieb würde man diese in einer Datenbank speichern)
const syncTokens = new Map();

// POST /api/auth/verify - API-Key verifizieren
router.post('/verify', (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API-Key fehlt' });
  }
  
  if (validApiKeys.includes(apiKey)) {
    return res.json({ valid: true });
  }
  
  res.status(401).json({ valid: false, error: 'Ungültiger API-Key' });
});

// POST /api/auth/sync-token - Sync-Token generieren
router.post('/sync-token', (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Ungültiger API-Key' });
  }
  
  // Token generieren (im Produktionsbetrieb würde man ein sichereres Verfahren verwenden)
  const token = crypto.randomBytes(32).toString('base64');
  
  // Token speichern (mit Ablaufzeit von 60 Minuten)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  syncTokens.set(token, { apiKey, expiresAt });
  
  res.json({ token, expiresAt });
});

export default router;


import express from 'express';

const router = express.Router();

// Mock-Daten für API-Keys und Authentifizierung
const validApiKeys = new Map([
  ['test-api-key-123', { userId: 1, name: 'Admin' }],
  ['app-api-key-456', { userId: 2, name: 'Mobile App' }]
]);

// POST /api/auth/verify - API-Key verifizieren
router.post('/verify', (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ message: 'API-Key ist erforderlich' });
  }
  
  const apiKeyInfo = validApiKeys.get(apiKey);
  
  if (apiKeyInfo) {
    res.json({
      valid: true,
      user: apiKeyInfo
    });
  } else {
    res.status(401).json({
      valid: false,
      message: 'Ungültiger API-Key'
    });
  }
});

// POST /api/auth/sync-token - GithubSync-Token generieren
router.post('/sync-token', (req, res) => {
  const { apiKey } = req.body;
  
  if (!apiKey) {
    return res.status(400).json({ message: 'API-Key ist erforderlich' });
  }
  
  const apiKeyInfo = validApiKeys.get(apiKey);
  
  if (apiKeyInfo) {
    // In einer echten Implementierung würde hier ein JWT generiert werden
    const syncToken = Buffer.from(`${apiKeyInfo.userId}:${Date.now()}`).toString('base64');
    
    res.json({
      syncToken,
      expiresIn: 3600 // 1 Stunde
    });
  } else {
    res.status(401).json({
      message: 'Ungültiger API-Key'
    });
  }
});

export default router;
