const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council'],
        default: 'Consultant'
    },
    skills: [String],
    region: String,
    // Promotion Evaluation Fields (UC15)
    promotionStatus: {
        type: String,
        enum: ['None', 'Recommended', 'Monitoring', 'Not Ready'],
        default: 'None'
    },
    promotionNotes: String,
    lastEvaluationDate: Date,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
