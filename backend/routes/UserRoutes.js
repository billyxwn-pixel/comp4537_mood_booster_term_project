const express = require('express');
const router = express.Router();

/**
 * User Routes
 */
class UserRoutes {
    constructor(database, authMiddleware) {
        this.database = database;
        this.authMiddleware = authMiddleware;
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        // Get user profile (requires authentication)
        this.router.get('/profile', this.authMiddleware.verifyToken(), async (req, res) => {
            try {
                const userId = req.user.userId;
                const user = await this.database.getUserById(userId);
                
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                }

                res.status(200).json({
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        is_admin: user.is_admin === 1,
                        api_calls_used: user.api_calls_used,
                        api_calls_remaining: Math.max(0, 20 - user.api_calls_used)
                    }
                });
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

module.exports = UserRoutes;
