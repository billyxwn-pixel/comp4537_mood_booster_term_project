const express = require('express');
const router = express.Router();

/**
 * Admin Routes
 */
class AdminRoutes {
    constructor(database, authMiddleware) {
        this.database = database;
        this.authMiddleware = authMiddleware;
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        // Get all users (admin only)
        this.router.get('/users', 
            this.authMiddleware.verifyToken(), 
            this.authMiddleware.requireAdmin(), 
            async (req, res) => {
                try {
                    const users = await this.database.getAllUsers();
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
    }

    getRouter() {
        return this.router;
    }
}

module.exports = AdminRoutes;
