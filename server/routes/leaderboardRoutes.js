const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getLeaderboard,
    getMyStats,
    getTopByCategory
} = require('../controllers/leaderboardController');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Get the leaderboard rankings
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top users to return
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *           default: all
 *         description: Time period for ranking
 *     responses:
 *       200:
 *         description: Leaderboard data
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
 *                       rank:
 *                         type: integer
 *                         example: 1
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       points:
 *                         type: integer
 *                         example: 1250
 *                       contributions:
 *                         type: integer
 *                         example: 25
 *                       approvals:
 *                         type: integer
 *                         example: 20
 */
router.get('/', getLeaderboard);

/**
 * @swagger
 * /api/leaderboard/me:
 *   get:
 *     summary: Get current user's leaderboard stats
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's personal stats and ranking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     rank:
 *                       type: integer
 *                       example: 5
 *                     points:
 *                       type: integer
 *                       example: 340
 *                     contributions:
 *                       type: integer
 *                     predictedRank:
 *                       type: integer
 *                       description: AI-predicted rank for next week
 *                     trend:
 *                       type: string
 *                       enum: [Rising, Stable, Declining]
 */
router.get('/me', getMyStats);

/**
 * @swagger
 * /api/leaderboard/top/{category}:
 *   get:
 *     summary: Get top contributors by category
 *     tags: [Leaderboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Knowledge category (e.g., Development, Finance, HR)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: Top contributors in category
 */
router.get('/top/:category', getTopByCategory);

module.exports = router;
