const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const KnowledgeItem = require('../models/KnowledgeItem');
const Validation = require('../models/ValidationWorkflow');
const Migration = require('../models/Migration');
const Configuration = require('../models/ConfigurationRule');
const Leaderboard = require('../models/Leaderboard');
const bcrypt = require('bcryptjs');

// @desc    Create a new user (Admin only)
// @route   POST /api/admin/users
// @access  Private (Administrator)
const createUser = async (req, res) => {
    try {
        const { username, email, password, role, region, skills } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        // Validate role
        const validRoles = ['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'Consultant',
            region: region || 'Global',
            skills: skills || []
        });

        // Log the action
        await AuditLog.create({
            action: 'USER_CREATED',
            actor: req.user._id,
            target: user._id,
            targetModel: 'User',
            details: { username, email, role: role || 'Consultant' }
        });

        // Return user without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @route   GET /api/admin/audit-logs
// @access  Private (Administrator, Governance Council)
const getAuditLogs = async (req, res) => {
    try {
        const { action, actorId, targetModel, startDate, endDate, page = 1, limit = 50 } = req.query;
        let query = {};

        if (action) query.action = { $regex: action, $options: 'i' };
        if (actorId) query.actor = actorId;
        if (targetModel) query.targetModel = targetModel;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const logs = await AuditLog.find(query)
            .populate('actor', 'username email role')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
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

// @desc    Get system-wide statistics
// @route   GET /api/admin/stats
// @access  Private (Administrator, Governance Council)
const getSystemStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalKnowledge,
            pendingValidations,
            approvedKnowledge,
            rejectedKnowledge,
            usersByRole,
            recentActivity
        ] = await Promise.all([
            User.countDocuments(),
            KnowledgeItem.countDocuments(),
            Validation.countDocuments({ status: 'Pending' }),
            KnowledgeItem.countDocuments({ status: 'Approved' }),
            KnowledgeItem.countDocuments({ status: 'Rejected' }),
            User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]),
            AuditLog.find().sort({ timestamp: -1 }).limit(10).populate('actor', 'username')
        ]);

        res.json({
            users: {
                total: totalUsers,
                byRole: usersByRole.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            },
            knowledge: {
                total: totalKnowledge,
                approved: approvedKnowledge,
                pending: pendingValidations,
                rejected: rejectedKnowledge
            },
            recentActivity
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (admin management)
// @route   GET /api/admin/users
// @access  Private (Administrator)
const getUsers = async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;
        let query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);

        res.json({
            users,
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

// @desc    Update user details (Admin)
// @route   PUT /api/admin/users/:id
// @access  Private (Administrator)
const updateUser = async (req, res) => {
    try {
        const { username, email, role, region, skills } = req.body;
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate role if changing
        if (role) {
            const validRoles = ['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: 'Invalid role' });
            }
        }

        // Check uniqueness if changing email/username
        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Email already in use' });
        }
        if (username && username !== user.username) {
            const exists = await User.findOne({ username });
            if (exists) return res.status(400).json({ message: 'Username already in use' });
        }

        // Update fields
        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;
        if (region) user.region = region;
        if (skills) user.skills = skills;

        await user.save();

        await AuditLog.create({
            action: 'USER_UPDATED',
            actor: req.user._id,
            target: user._id,
            targetModel: 'User',
            details: { updatedFields: req.body }
        });

        const updatedUser = user.toObject();
        delete updatedUser.password;

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Administrator)
const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        // Reuse general update logic or keep specific implementation
        // For backward compatibility keeping this, but could be merged
        // ... (existing implementation)
        const { id } = req.params;

        const validRoles = ['Consultant', 'Knowledge Champion', 'Project Manager', 'Administrator', 'Governance Council'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await AuditLog.create({
            action: 'USER_ROLE_UPDATED',
            actor: req.user._id,
            target: user._id,
            targetModel: 'User',
            details: { newRole: role }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Administrator)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(id);

        await AuditLog.create({
            action: 'USER_DELETED',
            actor: req.user._id,
            target: id,
            targetModel: 'User',
            details: { deletedUsername: user.username, deletedEmail: user.email }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get migrations
// @route   GET /api/admin/migrations
// @access  Private (Administrator)
const getMigrations = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        let query = {};

        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const migrations = await Migration.find(query)
            .populate('initiatedBy', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Migration.countDocuments(query);

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

// @desc    Get/Update configurations
// @route   GET /api/admin/config
// @access  Private (Administrator)
const getConfigurations = async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};

        if (category) query.category = category;

        const configs = await Configuration.find(query).sort({ category: 1, key: 1 });
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update configuration
// @route   PUT /api/admin/config/:key
// @access  Private (Administrator)
const updateConfiguration = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const config = await Configuration.findOne({ key });
        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        if (!config.isEditable) {
            return res.status(403).json({ message: 'This configuration is not editable' });
        }

        config.value = value;
        config.lastModifiedBy = req.user._id;
        config.updatedAt = Date.now();
        await config.save();

        await AuditLog.create({
            action: 'CONFIG_UPDATED',
            actor: req.user._id,
            target: config._id,
            targetModel: 'Configuration',
            details: { key, newValue: value }
        });

        res.json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createUser,
    deleteUser,
    getAuditLogs,
    getSystemStats,
    getUsers,
    getUsers,
    updateUser,
    updateUserRole,
    getMigrations,
    getConfigurations,
    updateConfiguration
};
