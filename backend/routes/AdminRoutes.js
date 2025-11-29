const express = require('express');
const router = express.Router();

/**
 * Admin Routes
 * Note: ChatGPT was used for syntax correction and debugging
 */
class AdminRoutes {
    constructor(database, authMiddleware) {
        this.database = database;
        this.authMiddleware = authMiddleware;
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        /**
         * @swagger
         * /api/v1/admin/users:
         *   get:
         *     summary: Get all users (admin only)
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Users retrieved successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                 users:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       id:
         *                         type: integer
         *                       email:
         *                         type: string
         *                       is_admin:
         *                         type: boolean
         *                       api_calls_used:
         *                         type: integer
         *       401:
         *         description: Unauthorized
         *       403:
         *         description: Forbidden - Admin access required
         */
        // Get all users (admin only)
        this.router.get('/users', 
            this.authMiddleware.verifyToken(), 
            this.authMiddleware.requireAdmin(), 
            async (req, res) => {
                try {
                    const users = await this.database.getAllUsers();
                    
                    // Track endpoint usage
                    if (this.database && req.user.userId) {
                        this.database.incrementApiCalls(req.user.userId, 'GET', '/api/v1/admin/users').catch(err => {
                            console.error('Error tracking endpoint usage:', err);
                        });
                    }
                    
                    res.status(200).json({
                        success: true,
                        users: users.map(user => ({
                            id: user.id,
                            email: user.email,
                            is_admin: user.is_admin === 1,
                            api_calls_used: user.api_calls_used,
                            created_at: user.created_at
                        }))
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error'
                    });
                }
            }
        );

        /**
         * @swagger
         * /api/v1/admin/chat-history/{userId}:
         *   get:
         *     summary: Get chat history for a specific user (admin only)
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: integer
         *         description: User ID
         *     responses:
         *       200:
         *         description: Chat history retrieved successfully
         *       400:
         *         description: Invalid user ID
         *       401:
         *         description: Unauthorized
         *       403:
         *         description: Forbidden - Admin access required
         */
        // Get chat history for a specific user (admin only)
        this.router.get('/chat-history/:userId', 
            this.authMiddleware.verifyToken(), 
            this.authMiddleware.requireAdmin(), 
            async (req, res) => {
                try {
                    const userId = parseInt(req.params.userId);
                    if (isNaN(userId)) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid user ID'
                        });
                    }

                    const history = await this.database.getChatHistory(userId);
                    
                    // Track endpoint usage
                    if (this.database && req.user.userId) {
                        this.database.incrementApiCalls(req.user.userId, 'GET', '/api/v1/admin/chat-history/:userId').catch(err => {
                            console.error('Error tracking endpoint usage:', err);
                        });
                    }
                    
                    res.status(200).json({
                        success: true,
                        userId,
                        history: history.reverse() // Return in chronological order
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error'
                    });
                }
            }
        );

        /**
         * @swagger
         * /api/v1/admin/users/{userId}:
         *   delete:
         *     summary: Delete a user (admin only)
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: userId
         *         required: true
         *         schema:
         *           type: integer
         *         description: User ID to delete
         *     responses:
         *       200:
         *         description: User deleted successfully
         *       400:
         *         description: Invalid user ID or cannot delete own account
         *       401:
         *         description: Unauthorized
         *       403:
         *         description: Forbidden - Admin access required
         */
        // Delete user (admin only)
        this.router.delete('/users/:userId', 
            this.authMiddleware.verifyToken(), 
            this.authMiddleware.requireAdmin(), 
            async (req, res) => {
                try {
                    const userId = parseInt(req.params.userId);
                    if (isNaN(userId)) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid user ID'
                        });
                    }

                    // Prevent deleting yourself
                    if (userId === req.user.userId) {
                        return res.status(400).json({
                            success: false,
                            error: 'Cannot delete your own account'
                        });
                    }

                    await this.database.deleteUser(userId);
                    
                    // Track endpoint usage
                    if (this.database && req.user.userId) {
                        this.database.incrementApiCalls(req.user.userId, 'DELETE', '/api/v1/admin/users/:userId').catch(err => {
                            console.error('Error tracking endpoint usage:', err);
                        });
                    }
                    
                    res.status(200).json({
                        success: true,
                        message: 'User deleted successfully'
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error'
                    });
                }
            }
        );

        /**
         * @swagger
         * /api/v1/admin/stats/endpoints:
         *   get:
         *     summary: Get endpoint usage statistics (admin only)
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Endpoint stats retrieved successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                 stats:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       method:
         *                         type: string
         *                       endpoint:
         *                         type: string
         *                       request_count:
         *                         type: integer
         *       401:
         *         description: Unauthorized
         *       403:
         *         description: Forbidden - Admin access required
         */
        // Get endpoint usage statistics (admin only)
        this.router.get('/stats/endpoints', 
            this.authMiddleware.verifyToken(), 
            this.authMiddleware.requireAdmin(), 
            async (req, res) => {
                try {
                    const stats = await this.database.getEndpointStats();
                    res.status(200).json({
                        success: true,
                        stats: stats
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error'
                    });
                }
            }
        );

        /**
         * @swagger
         * /api/v1/admin/stats/users:
         *   get:
         *     summary: Get user API consumption statistics (admin only)
         *     tags: [Admin]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: User stats retrieved successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                 users:
         *                   type: array
         *                   items:
         *                     type: object
         *                     properties:
         *                       id:
         *                         type: integer
         *                       email:
         *                         type: string
         *                       total_requests:
         *                         type: integer
         *                       endpoint_breakdown:
         *                         type: array
         *       401:
         *         description: Unauthorized
         *       403:
         *         description: Forbidden - Admin access required
         */
        // Get all users with their API consumption (admin only)
        this.router.get('/stats/users', 
            this.authMiddleware.verifyToken(), 
            this.authMiddleware.requireAdmin(), 
            async (req, res) => {
                try {
                    const users = await this.database.getAllUsers();
                    const usersWithStats = await Promise.all(
                        users.map(async (user) => {
                            const endpointUsage = await this.database.getUserEndpointUsage(user.id);
                            const totalRequests = endpointUsage.reduce((sum, item) => sum + item.request_count, 0);
                            return {
                                id: user.id,
                                email: user.email,
                                total_requests: totalRequests || user.api_calls_used,
                                endpoint_breakdown: endpointUsage
                            };
                        })
                    );
                    res.status(200).json({
                        success: true,
                        users: usersWithStats
                    });
                } catch (error) {
                    res.status(500).json({
                        success: false,
                        error: 'Internal server error'
                    });
                }
            }
        );
    }

    getRouter() {
        return this.router;
    }
}

module.exports = AdminRoutes;
