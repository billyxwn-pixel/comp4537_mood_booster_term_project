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
        /**
         * @swagger
         * /api/v1/chat/send:
         *   post:
         *     summary: Send a chat message
         *     tags: [Chat]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - message
         *             properties:
         *               message:
         *                 type: string
         *                 example: "How are you today?"
         *     responses:
         *       200:
         *         description: Message sent successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                 response:
         *                   type: string
         *                 apiCallsUsed:
         *                   type: integer
         *                 apiCallsRemaining:
         *                   type: integer
         *       400:
         *         description: Message is required
         *       401:
         *         description: Unauthorized
         */
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

        /**
         * @swagger
         * /api/v1/chat/history:
         *   get:
         *     summary: Get user chat history
         *     tags: [Chat]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Chat history retrieved successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                 history:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       id:
         *                         type: integer
         *                       user_message:
         *                         type: string
         *                       bot_response:
         *                         type: string
         *                       created_at:
         *                         type: string
         *       401:
         *         description: Unauthorized
         */
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
