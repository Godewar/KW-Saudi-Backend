import express from 'express';
import {
  createPage,
  getAllPages,
  getPageById,
  getPageBySlug,
  updatePageById,
  updatePageBySlug,
  deletePageById,
  deletePageBySlug
} from '../controllers/pageController.js';
import upload from '../middlewares/upload.js';

const router = express.Router();

// GET ALL PAGES
router.get('/pages', getAllPages);

// CREATE
router.post(
  '/page',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 }
  ]),
  createPage
);

// READ BY ID
router.get('/page/:id', getPageById);

// READ BY SLUG
router.get('/page/slug/:slug', getPageBySlug);

// UPDATE BY ID
router.put(
  '/page/:id',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 }
  ]),
  updatePageById
);

// UPDATE BY SLUG
router.put(
  '/page/slug/:slug',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 }
  ]),
  updatePageBySlug
);

// DELETE BY ID
router.delete('/page/:id', deletePageById);

// DELETE BY SLUG
router.delete('/page/slug/:slug', deletePageBySlug);

export default router;