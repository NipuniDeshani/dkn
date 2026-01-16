const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['content', 'skill', 'expertise', 'trending'],
        required: true
    },
    recommendations: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeItem' },
        score: { type: Number, min: 0, max: 1 },
        reason: String,
        isViewed: { type: Boolean, default: false },
        isActedUpon: { type: Boolean, default: false }
    }],
    skillGaps: [{
        skill: String,
        currentLevel: { type: Number, min: 0, max: 5 },
        requiredLevel: { type: Number, min: 0, max: 5 },
        suggestedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeItem' }]
    }],
    expertiseMap: {
        domains: [String],
        strengths: [String],
        growthAreas: [String]
    },
    generatedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    isActive: { type: Boolean, default: true }
});

recommendationSchema.index({ user: 1, type: 1 });
recommendationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Recommendation', recommendationSchema);
