const mongoose = require('mongoose');

const migrationSchema = new mongoose.Schema({
    batchId: { type: String, required: true, unique: true },
    source: {
        system: { type: String, required: true },
        version: String,
        format: String
    },
    status: {
        type: String,
        enum: ['Pending', 'InProgress', 'Completed', 'Failed', 'PartiallyCompleted'],
        default: 'Pending'
    },
    importedItems: [{
        originalId: String,
        newId: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeItem' },
        status: { type: String, enum: ['Success', 'Failed', 'Skipped'] },
        errorMessage: String
    }],
    statistics: {
        totalRecords: { type: Number, default: 0 },
        successCount: { type: Number, default: 0 },
        failureCount: { type: Number, default: 0 },
        skippedCount: { type: Number, default: 0 }
    },
    mappings: {
        categoryMap: { type: Map, of: String },
        regionMap: { type: Map, of: String },
        userMap: { type: Map, of: mongoose.Schema.Types.ObjectId }
    },
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startedAt: Date,
    completedAt: Date,
    errorLog: [String],
    createdAt: { type: Date, default: Date.now }
});

migrationSchema.index({ batchId: 1 });
migrationSchema.index({ status: 1 });

module.exports = mongoose.model('Migration', migrationSchema);
