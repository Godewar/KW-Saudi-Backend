// import express from 'express';
// import {
//   createPage,
//   getAllPages,
//   getPageById,
//   getPageBySlug,
//   updatePageById,
//   updatePageBySlug,
//   deletePageById,
//   deletePageBySlug
// } from '../controllers/pageController.js';
// import upload from '../middlewares/upload.js';

// const router = express.Router();

// // GET ALL PAGES
// router.get('/pages', getAllPages);

// // CREATE
// router.post(
//   '/page',
//   upload.fields([
//     { name: 'backgroundImage', maxCount:1 }
//   ]),
//   createPage
// );

// // READ BY ID
// router.get('/page/:id', getPageById);

// // READ BY SLUG
// router.get('/page/slug/:slug', getPageBySlug);

// // UPDATE BY ID
// router.put(
//   '/page/:id',
//   upload.fields([
//     { name: 'backgroundImage', maxCount: 1 }
//   ]),
//   updatePageById
// );

// // UPDATE BY SLUG
// router.put(
//   '/page/slug/:slug',
//   upload.fields([
//     { name: 'backgroundImage', maxCount: 1 }
//   ]),
//   updatePageBySlug
// );

// // DELETE BY ID
// router.delete('/page/:id', deletePageById);

// // DELETE BY SLUG
// router.delete('/page/slug/:slug', deletePageBySlug);

// export default router;



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

// Static routes first
router.get('/pages', getAllPages);

router.post('/page/create', 
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 }
  ]), 
  createPage
);

// Slug-based routes (more specific)
router.get('/page/byslug/:slug', getPageBySlug);
router.put('/page/byslug/:slug',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 }
  ]),
  updatePageBySlug
);
router.delete('/page/byslug/:slug', deletePageBySlug);

// ID-based routes (less specific)
router.get('/page/:id', getPageById);
router.put('/page/:id',
  upload.fields([
    { name: 'backgroundImage', maxCount: 1 }
  ]),
  updatePageById
);
router.delete('/page/:id', deletePageById);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error',
    error: err.message 
  });
});

export default router;

