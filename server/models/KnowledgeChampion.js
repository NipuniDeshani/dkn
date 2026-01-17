const mongoose = require('mongoose');

const knowledgeChampionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    areasOfExpertise: [String],
    reviewQueue: [{
        knowledgeItem: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeItem' },
        assignedDate: { type: Date, default: Date.now },
        priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' }
    }],
    reviewStats: {
        totalReviewed: { type: Number, default: 0 },
        approved: { type: Number, default: 0 },
        rejected: { type: Number, default: 0 },
        averageReviewTime: { type: Number, default: 0 } // in hours
    },
    mentees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    specializations: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

knowledgeChampionSchema.index({ user: 1 });

module.exports = mongoose.model('KnowledgeChampion', knowledgeChampionSchema);
