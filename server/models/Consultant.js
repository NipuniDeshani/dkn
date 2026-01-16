const mongoose = require('mongoose');

const consultantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    expertise: [String],
    projectAssignments: [{
        project: { type: String },
        role: { type: String },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    certifications: [{
        name: { type: String },
        issuedBy: { type: String },
        issuedDate: { type: Date },
        expiryDate: { type: Date }
    }],
    billableHours: { type: Number, default: 0 },
    utilizationRate: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

consultantSchema.index({ user: 1 });

module.exports = mongoose.model('Consultant', consultantSchema);
