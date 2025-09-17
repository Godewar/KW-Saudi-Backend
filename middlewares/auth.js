import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const authenticateAdmin = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie or Authorization header
    if (req.cookies.token) {
      token = req.cookies.token;
      console.log('Token found in cookies');
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in Authorization header');
    }

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded, admin ID:', decoded.id);
    
    // Get admin from token
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      console.log('Admin not found for token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Admin not found.'
      });
    }

    console.log('Admin authenticated:', admin.firstName, admin.lastName, 'Role:', admin.role);
    req.admin = admin;
    req.adminId = admin._id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};
