const { GoogleGenerativeAI } = require('@google/generative-ai');
const KnowledgeItem = require('../models/KnowledgeItem');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const TrainingModule = require('../models/TrainingModule');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });


// System context about DKN
const getSystemContext = async (user) => {
    try {
        // Fetch relevant data for context
        const [knowledgeCount, recentKnowledge, leaderboardData, trainingModules, userCount] = await Promise.all([
            KnowledgeItem.countDocuments({ status: 'Approved' }),
            KnowledgeItem.find({ status: 'Approved' })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('title category tags description')
                .lean(),
            Leaderboard.find().sort({ points: -1 }).limit(5).populate('user', 'username').lean(),
            TrainingModule.find({ isActive: true }).select('title description category').lean(),
            User.countDocuments()
        ]);

        const topContributors = leaderboardData.map(l => ({
            username: l.user?.username || 'Unknown',
            points: l.points,
            rank: l.rank
        }));

        return `
You are the DKN (Digital Knowledge Network) AI Assistant. You help users navigate and understand the platform.

## About DKN
DKN is an enterprise knowledge management platform for sharing, validating, and organizing organizational knowledge.

## Current User
- Username: ${user.username}
- Email: ${user.email}
- Role: ${user.role}

## Platform Statistics
- Total Approved Knowledge Items: ${knowledgeCount}
- Total Users: ${userCount}
- Active Training Modules: ${trainingModules.length}

## Recent Knowledge Items
${recentKnowledge.map(k => `- "${k.title}" (${k.category}) - Tags: ${k.tags?.join(', ') || 'None'}`).join('\n')}

## Top Contributors (Leaderboard)
${topContributors.map((c, i) => `${i + 1}. ${c.username}: ${c.points} points`).join('\n')}

## Available Training Modules
${trainingModules.map(t => `- "${t.title}" (${t.category}): ${t.description?.substring(0, 100) || 'No description'}`).join('\n')}

## Platform Features
1. **Knowledge Upload**: Users can submit documents, presentations, and templates
2. **Validation Workflow**: Multi-stage review by Knowledge Champions
3. **Gamification**: Leaderboard with points for contributions
4. **AI Features**: Auto-tagging, duplicate detection, recommendations
5. **Mentorship**: Find mentors, schedule sessions
6. **Training**: Enroll in courses, earn certifications
7. **Governance**: Policy compliance review
8. **Audit Logs**: Track all system activities

## User Roles
- **Consultant**: Upload and view knowledge
- **Knowledge Champion**: Review and approve content
- **Project Manager**: View team performance
- **Administrator**: Full system access
- **Governance Council**: Policy compliance

## Guidelines for Responses
- Be helpful, concise, and friendly
- Provide specific information when available
- Guide users to relevant features
- If you don't know something specific to this DKN instance, say so
- Format responses nicely with markdown when appropriate
`;
    } catch (error) {
        console.error('Error building context:', error);
        return `You are the DKN AI Assistant. Help users with the Digital Knowledge Network platform.`;
    }
};

// Chat with AI
const chat = async (message, user, conversationHistory = []) => {
    try {
        const systemContext = await getSystemContext(user);

        // Build chat history
        const history = conversationHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Start chat with history
        const chatSession = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: `System Context (use this to answer questions):\n${systemContext}` }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I am the DKN AI Assistant and will help users with the Digital Knowledge Network platform using this context. How can I help you today?' }]
                },
                ...history
            ],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });

        // Send message and get response
        const result = await chatSession.sendMessage(message);
        const response = result.response.text();

        return {
            success: true,
            response: response
        };
    } catch (error) {
        console.error('Chatbot error:', error);
        return {
            success: false,
            response: 'Sorry, I encountered an error. Please try again.',
            error: error.message
        };
    }
};

module.exports = { chat };
