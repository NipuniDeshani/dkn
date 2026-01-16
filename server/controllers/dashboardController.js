const KnowledgeItem = require('../models/KnowledgeItem');
const User = require('../models/User');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const stats = {};

        // Global stats (accessible to everyone, or filtered by role logic)
        stats.totalKnowledge = await KnowledgeItem.countDocuments({ status: 'Approved' });
        stats.recentUploads = await KnowledgeItem.find({ status: 'Approved' })
            .sort({ createdAt: -1 })
            .limit(5);

        // Role-specific stats
        if (req.user.role === 'User' || req.user.role === 'Consultant') {
            stats.myUploads = await KnowledgeItem.countDocuments({ author: req.user._id });
            stats.myPending = await KnowledgeItem.countDocuments({ author: req.user._id, status: 'Pending' });

            // Calculate total views for this user's content
            const viewsResult = await KnowledgeItem.aggregate([
                { $match: { author: req.user._id } },
                { $group: { _id: null, total: { $sum: '$views' } } }
            ]);
            stats.totalViews = viewsResult.length > 0 ? viewsResult[0].total : 0;
        }

        if (['Knowledge Champion', 'Administrator'].includes(req.user.role)) {
            stats.pendingApprovals = await KnowledgeItem.countDocuments({ status: 'Pending' });
            stats.flaggedItems = await KnowledgeItem.countDocuments({ status: { $in: ['Revision', 'Rejected'] } });

            // Calculate approved this week
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            stats.approvedThisWeek = await KnowledgeItem.countDocuments({
                status: 'Approved',
                updatedAt: { $gte: oneWeekAgo }
            });
        }

        if (req.user.role === 'Administrator') {
            stats.totalUsers = await User.countDocuments({});
            stats.systemHealth = 'Healthy'; // Mock
        }

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Manager specific stats
// @route   GET /api/dashboard/manager
// @access  Private (Project Manager)
const getManagerStats = async (req, res) => {
    try {
        // Mock team data for now
        const teamStats = {
            teamMembers: 12,
            activeContributors: 8,
            totalUploads: 45,
            skillGaps: ['Cloud Security', 'React Native']
        };
        res.json(teamStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Governance specific stats
// @route   GET /api/dashboard/governance
// @access  Private (Governance Council)
const getGovernanceStats = async (req, res) => {
    try {
        const AuditLog = require('../models/AuditLog');
        const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(20).populate('actor', 'username role');
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats, getManagerStats, getGovernanceStats };
