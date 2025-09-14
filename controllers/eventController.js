import Event from '../models/Event.js';

// Create event
export const createEvent = async (req, res) => {
  try {
    console.log('Creating event with body:', req.body);
    console.log('Files:', req.files);
    
    const {
      title,
      subtitle,
      startDate,
      endDate,
      sessions,
      time,
      location,
      cost,
      presentedBy,
      team,
      description,
      audience,
      contactEmail
    } = req.body;

    const coverImage = req.files?.coverImage?.[0]?.path;

    // Validate and parse sessions
    let parsedSessions = [];
    if (sessions) {
      try {
        parsedSessions = typeof sessions === 'string' ? JSON.parse(sessions) : sessions;
        // Ensure sessions is an array
        if (!Array.isArray(parsedSessions)) {
          parsedSessions = [];
        }
      } catch (error) {
        console.log('Error parsing sessions:', error);
        parsedSessions = [];
      }
    }

    const event = new Event({
      title,
      subtitle,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      sessions: parsedSessions,
      time,
      location: location || 'Online',
      cost: cost || 'Free',
      presentedBy,
      team,
      coverImage,
      description,
      audience,
      contactEmail
    });

    const saved = await event.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
};

// Get all events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ startDate: 1, createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get event by ID
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get event' });
  }
};

// Update event by ID
export const updateEvent = async (req, res) => {
  try {
    console.log('Updating event with ID:', req.params.id);
    console.log('Update body:', req.body);
    console.log('Files:', req.files);
    
    const {
      title,
      subtitle,
      startDate,
      endDate,
      sessions,
      time,
      location,
      cost,
      presentedBy,
      team,
      description,
      audience,
      contactEmail
    } = req.body;

    const coverImage = req.files?.coverImage?.[0]?.path;

    // Validate and parse sessions for update
    let parsedSessions = undefined;
    if (sessions !== undefined) {
      try {
        parsedSessions = typeof sessions === 'string' ? JSON.parse(sessions) : sessions;
        // Ensure sessions is an array
        if (!Array.isArray(parsedSessions)) {
          parsedSessions = [];
        }
      } catch (error) {
        console.log('Error parsing sessions for update:', error);
        parsedSessions = [];
      }
    }

    const updateFields = {};
    if (title) updateFields.title = title;
    if (subtitle !== undefined) updateFields.subtitle = subtitle;
    if (startDate) updateFields.startDate = new Date(startDate);
    if (endDate !== undefined) updateFields.endDate = endDate ? new Date(endDate) : null;
    if (parsedSessions !== undefined) updateFields.sessions = parsedSessions;
    if (time !== undefined) updateFields.time = time;
    if (location !== undefined) updateFields.location = location;
    if (cost !== undefined) updateFields.cost = cost;
    if (presentedBy !== undefined) updateFields.presentedBy = presentedBy;
    if (team !== undefined) updateFields.team = team;
    if (description !== undefined) updateFields.description = description;
    if (audience !== undefined) updateFields.audience = audience;
    if (contactEmail !== undefined) updateFields.contactEmail = contactEmail;
    if (coverImage) updateFields.coverImage = coverImage;

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event', details: error.message });
  }
};

// Delete event by ID
export const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Event not found' });
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Get upcoming events
export const getUpcomingEvents = async (req, res) => {
  try {
    const currentDate = new Date();
    const upcomingEvents = await Event.find({ 
      startDate: { $gte: currentDate }
    }).sort({ startDate: 1 }).limit(10);
    res.status(200).json(upcomingEvents);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
};

// Get events by team
export const getEventsByTeam = async (req, res) => {
  try {
    const { team } = req.params;
    const events = await Event.find({ team })
      .sort({ startDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events by team' });
  }
};

// Get events by location
export const getEventsByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const events = await Event.find({ location })
      .sort({ startDate: 1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events by location' });
  }
};
