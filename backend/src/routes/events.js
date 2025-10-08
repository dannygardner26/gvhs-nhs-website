const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');

const router = express.Router();

// GET /api/events - Get all public events
router.get('/', async (req, res) => {
  try {
    const { type, upcoming } = req.query;
    let query = { isPublic: true };

    // Filter by event type if specified
    if (type) {
      query.type = type;
    }

    // Filter for upcoming events if specified
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .populate('createdBy', 'name email');

    // Format events for FullCalendar
    const formattedEvents = events.map(event => ({
      id: event._id,
      title: event.title,
      start: event.date,
      description: event.description,
      location: event.location,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      maxAttendees: event.maxAttendees,
      attendeesCount: event.attendees ? event.attendees.length : 0
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id - Get specific event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events - Create new event (admin only - placeholder for now)
router.post('/', [
  body('title').notEmpty().trim().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('location').notEmpty().trim().withMessage('Location is required'),
  body('type').isIn(['meeting', 'volunteer', 'tutoring', 'social', 'service']).withMessage('Invalid event type')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      title: req.body.title,
      description: req.body.description,
      date: new Date(req.body.date),
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      location: req.body.location,
      type: req.body.type || 'meeting',
      isPublic: req.body.isPublic !== false,
      maxAttendees: req.body.maxAttendees || null
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event: event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Sample data endpoint for development
router.post('/seed', async (req, res) => {
  try {
    // Clear existing events
    await Event.deleteMany({});

    const sampleEvents = [
      {
        title: 'NHS Monthly Meeting',
        description: 'Regular monthly meeting for all NHS members. We will discuss upcoming service projects and member requirements.',
        date: new Date('2024-11-15T15:30:00'),
        startTime: '3:30 PM',
        endTime: '4:30 PM',
        location: 'Room 201',
        type: 'meeting',
        isPublic: true
      },
      {
        title: 'Community Food Drive',
        description: 'Help us collect food donations for local families in need. Bring non-perishable items.',
        date: new Date('2024-11-22T09:00:00'),
        startTime: '9:00 AM',
        endTime: '2:00 PM',
        location: 'School Entrance',
        type: 'service',
        isPublic: true
      },
      {
        title: 'Tutoring Session - Math',
        description: 'Free tutoring for Algebra and Geometry. All students welcome.',
        date: new Date('2024-11-18T15:45:00'),
        startTime: '3:45 PM',
        endTime: '4:45 PM',
        location: 'Library',
        type: 'tutoring',
        isPublic: true
      },
      {
        title: 'Holiday Social Event',
        description: 'End of semester celebration for NHS members and their families.',
        date: new Date('2024-12-20T18:00:00'),
        startTime: '6:00 PM',
        endTime: '8:00 PM',
        location: 'School Auditorium',
        type: 'social',
        isPublic: true
      }
    ];

    await Event.insertMany(sampleEvents);
    res.json({ message: 'Sample events created successfully', count: sampleEvents.length });
  } catch (error) {
    console.error('Error seeding events:', error);
    res.status(500).json({ error: 'Failed to seed events' });
  }
});

module.exports = router;