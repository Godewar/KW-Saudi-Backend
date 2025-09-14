import express from 'express';
import {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getUpcomingEvents,
  getEventsByTeam,
  getEventsByLocation
} from '../controllers/eventController.js';

import upload from '../middlewares/upload.js';

const router = express.Router();

// Create event
router.post(
  '/event',
  upload.fields([
    { name: 'coverImage', maxCount: 1 }
  ]),
  createEvent
);

// Get all events
router.get('/events', getAllEvents);

// Get upcoming events
router.get('/events/upcoming', getUpcomingEvents);

// Get events by team
router.get('/events/team/:team', getEventsByTeam);

// Get events by location
router.get('/events/location/:location', getEventsByLocation);

// Get event by ID
router.get('/event/:id', getEventById);

// Update event by ID
router.put(
  '/event/:id',
  upload.fields([
    { name: 'coverImage', maxCount: 1 }
  ]),
  updateEvent
);

// Delete event by ID
router.delete('/event/:id', deleteEvent);

export default router;
