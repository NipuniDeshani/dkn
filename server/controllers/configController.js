const ConfigurationRule = require('../models/ConfigurationRule');
const AuditLog = require('../models/AuditLog');
const ConfigurationManager = require('../services/ConfigurationManager');

// @desc    Get all configuration rules
// @route   GET /api/config
// @access  Private (Administrator)
const getConfigurations = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        if (category) query.category = category;

        const configs = await ConfigurationRule.find(query)
            .sort({ category: 1, key: 1 });

        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single configuration by key
// @route   GET /api/config/:key
// @access  Private (Administrator)
const getConfigByKey = async (req, res) => {
    try {
        const { key } = req.params;

        const config = await ConfigurationRule.findOne({ key });

        if (!config) {
            // Return default from ConfigurationManager service
            const defaultValue = ConfigurationManager.getConfig(key);
            if (defaultValue !== undefined) {
                return res.json({ key, value: defaultValue, source: 'default' });
            }
            return res.status(404).json({ message: 'Configuration not found' });
        }

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update configuration
// @route   PUT /api/config/:key
// @access  Private (Administrator)
const updateConfiguration = async (req, res) => {
    try {
        const { key } = req.params;
        const { value, description, category } = req.body;

        let config = await ConfigurationRule.findOne({ key });

        if (!config) {
            // Create new configuration
            config = await ConfigurationRule.create({
                key,
                value,
                description,
                category: category || 'system',
                lastModifiedBy: req.user._id
            });
        } else {
            if (!config.isEditable) {
                return res.status(403).json({ message: 'This configuration is not editable' });
            }

            config.value = value;
            if (description) config.description = description;
            config.lastModifiedBy = req.user._id;
            config.updatedAt = Date.now();
            await config.save();
        }

        // Update in-memory configuration
        ConfigurationManager.updateConfig(key, value);

        await AuditLog.create({
            action: 'CONFIG_UPDATED',
            actor: req.user._id,
            target: config._id,
            targetModel: 'ConfigurationRule',
            details: { key, newValue: value }
        });

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete configuration
// @route   DELETE /api/config/:key
// @access  Private (Administrator)
const deleteConfiguration = async (req, res) => {
    try {
        const { key } = req.params;

        const config = await ConfigurationRule.findOne({ key });

        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        if (!config.isEditable) {
            return res.status(403).json({ message: 'This configuration cannot be deleted' });
        }

        await ConfigurationRule.deleteOne({ key });

        await AuditLog.create({
            action: 'CONFIG_DELETED',
            actor: req.user._id,
            target: config._id,
            targetModel: 'ConfigurationRule',
            details: { key }
        });

        res.json({ message: 'Configuration deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset configuration to defaults
// @route   POST /api/config/reset
// @access  Private (Administrator)
const resetToDefaults = async (req, res) => {
    try {
        const defaults = ConfigurationRule.DEFAULTS;

        for (const [key, value] of Object.entries(defaults)) {
            await ConfigurationRule.findOneAndUpdate(
                { key },
                { value, updatedAt: Date.now(), lastModifiedBy: req.user._id },
                { upsert: true }
            );
            ConfigurationManager.updateConfig(key, value);
        }

        await AuditLog.create({
            action: 'CONFIG_RESET',
            actor: req.user._id,
            targetModel: 'ConfigurationRule',
            details: { resetKeys: Object.keys(defaults) }
        });

        res.json({ message: 'Configurations reset to defaults' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getConfigurations,
    getConfigByKey,
    updateConfiguration,
    deleteConfiguration,
    resetToDefaults
};
