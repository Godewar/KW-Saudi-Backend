import express from 'express';
import {
  register,
  login,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  logout,
  setUserRoleAndPermissions,
  getAllAdmins,
  updateAdmin,
  deleteAdmin,
} from '../controllers/authController.js';
import { authenticateAdmin } from '../middlewares/auth.js';
import Admin from '../models/Admin.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  console.log('Checking admin role for user:', req.admin?.role);
  if (!req.admin || req.admin.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
  next();
};

// Public routes
router.post('/login', login);

// Protected routes
router.post('/logout', authenticateAdmin, logout);
router.get('/profile', authenticateAdmin, getAdminProfile);
router.put('/profile', authenticateAdmin, updateAdminProfile);
router.put('/change-password', authenticateAdmin, changePassword);

// Admin-only routes
router.post('/register', authenticateAdmin, requireAdmin, register);
router.get('/all-users', authenticateAdmin, requireAdmin, getAllAdmins);
router.put('/user/:id', authenticateAdmin, requireAdmin, updateAdmin);
router.delete('/user/:id', authenticateAdmin, requireAdmin, deleteAdmin);
router.put('/set-role', authenticateAdmin, requireAdmin, setUserRoleAndPermissions);

// Debug routes
router.get('/debug/admins', async (req, res) => {
  try {
    const admins = await Admin.find({}).select('firstName lastName phoneNumber email role isActive createdAt');
    res.json({
      success: true,
      count: admins.length,
      admins
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post('/debug/create-test-admin', async (req, res) => {
  try {
    // Fixed: Use consistent phone number
    const testPhoneNumber = '9552567681';
    
    // Check if test admin already exists
    const existingAdmin = await Admin.findOne({ phoneNumber: testPhoneNumber });
    if (existingAdmin) {
      return res.json({
        success: true,
        message: 'Test admin already exists',
        admin: {
          phoneNumber: existingAdmin.phoneNumber,
          firstName: existingAdmin.firstName,
          lastName: existingAdmin.lastName,
          role: existingAdmin.role
        }
      });
    }

    // Create test admin with consistent phone number
    const testAdmin = new Admin({
      firstName: 'Test',
      lastName: 'Admin',
      email: 'test@admin.com',
      phoneNumber: testPhoneNumber, // Fixed: Use same phone number
      password: '123456',
      role: 'admin'
    });

    await testAdmin.save();

    res.json({
      success: true,
      message: 'Test admin created successfully',
      admin: {
        phoneNumber: testAdmin.phoneNumber,
        firstName: testAdmin.firstName,
        lastName: testAdmin.lastName,
        role: testAdmin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Check current user route
router.get('/me', authenticateAdmin, (req, res) => {
  res.json({
    success: true,
    admin: {
      id: req.admin._id,
      firstName: req.admin.firstName,
      lastName: req.admin.lastName,
      phoneNumber: req.admin.phoneNumber,
      email: req.admin.email,
      role: req.admin.role,
      isActive: req.admin.isActive
    }
  });
});

export default router;
