import express from 'express';
import {
  getExternalListings
} from '../controllers/listingController.js';
import upload  from '../middlewares/upload.js';

const router = express.Router();


router.post('/list/properties',  getExternalListings);

export default router;
