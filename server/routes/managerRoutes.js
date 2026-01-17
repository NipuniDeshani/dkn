const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { evaluateUser } = require('../controllers/managerController');

router.use(protect);

/**
 * @swagger
 * /api/manager/users/{id}/evaluate:
 *   put:
 *     summary: Evaluate a team member's performance
 *     tags: [Manager]
 *     security:
 *       - bearerAuth: []
 *     description: Only Project Managers and Administrators can evaluate users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to evaluate
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - score
 *             properties:
 *               score:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4
 *               feedback:
 *                 type: string
 *                 example: Excellent contributions this quarter
 *               period:
 *                 type: string
 *                 example: Q4 2025
 *     responses:
 *       200:
 *         description: Evaluation submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/users/:id/evaluate', authorize('Project Manager', 'Administrator'), evaluateUser);

module.exports = router;
