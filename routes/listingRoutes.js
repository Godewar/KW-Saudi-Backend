import express from 'express';
import {
  getExternalListings,
  getPropertyById, getFilteredListings
} from '../controllers/listingController.js';
import upload  from '../middlewares/upload.js';

const router = express.Router();


router.post('listings/list/properties',  getExternalListings);
router.get('listings/property/:id', getPropertyById);


router.get('listings/property/newdevelopment/:id', getFilteredListings)

export default router;
