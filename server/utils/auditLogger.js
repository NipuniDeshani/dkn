const AuditLog = require('../models/AuditLog');

/**
 * Centralized audit logging utility
 * All user actions are logged immutably
 */

const ACTIONS = {
    // Auth actions
    USER_REGISTER: 'USER_REGISTER',
    USER_LOGIN: 'USER_LOGIN',
    USER_LOGOUT: 'USER_LOGOUT',

    // Knowledge actions
    KNOWLEDGE_UPLOAD: 'KNOWLEDGE_UPLOAD',
    KNOWLEDGE_UPDATE: 'KNOWLEDGE_UPDATE',
    KNOWLEDGE_DELETE: 'KNOWLEDGE_DELETE',
    KNOWLEDGE_VIEW: 'KNOWLEDGE_VIEW',
    KNOWLEDGE_DOWNLOAD: 'KNOWLEDGE_DOWNLOAD',
    KNOWLEDGE_APPROVED: 'KNOWLEDGE_APPROVED',
    KNOWLEDGE_REJECTED: 'KNOWLEDGE_REJECTED',
    KNOWLEDGE_REVISION: 'KNOWLEDGE_REVISION',
    KNOWLEDGE_ARCHIVED: 'KNOWLEDGE_ARCHIVED',

    // Validation actions
    VALIDATION_CREATED: 'VALIDATION_CREATED',
    VALIDATION_APPROVED: 'VALIDATION_APPROVED',
    VALIDATION_REJECTED: 'VALIDATION_REJECTED',
    VALIDATION_REVISIONREQUESTED: 'VALIDATION_REVISIONREQUESTED',
    VALIDATION_REASSIGNED: 'VALIDATION_REASSIGNED',

    // Admin actions
    USER_ROLE_UPDATED: 'USER_ROLE_UPDATED',
    CONFIG_UPDATED: 'CONFIG_UPDATED',
    MIGRATION_STARTED: 'MIGRATION_STARTED',
    MIGRATION_COMPLETED: 'MIGRATION_COMPLETED'
};

/**
 * Log an action to the audit trail
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - The action being performed
 * @param {ObjectId} params.actor - The user performing the action
 * @param {ObjectId} params.target - The target object of the action
 * @param {string} params.targetModel - The model type of the target
 * @param {Object} params.details - Additional details about the action
 * @param {string} params.ipAddress - IP address of the request
 */
const logAction = async ({ action, actor, target, targetModel, details = {}, ipAddress }) => {
    try {
        if (!Object.values(ACTIONS).includes(action)) {
            console.warn(`Unknown audit action: ${action}`);
        }

        const log = await AuditLog.create({
            action,
            actor,
            target,
            targetModel,
            details,
            ipAddress,
            timestamp: new Date()
        });

        return log;
    } catch (error) {
        // Audit logging should never fail silently but also shouldn't crash the app
        console.error('Audit logging failed:', error);
        // In production, send to error monitoring service
    }
};

/**
 * Express middleware to add IP address to request for audit logging
 */
const auditMiddleware = (req, res, next) => {
    req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    next();
};

/**
 * Get audit logs for a specific target
 */
const getLogsForTarget = async (targetId, targetModel) => {
    return await AuditLog.find({ target: targetId, targetModel })
        .populate('actor', 'username email role')
        .sort({ timestamp: -1 });
};

/**
 * Get audit logs for a specific user
 */
const getLogsForUser = async (userId) => {
    return await AuditLog.find({ actor: userId })
        .sort({ timestamp: -1 })
        .limit(100);
};

module.exports = {
    ACTIONS,
    logAction,
    auditMiddleware,
    getLogsForTarget,
    getLogsForUser
};
