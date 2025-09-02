import express from 'express';
import {
  createTheme,
  getAllThemes,
  getThemeBySlug,
  updateTheme,
  deleteTheme,
} from '../controllers/themeController';

const router = express.Router();

router.post('/themes', createTheme);
router.get('/themes', getAllThemes);
router.get('/themes/:slug', getThemeBySlug);
router.put('/themes/:slug', updateTheme);
router.delete('/themes/:slug', deleteTheme);

export default router;
