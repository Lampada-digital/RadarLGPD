import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { pool } from './database/pool';
import { authRoutes } from './routes/auth';
import { organizationRoutes } from './routes/organizations';
import { userRoutes } from './routes/users';
import { riskRoutes } from './routes/risks';
import { controlRoutes } from './routes/controls';
import { frameworkRoutes } from './routes/frameworks';
import { auditRoutes } from './routes/audits';
import { incidentRoutes } from './routes/incidents';
import { projectRoutes } from './routes/projects';
import { documentRoutes } from './routes/documents';
import { vendorRoutes } from './routes/vendors';
import { privacyRoutes } from './routes/privacy';
import { notificationRoutes } from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/controls', controlRoutes);
app.use('/api/frameworks', frameworkRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/privacy', privacyRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Radar GRC Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});
