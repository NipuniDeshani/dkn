const express = require('express');
const router = express.Router();
const { uploadKnowledge, getKnowledgeItems, reviewKnowledge, getKnowledgeById, updateKnowledge } = require('../controllers/knowledgeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const upload = require('../middleware/uploadMiddleware');

/**
 * @swagger
 * /api/knowledge:
 *   post:
 *     summary: Upload new knowledge item
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 example: Best Practices for React Development
 *               description:
 *                 type: string
 *                 example: A comprehensive guide covering React best practices
 *               category:
 *                 type: string
 *                 example: Development
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [React, Frontend, JavaScript]
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Knowledge item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/KnowledgeItem'
 *       400:
 *         description: Validation error or duplicate content detected
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   get:
 *     summary: Get all knowledge items
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Approved, Rejected, Revision Requested]
 *         description: Filter by status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of knowledge items
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
 *                     $ref: '#/components/schemas/KnowledgeItem'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 */
router.route('/')
    .post(protect, upload.array('attachments'), uploadKnowledge)
    .get(protect, getKnowledgeItems);

/**
 * @swagger
 * /api/knowledge/{id}:
 *   get:
 *     summary: Get a single knowledge item
 *     tags: [Knowledge]
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
 *         description: Knowledge item details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/KnowledgeItem'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Update a knowledge item
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Knowledge item ID
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Knowledge item updated
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/:id')
    .get(protect, getKnowledgeById)
    .put(protect, upload.array('attachments'), updateKnowledge);

/**
 * @swagger
 * /api/knowledge/{id}/review:
 *   put:
 *     summary: Review a knowledge item (approve/reject/revision)
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Knowledge item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject, revision]
 *                 example: approve
 *               comments:
 *                 type: string
 *                 example: Great content, approved!
 *     responses:
 *       200:
 *         description: Review submitted successfully
 *       403:
 *         description: Only Knowledge Champion, Administrator, or Governance Council can review
 */
router.route('/:id/review')
    .put(protect, authorize('Knowledge Champion', 'Administrator', 'Governance Council'), reviewKnowledge);

/**
 * @swagger
 * /api/knowledge/{id}/approve:
 *   put:
 *     summary: Approve a knowledge item (alias for review)
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Knowledge approved
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route('/:id/approve')
    .put(protect, authorize('Knowledge Champion', 'Administrator', 'Governance Council'), reviewKnowledge);

/**
 * @swagger
 * /api/knowledge/{id}/quality:
 *   put:
 *     summary: Manage quality of a knowledge item
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               qualityScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Quality updated
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.route('/:id/quality')
    .put(protect, authorize('Knowledge Champion', 'Administrator', 'Governance Council'), require('../controllers/knowledgeController').manageQuality);

/**
 * @swagger
 * /api/knowledge/{id}/archive:
 *   put:
 *     summary: Archive a knowledge item
 *     tags: [Knowledge]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Knowledge item archived
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/:id/archive')
    .put(protect, authorize('Knowledge Champion', 'Administrator', 'Governance Council'), require('../controllers/knowledgeController').archiveKnowledge);

module.exports = router;
