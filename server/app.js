const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'DKN API Documentation',
    customfavIcon: '/favicon.ico'
}));

// Import Routes
const authRoutes = require('./routes/authRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const validationRoutes = require('./routes/validationRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const managerRoutes = require('./routes/managerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const auditRoutes = require('./routes/auditRoutes');
const migrationRoutes = require('./routes/migrationRoutes');
const configRoutes = require('./routes/configRoutes');
const mentorshipRoutes = require('./routes/mentorshipRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Use Routes
app.get('/', (req, res) => res.send('DKN API is Running'));
app.use('/api/auth', authRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/validations', validationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/migration', migrationRoutes);
app.use('/api/config', configRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/chatbot', chatbotRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
