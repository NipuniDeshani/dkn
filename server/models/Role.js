const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council']
    },
    description: { type: String },
    permissions: [{
        resource: { type: String, required: true },
        actions: [{ type: String, enum: ['create', 'read', 'update', 'delete', 'approve', 'admin'] }]
    }],
    level: { type: Number, default: 1 }, // Hierarchy level
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

roleSchema.index({ name: 1 });

module.exports = mongoose.model('Role', roleSchema);
