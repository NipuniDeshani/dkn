const mongoose = require('mongoose');

const trainingSessionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, required: true }, // minutes
    meetingLink: String,
    maxParticipants: { type: Number, default: 50 },
    attendees: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        joinedAt: Date,
        status: { type: String, enum: ['Registered', 'Attended', 'NoShow'], default: 'Registered' }
    }],
    status: {
        type: String,
        enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    relatedModule: { type: mongoose.Schema.Types.ObjectId, ref: 'TrainingModule' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TrainingSession', trainingSessionSchema);
