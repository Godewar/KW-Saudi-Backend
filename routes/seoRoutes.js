import express from 'express';
import {
  createSEO,
  getAllSEO,
  getSEOById,
  getSEOBySlug,
  updateSEO,
  createOrUpdateSEO,
  deleteSEO,
  deleteSEOBySlug
} from '../controllers/seoController.js';

const router = express.Router();

// GET ALL SEO ENTRIES
router.get('/seo', getAllSEO);

// CREATE SEO
router.post('/seo', createSEO);

// GET SEO BY ID
router.get('/seo/:id', getSEOById);

// GET SEO BY SLUG
router.get('/seo/slug/:slug', getSEOBySlug);

// UPDATE SEO BY ID
router.put('/seo/:id', updateSEO);

// CREATE OR UPDATE SEO BY SLUG
router.put('/seo/slug/:slug', createOrUpdateSEO);

// DELETE SEO BY ID
router.delete('/seo/:id', deleteSEO);

// DELETE SEO BY SLUG
router.delete('/seo/slug/:slug', deleteSEOBySlug);

export default router;