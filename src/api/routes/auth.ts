
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
