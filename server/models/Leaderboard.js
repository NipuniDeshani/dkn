const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    scores: {
        uploads: { type: Number, default: 0 },
        approvals: { type: Number, default: 0 },
        views: { type: Number, default: 0 },
        downloads: { type: Number, default: 0 },
        validations: { type: Number, default: 0 }
    },
    totalScore: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    badges: [{
        name: String,
        description: String,
        awardedAt: { type: Date, default: Date.now }
    }],
    streaks: {
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastActivityDate: Date
    },
    periodStats: {
        weekly: { type: Number, default: 0 },
        monthly: { type: Number, default: 0 },
        yearly: { type: Number, default: 0 }
    },
    lastCalculated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Scoring weights - immutable, no manual override
leaderboardSchema.statics.SCORE_WEIGHTS = {
    uploads: 10,
    approvals: 5,
    views: 1,
    downloads: 2,
    validations: 8
};

leaderboardSchema.methods.calculateTotalScore = function () {
    const weights = this.constructor.SCORE_WEIGHTS;
    this.totalScore =
        (this.scores.uploads * weights.uploads) +
        (this.scores.approvals * weights.approvals) +
        (this.scores.views * weights.views) +
        (this.scores.downloads * weights.downloads) +
        (this.scores.validations * weights.validations);
    return this.totalScore;
};

leaderboardSchema.index({ totalScore: -1 });
leaderboardSchema.index({ user: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
