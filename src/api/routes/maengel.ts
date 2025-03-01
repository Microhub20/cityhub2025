
import express from 'express';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// Dummy-Daten für Entwicklungszwecke
const maengelItems = [
  { 
    id: 1, 
    title: 'Straßenschaden', 
    description: 'Schlagloch in der Hauptstraße', 
    status: 'aktiv',
    location: 'Hauptstraße 12',
    createdAt: new Date('2023-06-15')
  },
  { 
    id: 2, 
    title: 'Defekte Straßenlaterne', 
    description: 'Laterne flackert seit mehreren Tagen', 
    status: 'aktiv',
    location: 'Parkplatz Bahnhof',
    createdAt: new Date('2023-06-18')
  }
];

// GET /api/maengel - Alle Mängelmeldungen abrufen
router.get('/', (req, res) => {
  res.json(maengelItems);
});

// GET /api/maengel/:id - Einzelne Mängelmeldung abrufen
router.get('/:id', (req, res) => {
  const item = maengelItems.find(item => item.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Mängelmeldung nicht gefunden' });
  res.json(item);
});

// POST /api/maengel - Neue Mängelmeldung erstellen (öffentlich)
router.post('/', (req, res) => {
  const newId = Math.max(...maengelItems.map(item => item.id), 0) + 1;
  const newItem = { 
    id: newId, 
    ...req.body, 
    status: 'aktiv', 
    createdAt: new Date() 
  };
  maengelItems.push(newItem);
  res.status(201).json(newItem);
});

// PUT /api/maengel/:id - Mängelmeldung aktualisieren (benötigt Auth)
router.put('/:id', authMiddleware, (req, res) => {
  const itemIndex = maengelItems.findIndex(item => item.id === parseInt(req.params.id));
  if (itemIndex === -1) return res.status(404).json({ error: 'Mängelmeldung nicht gefunden' });
  
  maengelItems[itemIndex] = { ...maengelItems[itemIndex], ...req.body };
  res.json(maengelItems[itemIndex]);
});

// DELETE /api/maengel/:id - Mängelmeldung löschen (benötigt Auth)
router.delete('/:id', authMiddleware, (req, res) => {
  const itemIndex = maengelItems.findIndex(item => item.id === parseInt(req.params.id));
  if (itemIndex === -1) return res.status(404).json({ error: 'Mängelmeldung nicht gefunden' });
  
  maengelItems.splice(itemIndex, 1);
  res.status(204).send();
});

export default router;


import express from 'express';
import { getSyncToken } from '../middleware/auth';

const router = express.Router();

// Mock-Daten für Mängelmeldungen
let maengel = [
  {
    id: 1,
    title: 'Prelitz - Straßenbeleuchtung defekt',
    image: 'https://images.unsplash.com/photo-1573511860302-28c11ff2c879?q=80&w=200',
    status: 'aktiv',
    location: 'Prelitz',
    description: 'Die Straßenbeleuchtung in Prelitz ist seit mehreren Tagen ausgefallen. Mehrere Laternen in der Hauptstraße funktionieren nicht mehr.',
    createdAt: new Date('2023-06-15'),
    createdById: 1
  },
  {
    id: 2,
    title: 'Gulli verschmiert',
    image: 'https://images.unsplash.com/photo-1592965025398-f51b88f696fb?q=80&w=200',
    status: 'aktiv',
    location: '95359 Kasendorf Simonweg kurz vor dem Festplatz',
    description: 'Der Gulli funktioniert nicht mehr, weil anscheinend Farbeimer und Baumaterialien darin geleert wurden.',
    reporterName: 'Max Mustermann',
    reporterEmail: 'max@example.com',
    category: 'Schadensmeldungen',
    subCategory: 'Straßenschäden',
    createdAt: new Date('2023-06-18'),
    createdById: 2
  }
];

// GET /api/maengel - Alle Mängelmeldungen abrufen
router.get('/', (req, res) => {
  res.json(maengel);
});

// GET /api/maengel/:id - Eine bestimmte Mängelmeldung abrufen
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const mangel = maengel.find(m => m.id === id);
  
  if (mangel) {
    res.json(mangel);
  } else {
    res.status(404).json({ message: 'Mängelmeldung nicht gefunden' });
  }
});

// POST /api/maengel - Neue Mängelmeldung erstellen
router.post('/', (req, res) => {
  const newMangel = {
    ...req.body,
    id: Math.max(...maengel.map(m => m.id), 0) + 1,
    createdAt: new Date(),
    status: 'aktiv'
  };
  
  maengel.push(newMangel);
  res.status(201).json(newMangel);
});

// PUT /api/maengel/:id - Mängelmeldung aktualisieren
router.put('/:id', getSyncToken, (req, res) => {
  const id = parseInt(req.params.id);
  const mangelIndex = maengel.findIndex(m => m.id === id);
  
  if (mangelIndex !== -1) {
    const updatedMangel = {
      ...maengel[mangelIndex],
      ...req.body,
      id: id, // ID sollte nicht geändert werden
      updatedAt: new Date()
    };
    
    maengel[mangelIndex] = updatedMangel;
    res.json(updatedMangel);
  } else {
    res.status(404).json({ message: 'Mängelmeldung nicht gefunden' });
  }
});

// DELETE /api/maengel/:id - Mängelmeldung löschen
router.delete('/:id', getSyncToken, (req, res) => {
  const id = parseInt(req.params.id);
  const mangelIndex = maengel.findIndex(m => m.id === id);
  
  if (mangelIndex !== -1) {
    const deletedMangel = maengel[mangelIndex];
    maengel = maengel.filter(m => m.id !== id);
    res.json(deletedMangel);
  } else {
    res.status(404).json({ message: 'Mängelmeldung nicht gefunden' });
  }
});

export default router;
