import express from 'express';
import {
  createBlog,
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  updateBlogBySlug,
  deleteBlog,
  deleteBlogBySlug
} from '../controllers/blogController.js';

import upload from '../middlewares/upload.js';

const router = express.Router();

// Upload coverImage, contentImage, and multiple additionalImages
router.post(
  '/blog',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 10 } // Allow up to 10 additional images
  ]),
  createBlog
);

// Get all blogs
router.get('/blogs', getAllBlogs);

// Get blog by ID
router.get('/blog/:id', getBlogById);

// Get blog by slug
router.get('/blog/slug/:slug', getBlogBySlug);

// Update blog by ID
router.put(
  '/blog/:id',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 10 } // Allow up to 10 additional images
  ]),
  updateBlog
);

// Update blog by slug
router.put('/blog/slug/:slug', updateBlogBySlug);

// Delete blog by ID
router.delete('/blog/:id', deleteBlog);

// Delete blog by slug
router.delete('/blog/slug/:slug', deleteBlogBySlug);

export default router;
