import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from 'cors';

import seoRoutes from './routes/seoRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
// import themeRoutes from './routes/themeRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import listingRoutes from './routes/listingRoutes.js'
import agentRoutes from './routes/agentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
 import homepageRoute from './routes/homepageRoute.js';
 import leadRoutes from './routes/leadRoutes.js'
// import userRoutes from './routes/userRoutes.js';

dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const app = express();

const allowedOrigins = [
  "http://localhost:3000", // for dev
  "https://kw-saudi-admin-dashboard-x75g.vercel.app" // for Vercel frontend
];

// Configure CORS to allow requests from frontend
// app.use(cors({
//   origin: ['http://localhost:3000', "https://kw-saudi-admin-dashboard-x75g.vercel.app"],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.get('/',(req, res)=>{
  res.send("backend Working Fine")
})

// Test endpoint for authentication
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});
// Routes
app.use('/api', authRoutes);
app.use('/api', seoRoutes);
app.use('/api', pageRoutes);
// app.use('/api', themeRoutes);
app.use('/api', blogRoutes);
app.use('/api', newsRoutes);
app.use('/api', eventRoutes);
app.use('/api', homepageRoute)
app.use('/api', listingRoutes);
app.use('/api', agentRoutes);
app.use('/api', leadRoutes);

app.use("/api/employee", employeeRoutes);

// app.use('/api', userRoutes);
app.use('/uploads', express.static('uploads')); // serve images


app.options("*", cors());
// Start server even if MongoDB is not available (for testing)
const startServer = () => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
};

// Try to connect to MongoDB, but don't fail if it's not available
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      startServer();
    })
    .catch((err) => {
      console.warn('MongoDB connection failed, starting server without database:', err.message);
      console.log('Note: Authentication features will not work without database connection');
      startServer();
    });
} else {
  console.log('No MongoDB URI provided, starting server without database');
  startServer();
}

  