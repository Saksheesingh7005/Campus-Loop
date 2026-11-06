import express from 'express';
import { getStats, resetToSeed } from '../db.js';

const router = express.Router();

// GET /api/stats
router.get('/', (req, res) => {
  try {
    const stats = getStats();
    return res.json({ stats });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/stats/reset
router.post('/reset', (req, res) => {
  try {
    const success = resetToSeed();
    if (success) {
      return res.json({ message: 'Prototype data successfully reset to initial seed values.' });
    }
    return res.status(500).json({ error: 'Could not reset seed data.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
