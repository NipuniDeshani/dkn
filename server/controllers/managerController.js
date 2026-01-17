const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// @desc    Evaluate user for promotion
// @route   PUT /api/manager/users/:id/evaluate
// @access  Private (Project Manager)
const evaluateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate status
        const validStatuses = ['None', 'Recommended', 'Monitoring', 'Not Ready'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid promotion status' });
        }

        user.promotionStatus = status || user.promotionStatus;
        user.promotionNotes = notes !== undefined ? notes : user.promotionNotes;
        user.lastEvaluationDate = Date.now();

        await user.save();

        await AuditLog.create({
            action: 'PROMOTION_EVALUATION',
            actor: req.user._id,
            target: user._id,
            targetModel: 'User',
            details: { status, notes }
        });

        res.json({
            _id: user._id,
            username: user.username,
            promotionStatus: user.promotionStatus,
            promotionNotes: user.promotionNotes,
            lastEvaluationDate: user.lastEvaluationDate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    evaluateUser
};
