const express = require('express');
const router = express.Router();

/**
 * Chat Routes
 */
class ChatRoutes {
    constructor(chatService, authMiddleware) {
        this.chatService = chatService;
        this.authMiddleware = authMiddleware;
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        // Send message endpoint (requires authentication)
        this.router.post('/send', this.authMiddleware.verifyToken(), async (req, res) => {
            try {
                const { message } = req.body;
                const userId = req.user.userId;

                if (!message || typeof message !== 'string' || message.trim().length === 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Message is required'
                    });
                }

                // Sanitize message
                const sanitizedMessage = this.chatService.sanitizeMessage(message);

                const result = await this.chatService.sendMessage(userId, sanitizedMessage);
                
                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(500).json(result);
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        });

        // Get chat history endpoint (requires authentication)
        this.router.get('/history', this.authMiddleware.verifyToken(), async (req, res) => {
            try {
                const userId = req.user.userId;
                const result = await this.chatService.getChatHistory(userId);
                
                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(500).json(result);
                }
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        });
    }

    getRouter() {
        return this.router;
    }
}

module.exports = ChatRoutes;
