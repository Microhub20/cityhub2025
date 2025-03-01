
import { Request, Response, NextFunction } from 'express';

// Einfache Middleware zur Überprüfung des API-Keys
export const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return res.status(401).json({ message: 'API-Key ist erforderlich' });
  }
  
  // Hier würde die Validierung des API-Keys erfolgen
  // Für dieses Beispiel gehen wir davon aus, dass der Key gültig ist
  
  next();
};

// Middleware zur Überprüfung des Sync-Tokens für Admin-Operationen
export const getSyncToken = (req: Request, res: Response, next: NextFunction) => {
  const syncToken = req.headers['x-sync-token'] as string;
  
  if (!syncToken) {
    return res.status(401).json({ message: 'Sync-Token ist erforderlich für diese Operation' });
  }
  
  try {
    // In einer echten Implementierung würde hier die JWT-Validierung stattfinden
    const decoded = Buffer.from(syncToken, 'base64').toString();
    const [userId, timestamp] = decoded.split(':');
    
    // Prüfen, ob das Token abgelaufen ist (1 Stunde)
    const tokenTime = parseInt(timestamp);
    const currentTime = Date.now();
    
    if (currentTime - tokenTime > 3600000) {
      return res.status(401).json({ message: 'Sync-Token ist abgelaufen' });
    }
    
    // Token ist gültig
    req.body.userId = parseInt(userId);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Ungültiges Sync-Token' });
  }
};
