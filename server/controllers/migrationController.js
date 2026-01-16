const MigrationHandler = require('../models/MigrationHandler');
const AuditLog = require('../models/AuditLog');
const MigrationService = require('../services/MigrationHandler');

// @desc    Get all migrations
// @route   GET /api/migration
// @access  Private (Administrator)
const getMigrations = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};

        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const migrations = await MigrationHandler.find(query)
            .populate('initiatedBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await MigrationHandler.countDocuments(query);

        res.json({
            migrations,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single migration by ID
// @route   GET /api/migration/:id
// @access  Private (Administrator)
const getMigrationById = async (req, res) => {
    try {
        const migration = await MigrationHandler.findById(req.params.id)
            .populate('initiatedBy', 'username email');

        if (!migration) {
            return res.status(404).json({ message: 'Migration not found' });
        }

        res.json(migration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new migration job
// @route   POST /api/migration
// @access  Private (Administrator)
const createMigration = async (req, res) => {
    try {
        const { name, description, source, target, migrationConfig } = req.body;

        const migration = await MigrationHandler.create({
            name,
            description,
            source,
            target,
            migrationConfig,
            initiatedBy: req.user._id,
            status: 'Pending'
        });

        await AuditLog.create({
            action: 'MIGRATION_CREATED',
            actor: req.user._id,
            target: migration._id,
            targetModel: 'MigrationHandler',
            details: { name, source: source.system, target: target.system }
        });

        res.status(201).json(migration);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Start a migration job
// @route   POST /api/migration/:id/start
// @access  Private (Administrator)
const startMigration = async (req, res) => {
    try {
        const migration = await MigrationHandler.findById(req.params.id);

        if (!migration) {
            return res.status(404).json({ message: 'Migration not found' });
        }

        if (migration.status !== 'Pending') {
            return res.status(400).json({ message: 'Migration cannot be started' });
        }

        migration.status = 'InProgress';
        migration.startedAt = new Date();
        await migration.save();

        // Start migration process (async)
        MigrationService.importData(migration.source.connectionDetails)
            .then(result => {
                migration.progress = {
                    ...migration.progress,
                    ...result
                };
                migration.status = 'Completed';
                migration.completedAt = new Date();
                migration.save();
            })
            .catch(err => {
                migration.status = 'Failed';
                migration.logs.push({ level: 'error', message: err.message });
                migration.save();
            });

        res.json({ message: 'Migration started', migration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel a migration job
// @route   POST /api/migration/:id/cancel
// @access  Private (Administrator)
const cancelMigration = async (req, res) => {
    try {
        const migration = await MigrationHandler.findById(req.params.id);

        if (!migration) {
            return res.status(404).json({ message: 'Migration not found' });
        }

        if (!['Pending', 'InProgress'].includes(migration.status)) {
            return res.status(400).json({ message: 'Migration cannot be cancelled' });
        }

        migration.status = 'Cancelled';
        migration.logs.push({ level: 'info', message: 'Migration cancelled by user' });
        await migration.save();

        res.json({ message: 'Migration cancelled', migration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMigrations,
    getMigrationById,
    createMigration,
    startMigration,
    cancelMigration
};
