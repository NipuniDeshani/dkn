const AuditLog = require('../models/AuditLog');
const KnowledgeItem = require('../models/KnowledgeItem');
const User = require('../models/User');

// @desc    Get audit logs for knowledge content
// @route   GET /api/audit/content
// @access  Private (Administrator, Governance Council)
const getContentAuditLogs = async (req, res) => {
    try {
        const { contentId, action, startDate, endDate, page = 1, limit = 50 } = req.query;
        let query = { targetModel: 'KnowledgeItem' };

        if (contentId) query.target = contentId;
        if (action) query.action = { $regex: action, $options: 'i' };
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await AuditLog.find(query)
            .populate('actor', 'username email role')
            .populate('target', 'title')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get audit trail for a specific knowledge item
// @route   GET /api/audit/content/:id
// @access  Private (Administrator, Governance Council, Author)
const getItemAuditTrail = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await KnowledgeItem.findById(id);
        if (!item) {
            return res.status(404).json({ message: 'Knowledge item not found' });
        }

        const auditTrail = await AuditLog.find({
            target: id,
            targetModel: 'KnowledgeItem'
        })
            .populate('actor', 'username role')
            .sort({ timestamp: -1 });

        res.json({
            item: { id: item._id, title: item.title },
            auditTrail
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get audit summary/statistics
// @route   GET /api/audit/summary
// @access  Private (Administrator, Governance Council)
const getAuditSummary = async (req, res) => {
    try {
        const { period = '7d' } = req.query;

        const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const [
            totalActions,
            actionsByType,
            topActors,
            recentCritical
        ] = await Promise.all([
            AuditLog.countDocuments({ timestamp: { $gte: startDate } }),
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: startDate } } },
                { $group: { _id: '$action', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            AuditLog.aggregate([
                { $match: { timestamp: { $gte: startDate } } },
                { $group: { _id: '$actor', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ]),
            AuditLog.find({
                timestamp: { $gte: startDate },
                action: { $in: ['USER_DELETED', 'CONFIG_UPDATED', 'KNOWLEDGE_REJECTED'] }
            })
                .populate('actor', 'username')
                .sort({ timestamp: -1 })
                .limit(10)
        ]);

        // Populate top actors
        const populatedActors = await Promise.all(
            topActors.map(async (a) => {
                const user = await User.findById(a._id).select('username role');
                return { user, actionCount: a.count };
            })
        );

        res.json({
            period,
            totalActions,
            actionsByType,
            topActors: populatedActors,
            recentCriticalActions: recentCritical
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create manual audit entry
// @route   POST /api/audit
// @access  Private (Administrator)
const createAuditEntry = async (req, res) => {
    try {
        const { action, target, targetModel, details } = req.body;

        const entry = await AuditLog.create({
            action,
            actor: req.user._id,
            target,
            targetModel,
            details
        });

        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getContentAuditLogs,
    getItemAuditTrail,
    getAuditSummary,
    createAuditEntry
};
