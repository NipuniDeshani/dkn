const mongoose = require('mongoose');

const administratorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    adminLevel: {
        type: String,
        enum: ['Junior', 'Senior', 'Super'],
        default: 'Junior'
    },
    accessScope: {
        canManageUsers: { type: Boolean, default: true },
        canManageRoles: { type: Boolean, default: false },
        canManageConfig: { type: Boolean, default: false },
        canViewAuditLogs: { type: Boolean, default: true },
        canManageContent: { type: Boolean, default: true }
    },
    managedRegions: [String],
    lastAdminAction: {
        action: { type: String },
        target: { type: String },
        timestamp: { type: Date }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

administratorSchema.index({ user: 1 });

module.exports = mongoose.model('Administrator', administratorSchema);
