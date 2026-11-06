import express from 'express';
import { getUsers, getUserByEmail, getUserById, createUser } from '../db.js';

const router = express.Router();

// Helper middleware to get actor from request
export function getActorFromReq(req) {
  const userId = req.headers['x-user-id'] || req.query.actorId;
  if (!userId) return null;
  return getUserById(userId);
}

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'College email and password are required.' });
    }

    const user = getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please check your credentials or register.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid password. For demo accounts, check the documented demo credentials.' });
    }

    const { password: _, ...safeUser } = user;
    return res.json({
      message: 'Login successful',
      user: safeUser,
      token: `demo-token-${safeUser.id}`
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, department, year } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full student name is required.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'A valid college email address is required (e.g. yourname@campus.edu).' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters long.' });
    }

    const newUser = createUser({
      name: name.trim(),
      email: email.trim(),
      password,
      department: department ? department.trim() : 'Computer Science & Engineering',
      year: year || '1st Year',
      role: 'student'
    });

    return res.status(201).json({
      message: 'Registration successful. Welcome to Campus Resource Sharing!',
      user: newUser,
      token: `demo-token-${newUser.id}`
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const actor = getActorFromReq(req);
  if (!actor) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  return res.json({ user: actor });
});

// GET /api/auth/demo-users
router.get('/demo-users', (req, res) => {
  const users = getUsers();
  return res.json({ users });
});

export default router;
