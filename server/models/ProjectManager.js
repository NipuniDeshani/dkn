const mongoose = require('mongoose');

const projectManagerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    managedProjects: [{
        projectId: { type: String },
        projectName: { type: String },
        status: { type: String, enum: ['Active', 'Completed', 'OnHold', 'Cancelled'] },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    teamMembers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    department: { type: String },
    budgetResponsibility: { type: Number, default: 0 },
    performanceMetrics: {
        projectsCompleted: { type: Number, default: 0 },
        onTimeDeliveryRate: { type: Number, default: 0 },
        teamSatisfactionScore: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

projectManagerSchema.index({ user: 1 });

module.exports = mongoose.model('ProjectManager', projectManagerSchema);
