const express = require('express');
const router = express.Router();

/**
 * Chat Routes
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */
class ChatRoutes {
    constructor(chatService, authMiddleware, database) {
        this.chatService = chatService;
        this.authMiddleware = authMiddleware;
        this.database = database;
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
                
                // Track endpoint usage
                if (this.database && userId) {
                    this.database.incrementApiCalls(userId, 'POST', '/api/v1/chat/send').catch(err => {
                        console.error('Error tracking endpoint usage:', err);
                    });
                }
                
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
                
                // Track endpoint usage
                if (this.database && userId) {
                    this.database.incrementApiCalls(userId, 'GET', '/api/v1/chat/history').catch(err => {
                        console.error('Error tracking endpoint usage:', err);
                    });
                }
                
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
