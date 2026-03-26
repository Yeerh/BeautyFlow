import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Mock database
const barbers = [
  {
    id: '1',
    name: 'Barbeiro 1',
    services: [
      { id: '1', name: 'Corte de Cabelo', price: 30 },
      { id: '2', name: 'Barba', price: 20 },
    ],
  },
];

const links = {};

// Generate unique link for barber
router.post('/generate-link', (req, res) => {
  const { barberId } = req.body;
  const barber = barbers.find((b) => b.id === barberId);

  if (!barber) {
    return res.status(404).json({ message: 'Barber not found' });
  }

  const linkId = uuidv4();
  links[linkId] = barber;

  res.json({ link: `https://example.com/services/${linkId}` });
});

// Fetch services by link
router.get('/services/:linkId', (req, res) => {
  const { linkId } = req.params;
  const barber = links[linkId];

  if (!barber) {
    return res.status(404).json({ message: 'Link not found' });
  }

  res.json({ barber });
});

export default router;