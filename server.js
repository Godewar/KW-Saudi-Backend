// import express from 'express';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import cookieParser from 'cookie-parser';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// import cors from 'cors';

// import seoRoutes from './routes/seoRoutes.js';
// import pageRoutes from './routes/pageRoutes.js';
// // import themeRoutes from './routes/themeRoutes.js';
// import blogRoutes from './routes/blogRoutes.js';
// import newsRoutes from './routes/newsRoutes.js';
// import eventRoutes from './routes/eventRoutes.js';
// import listingRoutes from './routes/listingRoutes.js'
// import agentRoutes from './routes/agentRoutes.js';
// import authRoutes from './routes/authRoutes.js';
// import employeeRoutes from './routes/employeeRoutes.js';
//  import homepageRoute from './routes/homepageRoute.js';
//  import leadRoutes from './routes/leadRoutes.js'
// // import userRoutes from './routes/userRoutes.js';

// dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

// const app = express();

// const allowedOrigins = [
//   "http://localhost:3000", // for dev
//   "https://kw-saudi-admin-dashboard-x75g.vercel.app" // for Vercel frontend
// ];

// // Configure CORS to allow requests from frontend
// // app.use(cors({
// //   origin: ['http://localhost:3000', "https://kw-saudi-admin-dashboard-x75g.vercel.app"],
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));

// app.use(cors({
//   origin: allowedOrigins,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));

// app.use(express.json());
// app.use(cookieParser());


// app.get('/',(req, res)=>{
//   res.send("backend Working Fine")
// })

// // Test endpoint for authentication
// app.get('/api/test', (req, res) => {
//   res.json({ 
//     message: 'Backend is working!', 
//     timestamp: new Date().toISOString(),
//     status: 'success'
//   });
// });
// // Routes
// app.use('/api', authRoutes);
// app.use('/api', seoRoutes);
// app.use('/api', pageRoutes);
// // app.use('/api', themeRoutes);
// app.use('/api', blogRoutes);
// app.use('/api', newsRoutes);
// app.use('/api', eventRoutes);
// app.use('/api', homepageRoute)
// app.use('/api', listingRoutes);
// app.use('/api', agentRoutes);
// app.use('/api', leadRoutes);

// app.use("/api/employee", employeeRoutes);

// // app.use('/api', userRoutes);
// app.use('/uploads', express.static('uploads')); // serve images


// app.options("*", cors());
// // Start server even if MongoDB is not available (for testing)
// const startServer = () => {
//   app.listen(process.env.PORT || 5000, () => {
//     console.log(`Server running on port ${process.env.PORT || 5000}`);
//   });
// };

// // Try to connect to MongoDB, but don't fail if it's not available
// if (process.env.MONGO_URI) {
//   mongoose.connect(process.env.MONGO_URI)
//     .then(() => {
//       console.log('MongoDB connected');
//       startServer();
//     })
//     .catch((err) => {
//       console.warn('MongoDB connection failed, starting server without database:', err.message);
//       console.log('Note: Authentication features will not work without database connection');
//       startServer();
//     });
// } else {
//   console.log('No MongoDB URI provided, starting server without database');
//   startServer();
// }

  
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Route imports
import seoRoutes from './routes/seoRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import homepageRoute from './routes/homepageRoute.js';
import leadRoutes from './routes/leadRoutes.js';

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'config', 'config.env') });

const app = express();

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "https://kw-saudi-admin-dashboard-x75g.vercel.app",
  "https://kw-saudi-admin-dashboard-x75g-git-main-lokesh-godewars-projects.vercel.app"
];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: "Backend Working Fine",
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', seoRoutes);
app.use('/api', pageRoutes);
app.use('/api', blogRoutes);
app.use('/api', newsRoutes);
app.use('/api', eventRoutes);
app.use('/api', homepageRoute);
app.use('/api', listingRoutes);
app.use('/api', agentRoutes);
app.use('/api', leadRoutes);
app.use("/api/employee", employeeRoutes);

// Static files
app.use('/uploads', express.static('uploads'));

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MongoDB URI not provided');
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    if (retries > 0) {
      console.log(`MongoDB connection failed. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      return connectDB(retries - 1);
    }
    console.error('MongoDB connection failed after all retries:', error.message);
    return false;
  }
};

// Server startup
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  
  try {
    const isConnected = await connectDB();
    if (!isConnected) {
      console.warn('Starting server without database connection');
      console.log('Note: Some features may not work without database connection');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close();
  process.exit(0);
});