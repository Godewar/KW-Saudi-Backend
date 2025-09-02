import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/auth/register', registerAdmin);
router.post('/auth/login', loginAdmin);

// Protected routes
router.get('/auth/profile', protect, getAdminProfile);
router.put('/auth/profile', protect, updateAdminProfile);
router.put('/auth/change-password', protect, changePassword);

export default router;
