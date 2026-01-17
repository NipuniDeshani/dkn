const express = require('express');
const router = express.Router();
const {
    getRecommendations,
    recordInteraction,
    getTrending
} = require('../controllers/recommendationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Get personalized recommendations for the current user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Personalized recommendations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item:
 *                         $ref: '#/components/schemas/KnowledgeItem'
 *                       score:
 *                         type: number
 *                         example: 0.95
 *                       reason:
 *                         type: string
 *                         example: Based on your recent activity
 */
router.get('/', getRecommendations);

/**
 * @swagger
 * /api/recommendations/interaction:
 *   post:
 *     summary: Record user interaction with content
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     description: Used to improve recommendation accuracy
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - interactionType
 *             properties:
 *               itemId:
 *                 type: string
 *                 description: Knowledge item ID
 *               interactionType:
 *                 type: string
 *                 enum: [view, like, bookmark, share, download]
 *                 example: view
 *     responses:
 *       200:
 *         description: Interaction recorded successfully
 *       400:
 *         description: Invalid interaction type
 */
router.post('/interaction', recordInteraction);

/**
 * @swagger
 * /api/recommendations/trending:
 *   get:
 *     summary: Get trending content
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1d, 7d, 30d]
 *           default: 7d
 *         description: Time period for trending calculation
 *     responses:
 *       200:
 *         description: Trending content
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
 */
router.get('/trending', getTrending);

module.exports = router;
