const Leaderboard = require('../models/Leaderboard');
const AuditLog = require('../models/AuditLog');

// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        const { period, limit } = req.query;
        const limitNum = parseInt(limit) || 10;

        // Recalculate scores before fetching
        await recalculateAllScores();

        let sortField = 'totalScore';
        if (period === 'weekly') sortField = 'periodStats.weekly';
        if (period === 'monthly') sortField = 'periodStats.monthly';

        const leaderboard = await Leaderboard.find()
            .populate('user', 'username role region')
            .sort({ [sortField]: -1 })
            .limit(limitNum);

        // Add rank to each entry
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry.toObject(),
            rank: index + 1
        }));

        res.json(rankedLeaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's own leaderboard stats
// @route   GET /api/leaderboard/me
// @access  Private
const getMyStats = async (req, res) => {
    try {
        let stats = await Leaderboard.findOne({ user: req.user._id });

        if (!stats) {
            // Create initial entry
            stats = await Leaderboard.create({
                user: req.user._id,
                scores: { uploads: 0, approvals: 0, views: 0, downloads: 0, validations: 0 },
                totalScore: 0
            });
        }

        // Calculate rank
        const higherCount = await Leaderboard.countDocuments({
            totalScore: { $gt: stats.totalScore }
        });

        res.json({
            ...stats.toObject(),
            rank: higherCount + 1
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Internal function to recalculate all scores
const recalculateAllScores = async () => {
    try {
        const entries = await Leaderboard.find();
        for (const entry of entries) {
            entry.calculateTotalScore();
            await entry.save();
        }

        // Update ranks
        const sorted = await Leaderboard.find().sort({ totalScore: -1 });
        for (let i = 0; i < sorted.length; i++) {
            sorted[i].rank = i + 1;
            await sorted[i].save();
        }
    } catch (error) {
        console.error('Error recalculating scores:', error);
    }
};

// @desc    Increment a user's score (internal use)
const incrementScore = async (userId, scoreType, amount = 1) => {
    try {
        const updateField = `scores.${scoreType}`;
        const entry = await Leaderboard.findOneAndUpdate(
            { user: userId },
            {
                $inc: { [updateField]: amount },
                $set: { lastCalculated: Date.now() }
            },
            { upsert: true, new: true }
        );

        entry.calculateTotalScore();

        // Update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (entry.streaks.lastActivityDate) {
            const lastActivity = new Date(entry.streaks.lastActivityDate);
            lastActivity.setHours(0, 0, 0, 0);

            const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                entry.streaks.currentStreak += 1;
                if (entry.streaks.currentStreak > entry.streaks.longestStreak) {
                    entry.streaks.longestStreak = entry.streaks.currentStreak;
                }
            } else if (diffDays > 1) {
                entry.streaks.currentStreak = 1;
            }
        } else {
            entry.streaks.currentStreak = 1;
        }

        entry.streaks.lastActivityDate = today;
        await entry.save();

        return entry;
    } catch (error) {
        console.error('Error incrementing score:', error);
    }
};

// @desc    Get top contributors by category
// @route   GET /api/leaderboard/top/:category
// @access  Private
const getTopByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const validCategories = ['uploads', 'approvals', 'views', 'downloads', 'validations'];

        if (!validCategories.includes(category)) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        const sortField = `scores.${category}`;
        const leaderboard = await Leaderboard.find()
            .populate('user', 'username role region')
            .sort({ [sortField]: -1 })
            .limit(10);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLeaderboard,
    getMyStats,
    incrementScore,
    getTopByCategory,
    recalculateAllScores
};
