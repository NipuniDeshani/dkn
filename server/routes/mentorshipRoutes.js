const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMentorships,
    getAvailableMentors,
    createMentorship,
    addSession,
    updateMentorship,
    addFeedback
} = require('../controllers/mentorshipController');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/mentorship/mentors:
 *   get:
 *     summary: Get list of available mentors
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *         description: Filter by area of expertise
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filter by region
 *     responses:
 *       200:
 *         description: List of available mentors
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
 *                       user:
 *                         $ref: '#/components/schemas/User'
 *                       expertise:
 *                         type: array
 *                         items:
 *                           type: string
 *                       availability:
 *                         type: string
 *                       rating:
 *                         type: number
 */
router.get('/mentors', getAvailableMentors);

/**
 * @swagger
 * /api/mentorship:
 *   get:
 *     summary: Get user's mentorships (as mentor or mentee)
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [mentor, mentee, all]
 *           default: all
 *         description: Filter by role in mentorship
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, pending]
 *     responses:
 *       200:
 *         description: User's mentorships
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
 *                       mentor:
 *                         $ref: '#/components/schemas/User'
 *                       mentee:
 *                         $ref: '#/components/schemas/User'
 *                       status:
 *                         type: string
 *                       goals:
 *                         type: array
 *                         items:
 *                           type: string
 *                       sessions:
 *                         type: array
 *                         items:
 *                           type: object
 *   post:
 *     summary: Request a new mentorship
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mentorId
 *             properties:
 *               mentorId:
 *                 type: string
 *                 description: ID of the mentor to request
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [Learn React, Improve code quality]
 *               message:
 *                 type: string
 *                 example: I would like to improve my frontend skills
 *     responses:
 *       201:
 *         description: Mentorship request created
 *       400:
 *         description: Invalid request or mentor not available
 */
router.get('/', getMentorships);
router.post('/', createMentorship);

/**
 * @swagger
 * /api/mentorship/{id}:
 *   put:
 *     summary: Update mentorship status or details
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mentorship ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled, pending]
 *               goals:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Mentorship updated
 *       403:
 *         description: Not authorized to update this mentorship
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id', updateMentorship);

/**
 * @swagger
 * /api/mentorship/{id}/sessions:
 *   post:
 *     summary: Schedule a new mentorship session
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mentorship ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - duration
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-01-20T10:00:00Z
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *                 example: 60
 *               topic:
 *                 type: string
 *                 example: React Hooks deep dive
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session scheduled
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/sessions', addSession);

/**
 * @swagger
 * /api/mentorship/{id}/feedback:
 *   post:
 *     summary: Add feedback for a mentorship
 *     tags: [Mentorship]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Mentorship ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Great mentor, very helpful!
 *               sessionId:
 *                 type: string
 *                 description: Optional specific session ID
 *     responses:
 *       200:
 *         description: Feedback submitted
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/feedback', addFeedback);

module.exports = router;
