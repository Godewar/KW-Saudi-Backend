import express from 'express';
import {
  getExternalListings,
  getPropertyById, getFilteredListings
} from '../controllers/listingController.js';
import upload  from '../middlewares/upload.js';

const router = express.Router();


router.post('/list/properties',  getExternalListings);
router.get('/property/:id', getPropertyById);


router.get('/property/newdevelopment/:id', getFilteredListings)

export default router;
