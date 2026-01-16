const mongoose = require('mongoose');

const trainingProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TrainingModule',
        required: true
    },
    status: {
        type: String,
        enum: ['NotStarted', 'InProgress', 'Completed'],
        default: 'NotStarted'
    },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedContent: [{
        contentIndex: Number,
        completedAt: { type: Date, default: Date.now }
    }],
    quizScores: [{
        contentIndex: Number,
        score: Number,
        maxScore: Number,
        attempts: Number,
        completedAt: Date
    }],
    startedAt: Date,
    completedAt: Date,
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    certificateIssued: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

trainingProgressSchema.index({ user: 1, module: 1 }, { unique: true });
trainingProgressSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('TrainingProgress', trainingProgressSchema);
