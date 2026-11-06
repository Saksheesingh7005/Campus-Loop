import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import authRoutes from './routes/auth.js';
import resourceRoutes from './routes/resources.js';
import requestRoutes from './routes/requests.js';
import statsRoutes from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize JSON database
initDB();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    project: 'Campus Resource Sharing Prototype',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Campus Resource Sharing API',
    status: 'active',
    health: '/api/health',
    resources: '/api/resources',
    stats: '/api/stats'
  });
});

// Global 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `Endpoint ${req.originalUrl} not found.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  Campus Resource Sharing API Server Running       `);
  console.log(`  URL: http://localhost:${PORT}                      `);
  console.log(`  Health: http://localhost:${PORT}/api/health        `);
  console.log(`===================================================`);
});
