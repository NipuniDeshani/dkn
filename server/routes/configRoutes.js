const express = require('express');
const router = express.Router();
const {
    getConfigurations,
    getConfigByKey,
    updateConfiguration,
    deleteConfiguration,
    resetToDefaults
} = require('../controllers/configController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require authentication and Administrator role
router.use(protect);
router.use(authorize('Administrator'));

/**
 * @swagger
 * /api/config:
 *   get:
 *     summary: Get all system configurations
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     description: Only Administrator can access
 *     responses:
 *       200:
 *         description: All configuration settings
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
 *                       key:
 *                         type: string
 *                         example: MAX_UPLOAD_SIZE
 *                       value:
 *                         type: string
 *                         example: 10MB
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', getConfigurations);

/**
 * @swagger
 * /api/config/{key}:
 *   get:
 *     summary: Get a specific configuration by key
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Configuration key
 *         example: MAX_UPLOAD_SIZE
 *     responses:
 *       200:
 *         description: Configuration value
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update a configuration value
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - value
 *             properties:
 *               value:
 *                 type: string
 *                 example: 20MB
 *     responses:
 *       200:
 *         description: Configuration updated
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a configuration (reset to default)
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Configuration deleted/reset
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:key', getConfigByKey);
router.put('/:key', updateConfiguration);
router.delete('/:key', deleteConfiguration);

/**
 * @swagger
 * /api/config/reset:
 *   post:
 *     summary: Reset all configurations to defaults
 *     tags: [Configuration]
 *     security:
 *       - bearerAuth: []
 *     description: This will reset ALL configurations to their default values
 *     responses:
 *       200:
 *         description: All configurations reset to defaults
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: All configurations reset to defaults
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/reset', resetToDefaults);

module.exports = router;
