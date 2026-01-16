const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['Public', 'Private', 'Restricted'],
        default: 'Private'
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeItem'
    }],
    accessControl: {
        viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        editors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    tags: [String],
    category: { type: String },
    statistics: {
        totalItems: { type: Number, default: 0 },
        totalViews: { type: Number, default: 0 },
        lastUpdated: { type: Date }
    },
    isArchived: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

repositorySchema.index({ name: 1 });
repositorySchema.index({ owner: 1 });

module.exports = mongoose.model('Repository', repositorySchema);
