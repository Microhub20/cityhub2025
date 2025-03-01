import { Router, Request, Response } from 'express';

const router = Router();

// Get all content
router.get('/', (req: Request, res: Response) => {
  // In einer echten Anwendung würden wir hier Daten aus einer Datenbank abrufen
  res.json({ 
    message: 'Alle Inhalte abgerufen',
    items: [
      { id: 1, title: 'Rathaus Kasendorf', description: 'Informationen zum Rathaus', isActive: true },
      { id: 2, title: 'Müllkalender', description: 'Abfuhr-Termine', isActive: true },
      { id: 3, title: 'Veranstaltungen', description: 'Aktuelle Veranstaltungen', isActive: true }
    ]
  });
});

// Get content by ID
router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  res.json({ 
    message: `Inhalt mit ID: ${id} abgerufen`,
    item: { 
      id: parseInt(id), 
      title: 'Beispiel Inhalt', 
      description: 'Das ist ein Beispielinhalt mit der angegebenen ID', 
      isActive: true 
    }
  });
});

// Create new content
router.post('/', (req: Request, res: Response) => {
  const content = req.body;
  res.status(201).json({ 
    message: 'Inhalt erstellt', 
    content: { 
      ...content, 
      id: Math.floor(Math.random() * 1000) + 1 
    } 
  });
});

// Update content
router.put('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const content = req.body;
  res.json({ 
    message: `Inhalt mit ID: ${id} aktualisiert`, 
    content: { 
      ...content, 
      id: parseInt(id) 
    } 
  });
});

// Delete content
router.delete('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  res.json({ message: `Inhalt mit ID: ${id} gelöscht` });
});

export default router;