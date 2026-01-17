const mongoose = require('mongoose');

const metadataSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['category', 'region', 'contentType', 'tag']
    },
    value: { type: String, required: true },
    label: { type: String, required: true },
    description: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Metadata' },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

metadataSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('Metadata', metadataSchema);
