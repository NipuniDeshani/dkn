const express = require('express');
const router = express.Router();
const { getDashboardStats, getManagerStats, getGovernanceStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get general dashboard statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalKnowledge:
 *                       type: integer
 *                       example: 150
 *                     pendingReviews:
 *                       type: integer
 *                       example: 12
 *                     approvedThisMonth:
 *                       type: integer
 *                       example: 45
 *                     myContributions:
 *                       type: integer
 *                       example: 8
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', protect, getDashboardStats);

/**
 * @swagger
 * /api/dashboard/manager:
 *   get:
 *     summary: Get Project Manager specific statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Only accessible by Project Managers and Administrators
 *     responses:
 *       200:
 *         description: Manager dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     teamMembers:
 *                       type: integer
 *                     teamContributions:
 *                       type: integer
 *                     pendingApprovals:
 *                       type: integer
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/manager', protect, authorize('Project Manager', 'Administrator'), getManagerStats);

/**
 * @swagger
 * /api/dashboard/governance:
 *   get:
 *     summary: Get Governance Council specific statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     description: Only accessible by Governance Council and Administrators
 *     responses:
 *       200:
 *         description: Governance dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     policyViolations:
 *                       type: integer
 *                     pendingReviews:
 *                       type: integer
 *                     complianceScore:
 *                       type: number
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/governance', protect, authorize('Governance Council', 'Administrator'), getGovernanceStats);

module.exports = router;
