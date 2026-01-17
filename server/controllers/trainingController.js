const TrainingModule = require('../models/TrainingModule');
const TrainingProgress = require('../models/TrainingProgress');
const TrainingSession = require('../models/TrainingSession');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Get all training modules
// @route   GET /api/training
// @access  Private
const getModules = async (req, res) => {
    try {
        const { category, difficulty, role } = req.query;
        let query = { isPublished: true };

        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (role) {
            query.$or = [
                { targetRoles: role },
                { targetRoles: 'All' }
            ];
        }

        const modules = await TrainingModule.find(query)
            .populate('createdBy', 'username')
            .select('-content.url') // Don't expose URLs in list view
            .sort({ createdAt: -1 });

        // Add user's progress for each module
        const modulesWithProgress = await Promise.all(modules.map(async (mod) => {
            const progress = await TrainingProgress.findOne({
                user: req.user._id,
                module: mod._id
            });

            return {
                ...mod.toObject(),
                userProgress: progress ? {
                    status: progress.status,
                    progress: progress.progress,
                    completedAt: progress.completedAt
                } : null
            };
        }));

        res.json(modulesWithProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single module with full content
// @route   GET /api/training/:id
// @access  Private
const getModuleById = async (req, res) => {
    try {
        const module = await TrainingModule.findById(req.params.id)
            .populate('createdBy', 'username')
            .populate('prerequisites', 'title');

        if (!module) {
            return res.status(404).json({ message: 'Training module not found' });
        }

        // Get user's progress
        let progress = await TrainingProgress.findOne({
            user: req.user._id,
            module: module._id
        });

        // Create progress record if not exists
        if (!progress) {
            progress = await TrainingProgress.create({
                user: req.user._id,
                module: module._id,
                status: 'NotStarted'
            });
        }

        res.json({
            module,
            progress
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create training module (Admin only)
// @route   POST /api/training
// @access  Private (Administrator)
const createModule = async (req, res) => {
    try {
        const { title, description, category, difficulty, estimatedDuration, content, prerequisites, tags, targetRoles } = req.body;

        const module = await TrainingModule.create({
            title,
            description,
            category,
            difficulty,
            estimatedDuration,
            content: content || [],
            prerequisites: prerequisites || [],
            tags: tags || [],
            targetRoles: targetRoles || ['All'],
            createdBy: req.user._id,
            isPublished: false
        });

        await AuditLog.create({
            action: 'TRAINING_MODULE_CREATED',
            actor: req.user._id,
            target: module._id,
            targetModel: 'TrainingModule'
        });

        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enroll in training module
// @route   POST /api/training/:id/enroll
// @access  Private
const enrollInModule = async (req, res) => {
    try {
        const module = await TrainingModule.findById(req.params.id);
        if (!module) {
            return res.status(404).json({ message: 'Training module not found' });
        }

        // Check if already enrolled
        let progress = await TrainingProgress.findOne({
            user: req.user._id,
            module: module._id
        });

        if (progress && progress.status !== 'NotStarted') {
            return res.status(400).json({ message: 'Already enrolled in this module' });
        }

        if (!progress) {
            progress = await TrainingProgress.create({
                user: req.user._id,
                module: module._id,
                status: 'InProgress',
                startedAt: new Date()
            });
        } else {
            progress.status = 'InProgress';
            progress.startedAt = new Date();
            await progress.save();
        }

        // Add to enrollments
        if (!module.enrollments.includes(req.user._id)) {
            module.enrollments.push(req.user._id);
            await module.save();
        }

        res.json({ message: 'Enrolled successfully', progress });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update training progress
// @route   PUT /api/training/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
    try {
        const { contentIndex, quizScore, maxScore } = req.body;

        let progress = await TrainingProgress.findOne({
            user: req.user._id,
            module: req.params.id
        });

        if (!progress) {
            return res.status(404).json({ message: 'Not enrolled in this module' });
        }

        const module = await TrainingModule.findById(req.params.id);

        // Mark content as completed
        if (contentIndex !== undefined) {
            const alreadyCompleted = progress.completedContent.some(c => c.contentIndex === contentIndex);
            if (!alreadyCompleted) {
                progress.completedContent.push({
                    contentIndex,
                    completedAt: new Date()
                });
            }
        }

        // Record quiz score
        if (quizScore !== undefined && maxScore !== undefined) {
            const existingQuiz = progress.quizScores.find(q => q.contentIndex === contentIndex);
            if (existingQuiz) {
                existingQuiz.score = quizScore;
                existingQuiz.attempts = (existingQuiz.attempts || 0) + 1;
                existingQuiz.completedAt = new Date();
            } else {
                progress.quizScores.push({
                    contentIndex,
                    score: quizScore,
                    maxScore,
                    attempts: 1,
                    completedAt: new Date()
                });
            }
        }

        // Calculate overall progress
        const totalContent = module.content.length;
        const completedCount = progress.completedContent.length;
        progress.progress = Math.round((completedCount / totalContent) * 100);

        // Check if completed
        if (progress.progress >= 100) {
            progress.status = 'Completed';
            progress.completedAt = new Date();

            // Update module completion count
            module.completions = (module.completions || 0) + 1;
            await module.save();
        }

        progress.updatedAt = Date.now();
        await progress.save();

        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Rate a completed module
// @route   POST /api/training/:id/rate
// @access  Private
const rateModule = async (req, res) => {
    try {
        const { rating, feedback } = req.body;

        const progress = await TrainingProgress.findOne({
            user: req.user._id,
            module: req.params.id,
            status: 'Completed'
        });

        if (!progress) {
            return res.status(400).json({ message: 'You must complete the module before rating' });
        }

        progress.rating = rating;
        progress.feedback = feedback;
        await progress.save();

        // Update module average rating
        const module = await TrainingModule.findById(req.params.id);
        const allRatings = await TrainingProgress.find({
            module: req.params.id,
            rating: { $exists: true }
        });

        const totalRating = allRatings.reduce((sum, p) => sum + p.rating, 0);
        module.averageRating = totalRating / allRatings.length;
        module.totalRatings = allRatings.length;
        await module.save();

        res.json({ message: 'Rating submitted', averageRating: module.averageRating });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's training dashboard
// @route   GET /api/training/my-progress
// @access  Private
const getMyProgress = async (req, res) => {
    try {
        const progress = await TrainingProgress.find({ user: req.user._id })
            .populate('module', 'title category difficulty estimatedDuration')
            .sort({ updatedAt: -1 });

        const stats = {
            total: progress.length,
            completed: progress.filter(p => p.status === 'Completed').length,
            inProgress: progress.filter(p => p.status === 'InProgress').length,
            notStarted: progress.filter(p => p.status === 'NotStarted').length
        };

        res.json({ progress, stats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMyProgress
};

// ==================== LIVE SESSIONS (UC09) ====================

// @desc    Get all training sessions
// @route   GET /api/training/sessions
// @access  Private
const getSessions = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) query.status = status;

        // Default: show upcoming scheduled sessions first
        const sessions = await TrainingSession.find(query)
            .populate('instructor', 'username')
            .sort({ scheduledDate: 1 });

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new training session
// @route   POST /api/training/sessions
// @access  Private (Champion/Admin)
const createSession = async (req, res) => {
    try {
        const { title, description, scheduledDate, duration, meetingLink, maxParticipants } = req.body;

        // RBAC Check
        if (!['Knowledge Champion', 'Administrator'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to schedule sessions' });
        }

        const session = await TrainingSession.create({
            title,
            description,
            instructor: req.user._id,
            scheduledDate,
            duration,
            meetingLink,
            maxParticipants,
            attendees: []
        });

        // Notify staff (Pseudo-code / Audit log only for now as NotificationService isn't fully implemented in this context)
        // In real app: NotificationService.notifyAll('New Training Scheduled: ' + title);

        await AuditLog.create({
            action: 'TRAINING_SESSION_CREATED',
            actor: req.user._id,
            target: session._id,
            targetModel: 'TrainingSession'
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Register for a session
// @route   POST /api/training/sessions/:id/register
// @access  Private
const registerForSession = async (req, res) => {
    try {
        const session = await TrainingSession.findById(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        if (session.status !== 'Scheduled') return res.status(400).json({ message: 'Session is not open for registration' });

        // Check if already registered
        if (session.attendees.some(a => a.user.toString() === req.user._id.toString())) {
            return res.status(400).json({ message: 'Already registered' });
        }

        if (session.attendees.length >= session.maxParticipants) {
            return res.status(400).json({ message: 'Session is full' });
        }

        session.attendees.push({
            user: req.user._id,
            status: 'Registered',
            joinedAt: new Date()
        });

        await session.save();
        res.json({ message: 'Registered successfully', session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark attendance (Instructor only)
// @route   PUT /api/training/sessions/:id/attendance
// @access  Private (Instructor/Champion)
const markAttendance = async (req, res) => {
    try {
        const { userId, status } = req.body; // status: 'Attended', 'NoShow'
        const session = await TrainingSession.findById(req.params.id);

        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Only instructor or admin can mark
        if (session.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Administrator') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const attendee = session.attendees.find(a => a.user.toString() === userId);
        if (!attendee) return res.status(404).json({ message: 'User not registered' });

        attendee.status = status;
        await session.save();

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getModules,
    getModuleById,
    createModule,
    enrollInModule,
    updateProgress,
    rateModule,
    getMyProgress,
    // Session exports
    getSessions,
    createSession,
    registerForSession,
    markAttendance
};
