import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorMiddleware, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import contentVersionRoutes from './routes/contentVersionRoutes.js';

const app = express();
const allowedOrigins = Array.isArray(env.clientOrigin) ? env.clientOrigin : [env.clientOrigin];

function normalizeOrigin(origin) {
  try {
    const url = new URL(origin);
    const hostname = url.hostname === '127.0.0.1' ? 'localhost' : url.hostname;
    return `${url.protocol}//${hostname}${url.port ? `:${url.port}` : ''}`.replace(/\/$/, '');
  } catch {
    return origin.replace(/\/$/, '');
  }
}

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const allowedOriginList = allowedOrigins.map((entry) => normalizeOrigin(entry));

      if (allowedOriginList.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', skillRoutes);
app.use('/api', experienceRoutes);
app.use('/api', educationRoutes);
app.use('/api', projectRoutes);
app.use('/api', contactRoutes);
app.use('/api', resumeRoutes);
app.use('/api', mediaRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', contentVersionRoutes);

app.use(notFound);
app.use(errorMiddleware);

export default app;
