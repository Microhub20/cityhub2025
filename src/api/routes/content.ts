
import express from 'express';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Dummy-Daten für Entwicklungszwecke
const contentItems = [
  { id: 1, title: 'Willkommen', type: 'text', content: 'Willkommen in Tuttlingen!' },
  { id: 2, title: 'Nachrichten', type: 'news', content: 'Aktuelle Veranstaltungen...' }
];

// GET /api/content - Alle Inhalte abrufen
router.get('/', (req, res) => {
  res.json(contentItems);
});

// GET /api/content/:id - Einzelnen Inhalt abrufen
router.get('/:id', (req, res) => {
  const item = contentItems.find(item => item.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Inhalt nicht gefunden' });
  res.json(item);
});

// POST /api/content - Neuen Inhalt erstellen (benötigt Auth)
router.post('/', authMiddleware, (req, res) => {
  const newId = Math.max(...contentItems.map(item => item.id), 0) + 1;
  const newItem = { id: newId, ...req.body };
  contentItems.push(newItem);
  res.status(201).json(newItem);
});

// PUT /api/content/:id - Inhalt aktualisieren (benötigt Auth)
router.put('/:id', authMiddleware, (req, res) => {
  const itemIndex = contentItems.findIndex(item => item.id === parseInt(req.params.id));
  if (itemIndex === -1) return res.status(404).json({ error: 'Inhalt nicht gefunden' });
  
  contentItems[itemIndex] = { ...contentItems[itemIndex], ...req.body };
  res.json(contentItems[itemIndex]);
});

// DELETE /api/content/:id - Inhalt löschen (benötigt Auth)
router.delete('/:id', authMiddleware, (req, res) => {
  const itemIndex = contentItems.findIndex(item => item.id === parseInt(req.params.id));
  if (itemIndex === -1) return res.status(404).json({ error: 'Inhalt nicht gefunden' });
  
  contentItems.splice(itemIndex, 1);
  res.status(204).send();
});

export default router;


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
