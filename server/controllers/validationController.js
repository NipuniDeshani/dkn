const Validation = require('../models/ValidationWorkflow');
const KnowledgeItem = require('../models/KnowledgeItem');
const AuditLog = require('../models/AuditLog');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

// @desc    Create validation request for a knowledge item
// @route   POST /api/validations
// @access  Private (Auto-created on upload, or manual by Champion)
const createValidation = async (req, res) => {
    try {
        const { knowledgeItemId, assignedReviewerId, priority } = req.body;

        const knowledgeItem = await KnowledgeItem.findById(knowledgeItemId);
        if (!knowledgeItem) {
            return res.status(404).json({ message: 'Knowledge item not found' });
        }

        // Check if validation already exists
        const existingValidation = await Validation.findOne({ knowledgeItem: knowledgeItemId });
        if (existingValidation) {
            return res.status(400).json({ message: 'Validation already exists for this item' });
        }

        // Auto-assign to a Knowledge Champion if not specified
        let reviewer = assignedReviewerId;
        if (!reviewer) {
            const champions = await User.find({ role: 'Knowledge Champion' });
            if (champions.length > 0) {
                // Simple round-robin assignment
                const randomIndex = Math.floor(Math.random() * champions.length);
                reviewer = champions[randomIndex]._id;
            }
        }

        const validation = await Validation.create({
            knowledgeItem: knowledgeItemId,
            assignedReviewer: reviewer,
            priority: priority || 'Medium',
            reviewHistory: [{
                reviewer: req.user._id,
                action: 'Assigned',
                comment: 'Validation created'
            }]
        });

        await AuditLog.create({
            action: 'VALIDATION_CREATED',
            actor: req.user._id,
            target: validation._id,
            targetModel: 'Validation',
            details: { knowledgeItemId, assignedReviewerId: reviewer }
        });

        res.status(201).json(validation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get validations (pending for reviewers)
// @route   GET /api/validations
// @access  Private (Knowledge Champion, Governance Council, Administrator)
const getValidations = async (req, res) => {
    try {
        const { status, assignedToMe } = req.query;
        let query = {};

        // Filter by status if provided
        if (status) {
            query.status = status;
        }

        // RBAC: Knowledge Champions see all pending validations (not just assigned to them)
        // Governance Council and Admin see all
        if (req.user.role === 'Knowledge Champion') {
            // Show all pending validations for Knowledge Champions to review
            if (!status) {
                query.status = { $in: ['Pending', 'InReview'] };
            }
        }

        // If user specifically wants only their assigned validations
        if (assignedToMe === 'true') {
            query.assignedReviewer = req.user._id;
        }

        const validations = await Validation.find(query)
            .populate({
                path: 'knowledgeItem',
                select: 'title description category status',
                populate: {
                    path: 'author',
                    select: 'username role'
                }
            })
            .populate('assignedReviewer', 'username email')
            .sort({ priority: -1, createdAt: 1 });

        res.json(validations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update validation (approve/reject/request revision)
// @route   PUT /api/validations/:id
// @access  Private (Knowledge Champion only)
const updateValidation = async (req, res) => {
    try {
        const { status, reviewNotes, revisionComments } = req.body;
        const { id } = req.params;

        const validation = await Validation.findById(id);
        if (!validation) {
            return res.status(404).json({ message: 'Validation not found' });
        }

        // Only assigned reviewer or admin can update
        // Knowledge Champions can review ANY pending validation
        const isAssignedReviewer = validation.assignedReviewer &&
            validation.assignedReviewer.toString() === req.user._id.toString();
        const isKnowledgeChampion = req.user.role === 'Knowledge Champion';
        const isAdmin = ['Administrator', 'Governance Council'].includes(req.user.role);

        if (!isAssignedReviewer && !isKnowledgeChampion && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to update this validation' });
        }

        // Update validation
        validation.status = status;
        validation.reviewNotes = reviewNotes;
        validation.revisionComments = revisionComments;
        validation.updatedAt = Date.now();

        if (['Approved', 'Rejected'].includes(status)) {
            validation.completedAt = Date.now();
        }

        // Add to history
        validation.reviewHistory.push({
            reviewer: req.user._id,
            action: status,
            comment: reviewNotes || revisionComments
        });

        await validation.save();

        // Update the knowledge item status
        const knowledgeItem = await KnowledgeItem.findById(validation.knowledgeItem);
        if (knowledgeItem) {
            if (status === 'Approved') {
                knowledgeItem.status = 'Approved';
            } else if (status === 'Rejected') {
                knowledgeItem.status = 'Rejected';
            } else if (status === 'RevisionRequested') {
                knowledgeItem.status = 'Revision';
            }
            knowledgeItem.approvals.push({
                approver: req.user._id,
                status: status === 'RevisionRequested' ? 'Request Changes' : status,
                comment: reviewNotes || revisionComments
            });
            await knowledgeItem.save();
        }

        // Update leaderboard for reviewer
        if (status === 'Approved' || status === 'Rejected') {
            await Leaderboard.findOneAndUpdate(
                { user: req.user._id },
                {
                    $inc: { 'scores.validations': 1 },
                    $set: { lastCalculated: Date.now() }
                },
                { upsert: true }
            );
        }

        await AuditLog.create({
            action: `VALIDATION_${status.toUpperCase()}`,
            actor: req.user._id,
            target: validation._id,
            targetModel: 'Validation',
            details: { knowledgeItemId: validation.knowledgeItem, reviewNotes }
        });

        res.json(validation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reassign validation to another reviewer
// @route   PUT /api/validations/:id/reassign
// @access  Private (Governance Council, Administrator)
const reassignValidation = async (req, res) => {
    try {
        const { newReviewerId } = req.body;
        const { id } = req.params;

        const validation = await Validation.findById(id);
        if (!validation) {
            return res.status(404).json({ message: 'Validation not found' });
        }

        const previousReviewer = validation.assignedReviewer;
        validation.assignedReviewer = newReviewerId;
        validation.status = 'Pending';
        validation.reviewHistory.push({
            reviewer: req.user._id,
            action: 'Reassigned',
            comment: `Reassigned from ${previousReviewer} to ${newReviewerId}`
        });
        validation.updatedAt = Date.now();

        await validation.save();

        await AuditLog.create({
            action: 'VALIDATION_REASSIGNED',
            actor: req.user._id,
            target: validation._id,
            targetModel: 'Validation',
            details: { previousReviewer, newReviewerId }
        });

        res.json(validation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createValidation,
    getValidations,
    updateValidation,
    reassignValidation
};
