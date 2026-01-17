// Sample Migration Seeder
// Run with: node seed-migration.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const migrationHandlerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    source: {
        system: String,
        connectionDetails: mongoose.Schema.Types.Mixed
    },
    target: {
        system: { type: String, default: 'DKN' },
        connectionDetails: mongoose.Schema.Types.Mixed
    },
    status: {
        type: String,
        enum: ['Pending', 'InProgress', 'Completed', 'Failed', 'Cancelled'],
        default: 'Pending'
    },
    migrationConfig: {
        batchSize: { type: Number, default: 100 },
        validateBeforeImport: { type: Boolean, default: true },
        skipDuplicates: { type: Boolean, default: true }
    },
    progress: {
        total: Number,
        processed: Number,
        success: Number,
        failed: Number
    },
    logs: [{
        level: { type: String, enum: ['info', 'warn', 'error'] },
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    initiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startedAt: Date,
    completedAt: Date,
    createdAt: { type: Date, default: Date.now }
});

const MigrationHandler = mongoose.model('MigrationHandler', migrationHandlerSchema);

async function seedMigrations() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Sample migrations
        const sampleMigrations = [
            {
                name: 'SharePoint Q4 2025 Import',
                description: 'Importing 500 documents from legacy SharePoint site',
                source: {
                    system: 'SharePoint',
                    connectionDetails: { siteUrl: 'https://company.sharepoint.com/sites/knowledge' }
                },
                target: { system: 'DKN' },
                status: 'Pending',
                migrationConfig: {
                    batchSize: 50,
                    validateBeforeImport: true,
                    skipDuplicates: true
                },
                progress: {
                    total: 500,
                    processed: 0,
                    success: 0,
                    failed: 0
                },
                logs: [
                    { level: 'info', message: 'Migration job created' }
                ]
            },
            {
                name: 'Confluence Wiki Migration',
                description: 'Best practices and project documentation from Confluence',
                source: {
                    system: 'Confluence',
                    connectionDetails: { spaceKey: 'BEST_PRACTICES' }
                },
                target: { system: 'DKN' },
                status: 'InProgress',
                migrationConfig: {
                    batchSize: 25,
                    validateBeforeImport: true,
                    skipDuplicates: false
                },
                progress: {
                    total: 150,
                    processed: 87,
                    success: 85,
                    failed: 2
                },
                startedAt: new Date(Date.now() - 3600000), // 1 hour ago
                logs: [
                    { level: 'info', message: 'Migration started' },
                    { level: 'info', message: 'Batch 1/6 completed - 25 items' },
                    { level: 'info', message: 'Batch 2/6 completed - 25 items' },
                    { level: 'warn', message: 'Row 55 skipped: Invalid metadata format' },
                    { level: 'info', message: 'Batch 3/6 completed - 25 items' },
                    { level: 'error', message: 'Row 78 failed: Duplicate content detected' }
                ]
            },
            {
                name: 'Excel Knowledge Base',
                description: 'Historical project insights from Excel spreadsheets',
                source: {
                    system: 'Excel',
                    connectionDetails: { filePath: '/imports/knowledge_base_2024.xlsx' }
                },
                target: { system: 'DKN' },
                status: 'Completed',
                migrationConfig: {
                    batchSize: 100,
                    validateBeforeImport: true,
                    skipDuplicates: true
                },
                progress: {
                    total: 200,
                    processed: 200,
                    success: 195,
                    failed: 5
                },
                startedAt: new Date(Date.now() - 86400000), // 1 day ago
                completedAt: new Date(Date.now() - 82800000), // 23 hours ago
                logs: [
                    { level: 'info', message: 'Migration completed successfully' },
                    { level: 'info', message: '195 items imported, 5 skipped (duplicates)' }
                ]
            }
        ];

        // Clear existing and insert new
        await MigrationHandler.deleteMany({});
        await MigrationHandler.insertMany(sampleMigrations);

        console.log('✅ Sample migrations created successfully!');
        console.log('   - SharePoint Q4 2025 Import (Pending)');
        console.log('   - Confluence Wiki Migration (InProgress)');
        console.log('   - Excel Knowledge Base (Completed)');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

seedMigrations();
