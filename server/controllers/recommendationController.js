const Recommendation = require('../models/Recommendation');
const KnowledgeItem = require('../models/KnowledgeItem');
const User = require('../models/User');
const RecommendationEngine = require('../services/RecommendationEngine');

// @desc    Get personalized recommendations for the current user
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 10, category } = req.query;

        // Use the RecommendationEngine service
        const recommendations = await RecommendationEngine.getRecommendations(userId);

        // Optionally filter by category
        let filteredRecs = recommendations;
        if (category) {
            const categoryItems = await KnowledgeItem.find({
                _id: { $in: recommendations.map(r => r.item) },
                category
            }).select('_id');
            const categoryIds = categoryItems.map(i => i._id.toString());
            filteredRecs = recommendations.filter(r => categoryIds.includes(r.item.toString()));
        }

        // Populate the knowledge items
        const populatedRecs = await Promise.all(
            filteredRecs.slice(0, parseInt(limit)).map(async (rec) => {
                const item = await KnowledgeItem.findById(rec.item)
                    .populate('author', 'username')
                    .select('title description category tags views');
                return {
                    ...rec,
                    item
                };
            })
        );

        res.json({
            count: populatedRecs.length,
            recommendations: populatedRecs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user preferences based on interaction
// @route   POST /api/recommendations/interaction
// @access  Private
const recordInteraction = async (req, res) => {
    try {
        const { itemId, interactionType } = req.body; // interactionType: 'view', 'like', 'save', 'share'
        const userId = req.user._id;

        // Update user preferences
        await RecommendationEngine.updateUserPreferences(userId, { itemId, interactionType });

        res.json({ message: 'Interaction recorded' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trending/popular content
// @route   GET /api/recommendations/trending
// @access  Private
const getTrending = async (req, res) => {
    try {
        const { period = '7d', limit = 10 } = req.query;

        // Calculate date range
        const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const trending = await KnowledgeItem.find({
            status: 'Approved',
            createdAt: { $gte: startDate }
        })
            .sort({ views: -1 })
            .limit(parseInt(limit))
            .populate('author', 'username')
            .select('title description category tags views createdAt');

        res.json(trending);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRecommendations,
    recordInteraction,
    getTrending
};
