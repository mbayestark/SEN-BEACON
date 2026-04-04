import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import env, { isDevelopment } from './config/environement';
import connectDB from './config/database';
import { sessionConfig } from './config/session';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { startScheduledJobs } from './jobs/scheduler';

const app = express();

app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionConfig);

if (isDevelopment) {
  app.use(logger);
}

connectDB().then(() => {
  startScheduledJobs();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Hackathon Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`API available at http://localhost:${env.PORT}/api`);
});
