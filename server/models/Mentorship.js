const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    mentee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Paused', 'Cancelled'],
        default: 'Active'
    },
    focusAreas: [{
        type: String
    }],
    goals: [{
        description: String,
        targetDate: Date,
        completed: { type: Boolean, default: false },
        completedAt: Date
    }],
    sessions: [{
        date: { type: Date, default: Date.now },
        duration: Number, // in minutes
        notes: String,
        topics: [String]
    }],
    feedback: [{
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now }
    }],
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

mentorshipSchema.index({ mentor: 1, status: 1 });
mentorshipSchema.index({ mentee: 1, status: 1 });

module.exports = mongoose.model('Mentorship', mentorshipSchema);
