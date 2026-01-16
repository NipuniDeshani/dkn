const mongoose = require('mongoose');

const validationWorkflowSchema = new mongoose.Schema({
    knowledgeItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeItem',
        required: true
    },
    assignedReviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['Pending', 'InReview', 'Approved', 'Rejected', 'RevisionRequested'],
        default: 'Pending'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    reviewNotes: String,
    revisionComments: String,
    reviewHistory: [{
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        action: { type: String, enum: ['Assigned', 'Approved', 'Rejected', 'RevisionRequested', 'Reassigned'] },
        comment: String,
        timestamp: { type: Date, default: Date.now }
    }],
    dueDate: Date,
    completedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

validationWorkflowSchema.index({ knowledgeItem: 1 });
validationWorkflowSchema.index({ assignedReviewer: 1, status: 1 });

module.exports = mongoose.model('ValidationWorkflow', validationWorkflowSchema);
