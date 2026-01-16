const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all mentorships for current user (as mentor or mentee)
// @route   GET /api/mentorship
// @access  Private
const getMentorships = async (req, res) => {
    try {
        const { role, status } = req.query;
        let query = {};

        // Filter by role (mentor or mentee)
        if (role === 'mentor') {
            query.mentor = req.user._id;
        } else if (role === 'mentee') {
            query.mentee = req.user._id;
        } else {
            // Get both
            query.$or = [{ mentor: req.user._id }, { mentee: req.user._id }];
        }

        if (status) {
            query.status = status;
        }

        const mentorships = await Mentorship.find(query)
            .populate('mentor', 'username email role skills')
            .populate('mentee', 'username email role skills')
            .sort({ createdAt: -1 });

        res.json(mentorships);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available mentors
// @route   GET /api/mentorship/mentors
// @access  Private
const getAvailableMentors = async (req, res) => {
    try {
        const { skill, region } = req.query;

        // Mentors are typically Knowledge Champions or experienced users
        let query = {
            role: { $in: ['Knowledge Champion', 'Administrator', 'Governance Council'] },
            _id: { $ne: req.user._id } // Exclude self
        };

        if (skill) {
            query.skills = { $in: [skill] };
        }
        if (region) {
            query.region = region;
        }

        const mentors = await User.find(query)
            .select('username email role skills region');

        // Add mentorship count for each mentor
        const mentorsWithStats = await Promise.all(mentors.map(async (mentor) => {
            const activeMentorships = await Mentorship.countDocuments({
                mentor: mentor._id,
                status: 'Active'
            });

            return {
                ...mentor.toObject(),
                activeMentorships
            };
        }));

        res.json(mentorsWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create mentorship request
// @route   POST /api/mentorship
// @access  Private
const createMentorship = async (req, res) => {
    try {
        const { mentorId, focusAreas, goals } = req.body;

        // Check if mentor exists
        const mentor = await User.findById(mentorId);
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        // Check for existing active mentorship
        const existingMentorship = await Mentorship.findOne({
            mentor: mentorId,
            mentee: req.user._id,
            status: { $in: ['Active', 'Paused'] }
        });

        if (existingMentorship) {
            return res.status(400).json({ message: 'You already have an active mentorship with this mentor' });
        }

        const mentorship = await Mentorship.create({
            mentor: mentorId,
            mentee: req.user._id,
            focusAreas: focusAreas || [],
            goals: goals || [],
            status: 'Active'
        });

        await AuditLog.create({
            action: 'MENTORSHIP_CREATED',
            actor: req.user._id,
            target: mentorship._id,
            targetModel: 'Mentorship',
            details: { mentorId }
        });

        const populatedMentorship = await Mentorship.findById(mentorship._id)
            .populate('mentor', 'username email role skills')
            .populate('mentee', 'username email role skills');

        res.status(201).json(populatedMentorship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add session to mentorship
// @route   POST /api/mentorship/:id/sessions
// @access  Private (Mentor or Mentee)
const addSession = async (req, res) => {
    try {
        const { duration, notes, topics } = req.body;

        const mentorship = await Mentorship.findById(req.params.id);
        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check if user is part of this mentorship
        const isMentor = mentorship.mentor.toString() === req.user._id.toString();
        const isMentee = mentorship.mentee.toString() === req.user._id.toString();

        if (!isMentor && !isMentee) {
            return res.status(403).json({ message: 'Not authorized to update this mentorship' });
        }

        mentorship.sessions.push({
            date: new Date(),
            duration,
            notes,
            topics: topics || []
        });
        mentorship.updatedAt = Date.now();

        await mentorship.save();

        res.json(mentorship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update mentorship status
// @route   PUT /api/mentorship/:id
// @access  Private (Mentor or Mentee)
const updateMentorship = async (req, res) => {
    try {
        const { status, goals, focusAreas } = req.body;

        const mentorship = await Mentorship.findById(req.params.id);
        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        // Check authorization
        const isMentor = mentorship.mentor.toString() === req.user._id.toString();
        const isMentee = mentorship.mentee.toString() === req.user._id.toString();

        if (!isMentor && !isMentee) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (status) mentorship.status = status;
        if (goals) mentorship.goals = goals;
        if (focusAreas) mentorship.focusAreas = focusAreas;

        if (status === 'Completed') {
            mentorship.endDate = new Date();
        }

        mentorship.updatedAt = Date.now();
        await mentorship.save();

        const updated = await Mentorship.findById(mentorship._id)
            .populate('mentor', 'username email role skills')
            .populate('mentee', 'username email role skills');

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add feedback to mentorship
// @route   POST /api/mentorship/:id/feedback
// @access  Private (Mentor or Mentee)
const addFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;

        const mentorship = await Mentorship.findById(req.params.id);
        if (!mentorship) {
            return res.status(404).json({ message: 'Mentorship not found' });
        }

        mentorship.feedback.push({
            from: req.user._id,
            rating,
            comment
        });
        mentorship.updatedAt = Date.now();

        await mentorship.save();

        res.json(mentorship);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMentorships,
    getAvailableMentors,
    createMentorship,
    addSession,
    updateMentorship,
    addFeedback
};
