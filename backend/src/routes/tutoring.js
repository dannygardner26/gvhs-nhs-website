const express = require('express');
const { body, validationResult } = require('express-validator');
const Tutor = require('../models/Tutor');
const TutoringRequest = require('../models/TutoringRequest');

const router = express.Router();

// GET /api/tutoring/tutors - Get all active tutors
router.get('/tutors', async (req, res) => {
  try {
    const { subject, grade } = req.query;
    let query = { isActive: true, isApproved: true };

    // Filter by subject if specified
    if (subject) {
      query.subjects = { $in: [new RegExp(subject, 'i')] };
    }

    // Filter by grade if specified
    if (grade) {
      query.grade = parseInt(grade);
    }

    const tutors = await Tutor.find(query)
      .sort({ name: 1 })
      .select('-phone -email'); // Hide contact info for public view

    res.json(tutors);
  } catch (error) {
    console.error('Error fetching tutors:', error);
    res.status(500).json({ error: 'Failed to fetch tutors' });
  }
});

// GET /api/tutoring/subjects - Get all available subjects
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await Tutor.distinct('subjects', { isActive: true, isApproved: true });
    res.json(subjects.sort());
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// POST /api/tutoring/request - Submit tutoring request
router.post('/request', [
  body('studentName').notEmpty().trim().withMessage('Student name is required'),
  body('studentEmail').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('studentGrade').isInt({ min: 9, max: 12 }).withMessage('Grade must be between 9 and 12'),
  body('subject').notEmpty().trim().withMessage('Subject is required'),
  body('preferredTime').notEmpty().withMessage('Preferred time is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestData = {
      studentName: req.body.studentName,
      studentEmail: req.body.studentEmail,
      studentGrade: parseInt(req.body.studentGrade),
      subject: req.body.subject,
      specificTopic: req.body.specificTopic || '',
      preferredTime: req.body.preferredTime,
      urgency: req.body.urgency || 'medium',
      message: req.body.message || ''
    };

    const tutoringRequest = new TutoringRequest(requestData);
    await tutoringRequest.save();

    res.status(201).json({
      message: 'Tutoring request submitted successfully',
      requestId: tutoringRequest._id
    });
  } catch (error) {
    console.error('Error creating tutoring request:', error);
    res.status(500).json({ error: 'Failed to submit tutoring request' });
  }
});

// POST /api/tutoring/tutor/register - Register as a tutor
router.post('/tutor/register', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('grade').isInt({ min: 9, max: 12 }).withMessage('Grade must be between 9 and 12'),
  body('subjects').isArray({ min: 1 }).withMessage('At least one subject is required'),
  body('subjects.*').notEmpty().trim().withMessage('Subject cannot be empty')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if tutor already exists
    const existingTutor = await Tutor.findOne({ email: req.body.email });
    if (existingTutor) {
      return res.status(400).json({ error: 'A tutor with this email already exists' });
    }

    const tutorData = {
      name: req.body.name,
      email: req.body.email,
      grade: parseInt(req.body.grade),
      subjects: req.body.subjects,
      availability: req.body.availability || {},
      timeSlots: req.body.timeSlots || [],
      bio: req.body.bio || '',
      contactMethod: req.body.contactMethod || 'email',
      phone: req.body.phone || '',
      isApproved: false // Requires admin approval
    };

    const tutor = new Tutor(tutorData);
    await tutor.save();

    res.status(201).json({
      message: 'Tutor registration submitted successfully. Pending approval.',
      tutorId: tutor._id
    });
  } catch (error) {
    console.error('Error registering tutor:', error);
    res.status(500).json({ error: 'Failed to register tutor' });
  }
});

// GET /api/tutoring/requests - Get all tutoring requests (admin only - placeholder)
router.get('/requests', async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const requests = await TutoringRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('assignedTutor', 'name subjects');

    res.json(requests);
  } catch (error) {
    console.error('Error fetching tutoring requests:', error);
    res.status(500).json({ error: 'Failed to fetch tutoring requests' });
  }
});

// Sample data endpoint for development
router.post('/seed', async (req, res) => {
  try {
    // Clear existing data
    await Tutor.deleteMany({});
    await TutoringRequest.deleteMany({});

    const sampleTutors = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@student.gvhs.edu',
        grade: 12,
        subjects: ['Mathematics', 'Algebra II', 'Pre-Calculus'],
        availability: {
          monday: true,
          wednesday: true,
          friday: true
        },
        timeSlots: [
          { day: 'monday', startTime: '3:30 PM', endTime: '4:30 PM' },
          { day: 'wednesday', startTime: '3:30 PM', endTime: '4:30 PM' },
          { day: 'friday', startTime: '3:30 PM', endTime: '4:30 PM' }
        ],
        bio: 'I love helping students understand math concepts and have been tutoring for 2 years.',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Michael Chen',
        email: 'michael.c@student.gvhs.edu',
        grade: 11,
        subjects: ['Chemistry', 'Biology', 'Physics'],
        availability: {
          tuesday: true,
          thursday: true
        },
        timeSlots: [
          { day: 'tuesday', startTime: '3:45 PM', endTime: '4:45 PM' },
          { day: 'thursday', startTime: '3:45 PM', endTime: '4:45 PM' }
        ],
        bio: 'Science enthusiast with a passion for making complex topics easy to understand.',
        isApproved: true,
        isActive: true
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.r@student.gvhs.edu',
        grade: 12,
        subjects: ['English Literature', 'Writing', 'History'],
        availability: {
          monday: true,
          tuesday: true,
          wednesday: true
        },
        timeSlots: [
          { day: 'monday', startTime: '4:00 PM', endTime: '5:00 PM' },
          { day: 'tuesday', startTime: '4:00 PM', endTime: '5:00 PM' },
          { day: 'wednesday', startTime: '4:00 PM', endTime: '5:00 PM' }
        ],
        bio: 'Experienced in essay writing and literary analysis. Happy to help with any English needs!',
        isApproved: true,
        isActive: true
      },
      {
        name: 'David Kim',
        email: 'david.k@student.gvhs.edu',
        grade: 11,
        subjects: ['Computer Science', 'Programming', 'Web Development'],
        availability: {
          friday: true,
          saturday: true
        },
        timeSlots: [
          { day: 'friday', startTime: '4:00 PM', endTime: '6:00 PM' },
          { day: 'saturday', startTime: '10:00 AM', endTime: '12:00 PM' }
        ],
        bio: 'Coding since middle school. Can help with Python, JavaScript, and basic web development.',
        isApproved: true,
        isActive: true
      }
    ];

    await Tutor.insertMany(sampleTutors);

    res.json({
      message: 'Sample tutoring data created successfully',
      tutorsCount: sampleTutors.length
    });
  } catch (error) {
    console.error('Error seeding tutoring data:', error);
    res.status(500).json({ error: 'Failed to seed tutoring data' });
  }
});

module.exports = router;