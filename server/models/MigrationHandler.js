const mongoose = require('mongoose');

const migrationHandlerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    source: {
        system: { type: String, required: true },
        connectionDetails: { type: mongoose.Schema.Types.Mixed }
    },
    target: {
        system: { type: String, required: true },
        connectionDetails: { type: mongoose.Schema.Types.Mixed }
    },
    status: {
        type: String,
        enum: ['Pending', 'InProgress', 'Completed', 'Failed', 'Cancelled'],
        default: 'Pending'
    },
    migrationConfig: {
        batchSize: { type: Number, default: 100 },
        dryRun: { type: Boolean, default: false },
        skipDuplicates: { type: Boolean, default: true },
        transformations: [{ type: mongoose.Schema.Types.Mixed }]
    },
    progress: {
        total: { type: Number, default: 0 },
        processed: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
    },
    logs: [{
        timestamp: { type: Date, default: Date.now },
        level: { type: String, enum: ['info', 'warn', 'warning', 'error'] },
        message: { type: String }
    }],
    initiatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

migrationHandlerSchema.index({ status: 1 });
migrationHandlerSchema.index({ initiatedBy: 1 });

module.exports = mongoose.model('MigrationHandler', migrationHandlerSchema);
