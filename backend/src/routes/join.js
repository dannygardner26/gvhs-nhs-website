const express = require('express');
const { body, validationResult } = require('express-validator');
const JoinRequest = require('../models/JoinRequest');

const router = express.Router();

// POST /api/join/request - Submit NHS membership application
router.post('/request', [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('grade').isInt({ min: 10, max: 12 }).withMessage('Grade must be between 10 and 12'),
  body('gpa').isFloat({ min: 0, max: 4.0 }).withMessage('GPA must be between 0 and 4.0'),
  body('leadershipExperience').notEmpty().withMessage('Leadership experience is required'),
  body('serviceHours').isInt({ min: 0 }).withMessage('Service hours must be a positive number'),
  body('serviceDescription').notEmpty().withMessage('Service description is required'),
  body('characterReference.teacherName').notEmpty().trim().withMessage('Teacher name is required'),
  body('characterReference.teacherEmail').isEmail().normalizeEmail().withMessage('Valid teacher email is required'),
  body('characterReference.relationship').notEmpty().withMessage('Relationship description is required'),
  body('personalStatement').notEmpty().withMessage('Personal statement is required'),
  body('whyJoinNHS').notEmpty().withMessage('Please explain why you want to join NHS')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if student has already applied
    const existingApplication = await JoinRequest.findOne({ email: req.body.email });
    if (existingApplication) {
      return res.status(400).json({
        error: 'An application with this email already exists',
        status: existingApplication.status
      });
    }

    const applicationData = {
      name: req.body.name,
      email: req.body.email,
      grade: parseInt(req.body.grade),
      gpa: parseFloat(req.body.gpa),
      phone: req.body.phone || '',
      leadershipExperience: req.body.leadershipExperience,
      serviceHours: parseInt(req.body.serviceHours),
      serviceDescription: req.body.serviceDescription,
      characterReference: {
        teacherName: req.body.characterReference.teacherName,
        teacherEmail: req.body.characterReference.teacherEmail,
        relationship: req.body.characterReference.relationship
      },
      personalStatement: req.body.personalStatement,
      whyJoinNHS: req.body.whyJoinNHS
    };

    const joinRequest = new JoinRequest(applicationData);
    await joinRequest.save();

    res.status(201).json({
      message: 'NHS membership application submitted successfully',
      applicationId: joinRequest._id,
      status: 'pending'
    });
  } catch (error) {
    console.error('Error creating join request:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// GET /api/join/requirements - Get NHS membership requirements
router.get('/requirements', (req, res) => {
  const requirements = {
    minimumGPA: 3.5,
    minimumGrade: 10,
    serviceHours: {
      sophomore: 20,
      junior: 30,
      senior: 40
    },
    requirements: [
      {
        pillar: 'Scholarship',
        description: 'Maintain a cumulative GPA of 3.5 or higher',
        details: [
          'Academic excellence in all subjects',
          'Consistent performance across semesters',
          'No failing grades in the current or previous semester'
        ]
      },
      {
        pillar: 'Leadership',
        description: 'Demonstrate leadership qualities in school and community',
        details: [
          'Student government participation',
          'Club officer positions',
          'Team captain roles',
          'Peer mentoring experience',
          'Initiative in group projects'
        ]
      },
      {
        pillar: 'Service',
        description: 'Complete required community service hours',
        details: [
          'Sophomores: Minimum 20 hours',
          'Juniors: Minimum 30 hours',
          'Seniors: Minimum 40 hours',
          'Service must benefit the community',
          'Documentation required for all service'
        ]
      },
      {
        pillar: 'Character',
        description: 'Exhibit exemplary character and citizenship',
        details: [
          'No major disciplinary actions',
          'Positive teacher recommendations',
          'Respectful behavior towards peers and staff',
          'Demonstration of NHS values',
          'Commitment to personal integrity'
        ]
      }
    ],
    applicationProcess: [
      {
        step: 1,
        title: 'Check Eligibility',
        description: 'Ensure you meet all minimum requirements for your grade level'
      },
      {
        step: 2,
        title: 'Complete Application',
        description: 'Fill out the comprehensive application form with detailed responses'
      },
      {
        step: 3,
        title: 'Submit Documentation',
        description: 'Provide service hour documentation and teacher reference information'
      },
      {
        step: 4,
        title: 'Application Review',
        description: 'Faculty council reviews your application (2-3 weeks)'
      },
      {
        step: 5,
        title: 'Interview Process',
        description: 'Selected candidates participate in an interview (if required)'
      },
      {
        step: 6,
        title: 'Final Decision',
        description: 'Receive notification of acceptance, rejection, or waitlist status'
      }
    ],
    importantDates: [
      {
        date: 'October 1',
        event: 'Application Period Opens'
      },
      {
        date: 'November 15',
        event: 'Application Deadline'
      },
      {
        date: 'December 1-15',
        event: 'Interview Period (if applicable)'
      },
      {
        date: 'January 15',
        event: 'Final Decisions Announced'
      },
      {
        date: 'February 1',
        event: 'Induction Ceremony'
      }
    ]
  };

  res.json(requirements);
});

// GET /api/join/applications - Get all applications (admin only - placeholder)
router.get('/applications', async (req, res) => {
  try {
    const { status, grade } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (grade) {
      query.grade = parseInt(grade);
    }

    const applications = await JoinRequest.find(query)
      .sort({ createdAt: -1 })
      .select('-reviewNotes'); // Hide review notes from general view

    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /api/join/application/:id - Get specific application
router.get('/application/:id', async (req, res) => {
  try {
    const application = await JoinRequest.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// PUT /api/join/application/:id/status - Update application status (admin only - placeholder)
router.put('/application/:id/status', [
  body('status').isIn(['pending', 'under-review', 'approved', 'rejected', 'waitlisted']).withMessage('Invalid status'),
  body('reviewNotes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const application = await JoinRequest.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    application.status = req.body.status;
    if (req.body.reviewNotes) {
      application.reviewNotes = req.body.reviewNotes;
    }
    application.reviewedAt = new Date();

    await application.save();

    res.json({
      message: 'Application status updated successfully',
      application: application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Sample data endpoint for development
router.post('/seed', async (req, res) => {
  try {
    // Clear existing applications
    await JoinRequest.deleteMany({});

    const sampleApplications = [
      {
        name: 'Alex Thompson',
        email: 'alex.thompson@student.gvhs.edu',
        grade: 11,
        gpa: 3.8,
        phone: '555-0123',
        leadershipExperience: 'Student Council Vice President, Debate Team Captain, peer tutor coordinator for underclassmen.',
        serviceHours: 45,
        serviceDescription: 'Volunteered at local food bank (20 hours), tutored elementary students (15 hours), organized school supply drive (10 hours).',
        characterReference: {
          teacherName: 'Ms. Jennifer Williams',
          teacherEmail: 'j.williams@gvhs.edu',
          relationship: 'AP English teacher and Student Council advisor'
        },
        personalStatement: 'Throughout my high school career, I have been committed to academic excellence while actively contributing to my school and community. I believe that true leadership comes from service to others, and I have demonstrated this through my various roles and volunteer work.',
        whyJoinNHS: 'I want to join NHS to further develop my leadership skills and make a greater impact on my community. The four pillars of NHS align perfectly with my personal values and goals.',
        status: 'pending'
      },
      {
        name: 'Jordan Martinez',
        email: 'jordan.martinez@student.gvhs.edu',
        grade: 12,
        gpa: 3.9,
        phone: '555-0124',
        leadershipExperience: 'Class President for two years, varsity soccer team captain, founded the Environmental Club.',
        serviceHours: 55,
        serviceDescription: 'Led beach cleanup initiatives (25 hours), mentored freshman students (20 hours), volunteered at animal shelter (10 hours).',
        characterReference: {
          teacherName: 'Mr. Robert Chen',
          teacherEmail: 'r.chen@gvhs.edu',
          relationship: 'AP History teacher and Environmental Club advisor'
        },
        personalStatement: 'Leadership, to me, means inspiring others to work toward a common goal while maintaining integrity and compassion. My experiences have taught me that small actions can create significant positive changes.',
        whyJoinNHS: 'NHS represents the values I hold dear: scholarship, leadership, service, and character. I want to be part of an organization that recognizes and promotes these important qualities.',
        status: 'under-review'
      }
    ];

    await JoinRequest.insertMany(sampleApplications);

    res.json({
      message: 'Sample join requests created successfully',
      count: sampleApplications.length
    });
  } catch (error) {
    console.error('Error seeding join requests:', error);
    res.status(500).json({ error: 'Failed to seed join requests' });
  }
});

module.exports = router;