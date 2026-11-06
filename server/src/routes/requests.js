import express from 'express';
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  getRequestMessages,
  addRequestMessage
} from '../db.js';
import { getActorFromReq } from './auth.js';

const router = express.Router();

// GET /api/requests
router.get('/', (req, res) => {
  try {
    const actor = getActorFromReq(req);
    const list = getRequests(req.query, actor);
    return res.json({
      count: list.length,
      requests: list
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/requests/:id
router.get('/:id', (req, res) => {
  try {
    const request = getRequestById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    return res.json({ request });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/requests (Submit borrow request)
router.post('/', (req, res) => {
  try {
    const actor = getActorFromReq(req);
    if (!actor) {
      return res.status(401).json({ error: 'Please log in to submit a borrow request.' });
    }

    const { resourceId, days, startDate, notes } = req.body;

    if (!resourceId) {
      return res.status(400).json({ error: 'Target resource ID is required.' });
    }

    const duration = parseInt(days, 10);
    if (isNaN(duration) || duration < 1 || duration > 60) {
      return res.status(400).json({ error: 'Borrow duration must be between 1 and 60 days.' });
    }

    const request = createRequest(
      {
        resourceId,
        days: duration,
        startDate,
        notes
      },
      actor
    );

    return res.status(201).json({
      message: 'Borrow request submitted successfully! Pending lender approval.',
      request
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/status (Transition request status)
router.patch('/:id/status', (req, res) => {
  try {
    const actor = getActorFromReq(req);
    if (!actor) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Target status is required.' });
    }

    const result = updateRequestStatus(req.params.id, status, actor);
    return res.json({
      message: `Request status transitioned to "${status}" successfully.`,
      request: result.request,
      resource: result.resource
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/requests/:id/messages (Get chat history for request)
router.get('/:id/messages', (req, res) => {
  try {
    const actor = getActorFromReq(req);
    if (!actor) {
      return res.status(401).json({ error: 'Authentication required to view messages.' });
    }

    const messages = getRequestMessages(req.params.id, actor);
    return res.json({ messages });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// POST /api/requests/:id/messages (Send message to coordinate handover)
router.post('/:id/messages', (req, res) => {
  try {
    const actor = getActorFromReq(req);
    if (!actor) {
      return res.status(401).json({ error: 'Authentication required to send messages.' });
    }

    const { text } = req.body;
    const result = addRequestMessage(req.params.id, { text }, actor);
    return res.status(201).json({
      message: 'Message sent successfully',
      newMessage: result.message,
      allMessages: result.allMessages
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

export default router;
