import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  changePassword,
  logoutAdmin,
  setUserRoleAndPermissions,
  getAllAdmins,
  updateAdmin,
  deleteAdmin
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Admin: update and delete user
router.put('/user/:id', protect, authorizeRoles('admin'), updateAdmin);
router.delete('/user/:id', protect, authorizeRoles('admin'), deleteAdmin);

// Admin: get all users (admin, subadmin, user)
router.get('/all-users', protect, authorizeRoles('admin'), getAllAdmins);

// Public routes
router.post('/register', protect, authorizeRoles('admin'), registerAdmin);

 router.post('/login', loginAdmin);


router.post('/logout', logoutAdmin);


// Protected routes
router.get('/profile', protect, getAdminProfile);
router.put('/profile', protect, updateAdminProfile);
router.put('/change-password', protect, changePassword);

// Admin: set user role and permissions
router.put('/set-role', protect, authorizeRoles('admin'), setUserRoleAndPermissions);

export default router;
