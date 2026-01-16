const mongoose = require('mongoose');

const knowledgeItemSchema = new mongoose.Schema({
    title: { type: String, required: true, index: 'text' },
    description: { type: String, required: true, index: 'text' },
    category: { type: String, required: true },
    tags: [String],
    region: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Revision', 'Archived'],
        default: 'Pending'
    },
    contentUrl: String, // URL to file or content
    attachments: [{
        name: { type: String },
        type: { type: String },
        size: { type: Number },
        url: { type: String }
    }],
    metadata: {
        contentType: String,
        size: Number,
        format: String
    },
    approvals: [{
        approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['Approved', 'Rejected', 'Request Changes'] },
        comment: String,
        date: { type: Date, default: Date.now }
    }],
    aiAnalysis: {
        keywords: [String],
        summary: String,
        sentiment: String, // Added sentiment field
        duplicateScore: Number,
        similarItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeItem' }]
    },
    // Quality Management Fields (UC08)
    qualityFlag: { type: Boolean, default: false, index: true },
    qualityScore: { type: Number, min: 0, max: 100, default: 100 },
    qualityIssues: [String], // e.g., "Duplicate Content", "Low Sentiment", "Missing Metadata"

    views: { type: Number, default: 0 },
    version: { type: Number, default: 1 },  // Track versions for edit history
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Create text index for search
knowledgeItemSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('KnowledgeItem', knowledgeItemSchema);
