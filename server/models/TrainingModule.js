const mongoose = require('mongoose');

const trainingModuleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
        type: String,
        enum: ['Onboarding', 'Technical', 'Soft Skills', 'Compliance', 'Product', 'Process'],
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    estimatedDuration: { type: Number, default: 30 }, // in minutes
    content: [{
        type: { type: String, enum: ['Video', 'Document', 'Quiz', 'Interactive', 'External'] },
        title: String,
        url: String,
        duration: Number, // in minutes
        order: Number
    }],
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TrainingModule' }],
    tags: [String],
    targetRoles: [{
        type: String,
        enum: ['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council', 'All']
    }],
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

trainingModuleSchema.index({ category: 1, isPublished: 1 });
trainingModuleSchema.index({ targetRoles: 1 });

module.exports = mongoose.model('TrainingModule', trainingModuleSchema);
