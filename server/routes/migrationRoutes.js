const express = require('express');
const router = express.Router();
const {
    getMigrations,
    getMigrationById,
    createMigration,
    startMigration,
    cancelMigration
} = require('../controllers/migrationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication and Administrator or Governance Council role
router.use(protect);
router.use(authorize('Administrator', 'Governance Council'));

/**
 * @swagger
 * /api/migration:
 *   get:
 *     summary: Get all migrations
 *     tags: [Migration]
 *     security:
 *       - bearerAuth: []
 *     description: Only Administrator or Governance Council can access
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Completed, Failed, Cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of migrations
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
 *                     $ref: '#/components/schemas/Migration'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   post:
 *     summary: Create a new migration
 *     tags: [Migration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sourceSystem
 *             properties:
 *               name:
 *                 type: string
 *                 example: Legacy SharePoint Migration
 *               sourceSystem:
 *                 type: string
 *                 example: SharePoint
 *               description:
 *                 type: string
 *               sourcePath:
 *                 type: string
 *                 example: /imports/sharepoint-export.csv
 *     responses:
 *       201:
 *         description: Migration created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Migration'
 *       400:
 *         description: Validation error
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', getMigrations);
router.post('/', createMigration);

/**
 * @swagger
 * /api/migration/{id}:
 *   get:
 *     summary: Get a single migration by ID
 *     tags: [Migration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Migration ID
 *     responses:
 *       200:
 *         description: Migration details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Migration'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', getMigrationById);

/**
 * @swagger
 * /api/migration/{id}/start:
 *   post:
 *     summary: Start a migration
 *     tags: [Migration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Migration ID
 *     responses:
 *       200:
 *         description: Migration started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Migration started
 *                 data:
 *                   $ref: '#/components/schemas/Migration'
 *       400:
 *         description: Migration already in progress or completed
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/start', startMigration);

/**
 * @swagger
 * /api/migration/{id}/cancel:
 *   post:
 *     summary: Cancel a migration
 *     tags: [Migration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Migration ID
 *     responses:
 *       200:
 *         description: Migration cancelled successfully
 *       400:
 *         description: Cannot cancel completed or already cancelled migration
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/cancel', cancelMigration);

module.exports = router;
