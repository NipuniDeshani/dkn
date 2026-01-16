const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    category: {
        type: String,
        enum: ['system', 'workflow', 'ai', 'notification', 'security'],
        default: 'system'
    },
    description: String,
    isEditable: { type: Boolean, default: true },
    validationRules: {
        type: { type: String },
        min: Number,
        max: Number,
        allowedValues: [mongoose.Schema.Types.Mixed]
    },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

configurationSchema.index({ key: 1 });
configurationSchema.index({ category: 1 });

// Default configurations
configurationSchema.statics.DEFAULTS = {
    'validation.autoAssign': true,
    'validation.maxPendingDays': 7,
    'ai.similarityThreshold': 0.8,
    'ai.recommendationRefreshDays': 1,
    'leaderboard.updateInterval': 3600,
    'workflow.requireDualApproval': false,
    'notification.emailEnabled': true
};

module.exports = mongoose.model('Configuration', configurationSchema);
