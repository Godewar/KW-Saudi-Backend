import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Route imports
import authRoutes from './routes/authRoutes.js';
import seoRoutes from './routes/seoRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import homepageRoute from './routes/homepageRoute.js';
import leadRoutes from './routes/leadRoutes.js';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const app = express();

// UPDATED CORS FIX - Keep your existing structure but fix CORS
app.use((req, res, next) => {
  // Always set these headers for every request
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '3600');

  // Handle preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for:', req.url);
    return res.status(200).end();
  }
  
  console.log(`${req.method} ${req.url} from origin: ${req.headers.origin}`);
  next();
});

// Body parsing middleware BEFORE routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Test endpoint to verify server is working
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: "KW Admin Backend is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Test CORS endpoint
app.get('/api/test-cors', (req, res) => {
  res.status(200).json({ 
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', seoRoutes);
app.use('/api', pageRoutes);
app.use('/api', blogRoutes);
app.use('/api', newsRoutes);
app.use('/api', eventRoutes);
app.use('/api', homepageRoute);
app.use('/api', listingRoutes);
app.use('/api', agentRoutes);
app.use('/api', leadRoutes);
app.use('/api/employee', employeeRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handling
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected successfully');
      return true;
    } else {
      console.log('⚠️ No MongoDB URI provided');
      return false;
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

// Start server
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  
  try {
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Server URL: https://kw-saudi-backend-4.onrender.com`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close();
  process.exit(0);
});