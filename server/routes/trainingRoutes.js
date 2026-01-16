const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    getModules,
    getModuleById,
    createModule,
    enrollInModule,
    updateProgress,
    rateModule,
    getMyProgress,
    getSessions,
    createSession,
    registerForSession,
    markAttendance
} = require('../controllers/trainingController');

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/training/my-progress:
 *   get:
 *     summary: Get current user's training progress
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's training progress across all enrolled modules
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
 *                       module:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                       progress:
 *                         type: integer
 *                         example: 75
 *                       completedLessons:
 *                         type: integer
 *                       totalLessons:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [not_started, in_progress, completed]
 */
router.get('/my-progress', getMyProgress);

/**
 * @swagger
 * /api/training/sessions:
 *   get:
 *     summary: Get all training sessions
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *         description: Only show upcoming sessions
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *         description: Filter by module
 *     responses:
 *       200:
 *         description: List of training sessions
 *   post:
 *     summary: Create a new training session
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     description: Only Knowledge Champion or Administrator can create sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - date
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 example: React Advanced Patterns Workshop
 *               moduleId:
 *                 type: string
 *                 description: Related training module ID
 *               date:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes
 *               maxParticipants:
 *                 type: integer
 *                 example: 20
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/sessions', getSessions);
router.post('/sessions', authorize('Knowledge Champion', 'Administrator'), createSession);

/**
 * @swagger
 * /api/training/sessions/{id}/register:
 *   post:
 *     summary: Register for a training session
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Successfully registered for session
 *       400:
 *         description: Session full or already registered
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/sessions/:id/register', registerForSession);

/**
 * @swagger
 * /api/training/sessions/{id}/attendance:
 *   put:
 *     summary: Mark attendance for a training session
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     description: Only Knowledge Champion or Administrator can mark attendance
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendees
 *             properties:
 *               attendees:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     attended:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Attendance marked
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.put('/sessions/:id/attendance', authorize('Knowledge Champion', 'Administrator'), markAttendance);

/**
 * @swagger
 * /api/training:
 *   get:
 *     summary: Get all training modules
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *     responses:
 *       200:
 *         description: List of training modules
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
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       category:
 *                         type: string
 *                       level:
 *                         type: string
 *                       duration:
 *                         type: string
 *                       lessonsCount:
 *                         type: integer
 *                       enrolledCount:
 *                         type: integer
 *                       rating:
 *                         type: number
 *   post:
 *     summary: Create a new training module
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     description: Only Administrator can create modules
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               lessons:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     duration:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Module created successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get('/', getModules);
router.post('/', authorize('Administrator'), createModule);

/**
 * @swagger
 * /api/training/{id}:
 *   get:
 *     summary: Get a single training module
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Training module details
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', getModuleById);

/**
 * @swagger
 * /api/training/{id}/enroll:
 *   post:
 *     summary: Enroll in a training module
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     responses:
 *       200:
 *         description: Successfully enrolled
 *       400:
 *         description: Already enrolled
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/enroll', enrollInModule);

/**
 * @swagger
 * /api/training/{id}/progress:
 *   put:
 *     summary: Update progress in a training module
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lessonId:
 *                 type: string
 *                 description: Completed lesson ID
 *               progress:
 *                 type: integer
 *                 description: Overall progress percentage
 *               quizScore:
 *                 type: integer
 *                 description: Quiz score if applicable
 *     responses:
 *       200:
 *         description: Progress updated
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put('/:id/progress', updateProgress);

/**
 * @swagger
 * /api/training/{id}/rate:
 *   post:
 *     summary: Rate a training module
 *     tags: [Training]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Module ID
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
 *                 example: 4
 *               review:
 *                 type: string
 *                 example: Very informative module!
 *     responses:
 *       200:
 *         description: Rating submitted
 *       400:
 *         description: Must complete module before rating
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post('/:id/rate', rateModule);

module.exports = router;
