const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., 'LOGIN', 'UPLOAD', 'APPROVE'
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
    targetModel: { type: String, enum: ['KnowledgeItem', 'User', 'Configuration', 'Validation', 'MigrationHandler', 'Mentorship', 'TrainingModule'] },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
