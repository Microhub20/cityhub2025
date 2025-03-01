import { Router, Request, Response } from 'express';

const router = Router();

// Get all maengel reports
router.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Alle Mängelmeldungen abgerufen',
    items: [
      { 
        id: 1, 
        title: 'Prelitz - Straßenbeleuchtung defekt', 
        location: 'Prelitz',
        status: 'aktiv',
        createdAt: new Date('2023-06-15')
      },
      { 
        id: 2, 
        title: 'Gulli verschmiert', 
        location: '95359 Kasendorf Simonweg',
        status: 'aktiv',
        createdAt: new Date('2023-06-18')
      }
    ]
  });
});

// Get maengel by ID
router.get('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  res.json({ 
    message: `Mängelmeldung mit ID: ${id} abgerufen`,
    item: { 
      id: parseInt(id), 
      title: 'Beispiel Mängelmeldung', 
      location: 'Testort',
      status: 'aktiv',
      createdAt: new Date()
    }
  });
});

// Create new maengel
router.post('/', (req: Request, res: Response) => {
  const maengel = req.body;
  res.status(201).json({ 
    message: 'Mängelmeldung erstellt', 
    maengel: { 
      ...maengel, 
      id: Math.floor(Math.random() * 1000) + 1,
      createdAt: new Date()
    } 
  });
});

// Update maengel
router.put('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  const maengel = req.body;
  res.json({ 
    message: `Mängelmeldung mit ID: ${id} aktualisiert`, 
    maengel: { 
      ...maengel, 
      id: parseInt(id),
      updatedAt: new Date()
    } 
  });
});

// Delete maengel
router.delete('/:id', (req: Request, res: Response) => {
  const id = req.params.id;
  res.json({ message: `Mängelmeldung mit ID: ${id} gelöscht` });
});

export default router;