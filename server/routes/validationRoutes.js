const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    createValidation,
    getValidations,
    updateValidation,
    reassignValidation
} = require('../controllers/validationController');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/validations:
 *   post:
 *     summary: Create a new validation request
 *     tags: [Validation]
 *     security:
 *       - bearerAuth: []
 *     description: Only Knowledge Champion, Administrator, or Governance Council can create validations
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - knowledgeItem
 *             properties:
 *               knowledgeItem:
 *                 type: string
 *                 description: Knowledge item ID to validate
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign validation to
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *     responses:
 *       201:
 *         description: Validation created successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   get:
 *     summary: Get all validations
 *     tags: [Validation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, revision]
 *         description: Filter by status
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Filter by assigned user ID
 *     responses:
 *       200:
 *         description: List of validations
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
 *                       knowledgeItem:
 *                         $ref: '#/components/schemas/KnowledgeItem'
 *                       status:
 *                         type: string
 *                       assignedTo:
 *                         $ref: '#/components/schemas/User'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post('/', authorize('Knowledge Champion', 'Administrator', 'Governance Council'), createValidation);
router.get('/', authorize('Knowledge Champion', 'Administrator', 'Governance Council'), getValidations);

/**
 * @swagger
 * /api/validations/{id}:
 *   put:
 *     summary: Update validation status (approve/reject/revision)
 *     tags: [Validation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Validation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, revision]
 *               comments:
 *                 type: string
 *                 example: Content meets quality standards
 *     responses:
 *       200:
 *         description: Validation updated successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', authorize('Knowledge Champion', 'Administrator', 'Governance Council'), updateValidation);

/**
 * @swagger
 * /api/validations/{id}/reassign:
 *   put:
 *     summary: Reassign validation to another user
 *     tags: [Validation]
 *     security:
 *       - bearerAuth: []
 *     description: Only Administrator or Governance Council can reassign
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Validation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: string
 *                 description: New user ID to assign validation to
 *     responses:
 *       200:
 *         description: Validation reassigned successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/reassign', authorize('Administrator', 'Governance Council'), reassignValidation);

module.exports = router;
