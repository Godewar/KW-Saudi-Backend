import express from 'express';
import {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  getNewsByCategory
} from '../controllers/newsController.js';

import upload from '../middlewares/upload.js';

const router = express.Router();

// Create news
router.post(
  '/news',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 10 }
  ]),
  createNews
);

// Get all news
router.get('/news', getAllNews);

// Get news by category
router.get('/news/category/:category', getNewsByCategory);

// Get news by ID
router.get('/news/:id', getNewsById);

// Update news by ID
router.put(
  '/news/:id',
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'contentImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 10 }
  ]),
  updateNews
);

// Delete news by ID
router.delete('/news/:id', deleteNews);

export default router;
