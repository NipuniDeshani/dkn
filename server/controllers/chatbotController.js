const chatbotService = require('../services/chatbotService');

// @desc    Send message to chatbot
// @route   POST /api/chatbot/message
// @access  Private
const sendMessage = async (req, res) => {
    try {
        const { message, conversationHistory } = req.body;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const result = await chatbotService.chat(
            message,
            req.user,
            conversationHistory || []
        );

        if (result.success) {
            res.json({
                success: true,
                response: result.response
            });
        } else {
            res.status(500).json({
                success: false,
                message: result.response,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Chatbot controller error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process message',
            error: error.message
        });
    }
};

module.exports = { sendMessage };
