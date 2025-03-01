
import express from 'express';
import { getSyncToken } from '../middleware/auth';

const router = express.Router();

// Mock-Daten für Inhalte
let contents = [
  { 
    id: 1, 
    title: 'Rathaus Kasendorf', 
    type: 'Mehrfachzelle',
    description: 'Zentrale Anlaufstelle für Bürger',
    iconName: 'building',
    color: '#3498db',
    route: '/rathaus',
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 1
  },
  { 
    id: 2, 
    title: 'Müllkalender', 
    type: 'Einzelzelle',
    description: 'Abfuhrtermine',
    iconName: 'trash',
    color: '#27ae60',
    route: '/muellkalender',
    order: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 1
  }
];

// GET /api/content - Alle Inhalte abrufen
router.get('/', (req, res) => {
  res.json(contents);
});

// GET /api/content/:id - Einen bestimmten Inhalt abrufen
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const content = contents.find(c => c.id === id);
  
  if (content) {
    res.json(content);
  } else {
    res.status(404).json({ message: 'Inhalt nicht gefunden' });
  }
});

// POST /api/content - Neuen Inhalt erstellen
router.post('/', getSyncToken, (req, res) => {
  const newContent = {
    ...req.body,
    id: Math.max(...contents.map(c => c.id), 0) + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  contents.push(newContent);
  res.status(201).json(newContent);
});

// PUT /api/content/:id - Inhalt aktualisieren
router.put('/:id', getSyncToken, (req, res) => {
  const id = parseInt(req.params.id);
  const contentIndex = contents.findIndex(c => c.id === id);
  
  if (contentIndex !== -1) {
    const updatedContent = {
      ...contents[contentIndex],
      ...req.body,
      id: id, // ID sollte nicht geändert werden
      updatedAt: new Date()
    };
    
    contents[contentIndex] = updatedContent;
    res.json(updatedContent);
  } else {
    res.status(404).json({ message: 'Inhalt nicht gefunden' });
  }
});

// DELETE /api/content/:id - Inhalt löschen
router.delete('/:id', getSyncToken, (req, res) => {
  const id = parseInt(req.params.id);
  const contentIndex = contents.findIndex(c => c.id === id);
  
  if (contentIndex !== -1) {
    const deletedContent = contents[contentIndex];
    contents = contents.filter(c => c.id !== id);
    res.json(deletedContent);
  } else {
    res.status(404).json({ message: 'Inhalt nicht gefunden' });
  }
});

export default router;
