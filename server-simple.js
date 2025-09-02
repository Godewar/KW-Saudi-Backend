import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// In-memory storage for testing (replace with database in production)
const admins = [];
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!', 
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if admin already exists
    const existingAdmin = admins.find(admin => 
      admin.email === email || admin.phoneNumber === phoneNumber
    );

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email or phone number already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin
    const newAdmin = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    };

    admins.push(newAdmin);

    // Generate token
    const token = jwt.sign({ id: newAdmin.id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Remove password from response
    const { password: _, ...adminData } = newAdmin;

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      Token: token,
      admin: adminData
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    // Validation
    if (!phoneNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password are required'
      });
    }

    // Find admin by phone number
    const admin = admins.find(a => a.phoneNumber === phoneNumber);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if admin is active
    if (!admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    admin.lastLogin = new Date();

    // Generate token
    const token = jwt.sign({ id: admin.id }, JWT_SECRET, {
      expiresIn: '7d'
    });

    // Remove password from response
    const { password: _, ...adminData } = admin;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      Token: token,
      admin: adminData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Profile endpoint (protected)
app.get('/api/auth/profile', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find admin
    const admin = admins.find(a => a.id === decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }

    // Remove password from response
    const { password: _, ...adminData } = admin;

    res.status(200).json({
      success: true,
      admin: adminData
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid'
    });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Register endpoint: http://localhost:${PORT}/api/auth/register`);
  console.log(`Login endpoint: http://localhost:${PORT}/api/auth/login`);
});
