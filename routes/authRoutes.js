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
router.put('/auth/user/:id', protect, authorizeRoles('admin'), updateAdmin);
router.delete('/auth/user/:id', protect, authorizeRoles('admin'), deleteAdmin);

// Admin: get all users (admin, subadmin, user)
router.get('/auth/all-users', protect, authorizeRoles('admin'), getAllAdmins);

// Public routes
router.post('/auth/register', registerAdmin);
// router.post('/auth/login', loginAdmin);

app.post("/auth/login", (req, res) => {
  res.json({ message: "Login successful" });
});
router.post('/auth/logout', logoutAdmin);


// Protected routes
router.get('/auth/profile', protect, getAdminProfile);
router.put('/auth/profile', protect, updateAdminProfile);
router.put('/auth/change-password', protect, changePassword);

// Admin: set user role and permissions
router.put('/auth/set-role', protect, authorizeRoles('admin'), setUserRoleAndPermissions);

export default router;
