const express = require('express');
const router = express.Router();
const {
    getContentAuditLogs,
    getItemAuditTrail,
    getAuditSummary,
    createAuditEntry
} = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/audit/content:
 *   get:
 *     summary: Get content-related audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     description: Only Administrator or Governance Council can access
 *     parameters:
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, approve, reject]
 *         description: Filter by action type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Content audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       action:
 *                         type: string
 *                       contentId:
 *                         type: string
 *                       contentTitle:
 *                         type: string
 *                       performedBy:
 *                         $ref: '#/components/schemas/User'
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/content', authorize('Administrator', 'Governance Council'), getContentAuditLogs);

/**
 * @swagger
 * /api/audit/content/{id}:
 *   get:
 *     summary: Get audit trail for a specific content item
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Knowledge item ID
 *     responses:
 *       200:
 *         description: Complete audit trail for the item
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/content/:id', authorize('Administrator', 'Governance Council'), getItemAuditTrail);

/**
 * @swagger
 * /api/audit/summary:
 *   get:
 *     summary: Get audit summary statistics
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: week
 *     responses:
 *       200:
 *         description: Audit summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalActions:
 *                       type: integer
 *                     byAction:
 *                       type: object
 *                     byUser:
 *                       type: object
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/summary', authorize('Administrator', 'Governance Council'), getAuditSummary);

/**
 * @swagger
 * /api/audit:
 *   post:
 *     summary: Create a manual audit entry
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     description: Only Administrator can create manual entries
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - details
 *             properties:
 *               action:
 *                 type: string
 *                 example: manual_review
 *               details:
 *                 type: string
 *                 example: Quarterly compliance check completed
 *               relatedId:
 *                 type: string
 *                 description: Optional related entity ID
 *     responses:
 *       201:
 *         description: Audit entry created
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', authorize('Administrator'), createAuditEntry);

module.exports = router;
