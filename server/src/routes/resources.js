import express from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource
} from '../db.js';
import { getActorFromReq } from './auth.js';

const router = express.Router();

// GET /api/resources
router.get('/', (req, res) => {
  try {
    const list = getResources(req.query);
    return res.json({
      count: list.length,
      resources: list
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/resources/:id
router.get('/:id', (req, res) => {
  try {
    const resource = getResourceById(req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found.' });
    }
    return res.json({ resource });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/resources (List new item)
router.post('/', (req, res) => {
  try {
    const actor = getActorFromReq(req);
    if (!actor) {
      return res.status(401).json({ error: 'Authentication required to list a resource.' });
    }

    const { name, category, condition, dailyPrice, location, description, terms, itemType } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Item name is required.' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Please select a valid category.' });
    }

    const newResource = createResource(
      {
        name,
        category,
        condition,
        dailyPrice: Number(dailyPrice) || 0,
        location,
        description,
        terms,
        itemType
      },
      actor
    );

    return res.status(201).json({
      message: 'Resource listed successfully on Campus Marketplace!',
      resource: newResource
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/resources/:id (Edit listing)
router.put('/:id', (req, res) => {
  try {
    const actor = getActorFromReq(req);
    if (!actor) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const updated = updateResource(req.params.id, req.body, actor);
    return res.json({
      message: 'Resource updated successfully.',
      resource: updated
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/resources/:id (Delete listing)
router.delete('/:id', (req, res) => {
  try {
    const actor = getActorFromReq(req);
    if (!actor) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const result = deleteResource(req.params.id, actor);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
