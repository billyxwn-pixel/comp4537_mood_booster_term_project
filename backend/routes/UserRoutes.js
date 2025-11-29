const express = require('express');
const router = express.Router();
const messages = require('../messages/userMessages');
const { validateEmail } = require('../utils/validation');

/**
 * User Routes
 * Note: ChatGPT was used for syntax correction and debugging
 */
class UserRoutes {
    constructor(database, authMiddleware) {
        this.database = database;
        this.authMiddleware = authMiddleware;
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        /**
         * @swagger
         * /api/v1/user/profile:
         *   get:
         *     summary: Get user profile
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: User profile retrieved successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                 user:
         *                   type: object
         *                   properties:
         *                     id:
         *                       type: integer
         *                     email:
         *                       type: string
         *                     is_admin:
         *                       type: boolean
         *                     api_calls_used:
         *                       type: integer
         *                     api_calls_remaining:
         *                       type: integer
         *       401:
         *         description: Unauthorized
         *       404:
         *         description: User not found
         */
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

                // Track endpoint usage
                if (this.database && userId) {
                    this.database.incrementApiCalls(userId, 'GET', '/api/v1/user/profile').catch(err => {
                        console.error('Error tracking endpoint usage:', err);
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

        /**
         * @swagger
         * /api/v1/user/endpoint-usage:
         *   get:
         *     summary: Get user endpoint usage statistics
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Endpoint usage retrieved successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean
         *                 endpointUsage:
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
         */
        // Get user endpoint usage (requires authentication)
        this.router.get('/endpoint-usage', this.authMiddleware.verifyToken(), async (req, res) => {
            try {
                const userId = req.user.userId;
                const endpointUsage = await this.database.getUserEndpointUsage(userId);
                
                // Track endpoint usage
                if (this.database && userId) {
                    this.database.incrementApiCalls(userId, 'GET', '/api/v1/user/endpoint-usage').catch(err => {
                        console.error('Error tracking endpoint usage:', err);
                    });
                }
                
                res.status(200).json({
                    success: true,
                    endpointUsage: endpointUsage || []
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        });

        /**
         * @swagger
         * /api/v1/user/profile:
         *   put:
         *     summary: Update user profile
         *     tags: [User]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: false
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *                 example: newemail@example.com
         *     responses:
         *       200:
         *         description: Profile updated successfully
         *       400:
         *         description: Invalid email format
         *       401:
         *         description: Unauthorized
         *       409:
         *         description: Email already exists
         */
        // Update user profile (PUT method - requires authentication)
        this.router.put('/profile', this.authMiddleware.verifyToken(), async (req, res) => {
            try {
                const userId = req.user.userId;
                const { email } = req.body;

                // Input validation
                if (email) {
                    if (!validateEmail(email)) {
                        return res.status(400).json({
                            success: false,
                            error: messages.auth.invalidEmail
                        });
                    }
                }

                // Get current user
                const user = await this.database.getUserById(userId);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        error: 'User not found'
                    });
                }

                // Update email if provided
                if (email) {
                    const sanitizedEmail = email.toLowerCase().trim();
                    await this.database.updateUserEmail(userId, sanitizedEmail);
                }

                // Track endpoint usage
                if (this.database && userId) {
                    this.database.incrementApiCalls(userId, 'PUT', '/api/v1/user/profile').catch(err => {
                        console.error('Error tracking endpoint usage:', err);
                    });
                }
                
                // Get updated user
                const updatedUser = await this.database.getUserById(userId);
                res.status(200).json({
                    success: true,
                    message: messages.profile.profileUpdated,
                    user: {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        is_admin: updatedUser.is_admin === 1,
                        api_calls_used: updatedUser.api_calls_used,
                        api_calls_remaining: Math.max(0, 20 - updatedUser.api_calls_used)
                    }
                });
            } catch (error) {
                if (error.message && error.message.includes('UNIQUE constraint')) {
                    return res.status(409).json({
                        success: false,
                        error: messages.profile.emailAlreadyExists
                    });
                }
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
