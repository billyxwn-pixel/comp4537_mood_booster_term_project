const express = require('express');
const router = express.Router();
const messages = require('../messages/userMessages');
const { validateEmail, validateString } = require('../utils/validation');

/**
 * Authentication Routes
 * Note: ChatGPT was used for syntax correction and debugging
 */
class AuthRoutes {
    constructor(authService, database) {
        this.authService = authService;
        this.database = database;
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        /**
         * @swagger
         * /api/v1/auth/register:
         *   post:
         *     summary: Register a new user
         *     tags: [Authentication]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *               - password
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *                 example: user@example.com
         *               password:
         *                 type: string
         *                 minLength: 3
         *                 example: password123
         *     responses:
         *       201:
         *         description: User registered successfully
         *       400:
         *         description: Validation error
         */
        // Register endpoint
        this.router.post('/register', async (req, res) => {
            try {
                const { email, password } = req.body;

                // Input validation
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        error: messages.auth.emailPasswordRequired
                    });
                }

                if (!validateEmail(email)) {
                    return res.status(400).json({
                        success: false,
                        error: messages.auth.invalidEmail
                    });
                }

                if (!validateString(password, 3)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Password must be at least 3 characters long'
                    });
                }

                // Sanitize input
                const sanitizedEmail = this.authService.sanitizeInput(email.toLowerCase().trim());

                const result = await this.authService.register(sanitizedEmail, password);
                
                // Track endpoint usage (for public endpoints, track without userId)
                if (this.database) {
                    this.database.incrementApiCalls(null, 'POST', '/api/v1/auth/register').catch(err => {
                        console.error('Error tracking endpoint usage:', err);
                    });
                }
                
                if (result.success) {
                    res.status(201).json(result);
                } else {
                    res.status(400).json(result);
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
         * /api/v1/auth/login:
         *   post:
         *     summary: Login user
         *     tags: [Authentication]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *               - password
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *                 example: user@example.com
         *               password:
         *                 type: string
         *                 example: password123
         *     responses:
         *       200:
         *         description: Login successful
         *       401:
         *         description: Invalid credentials
         */
        // Login endpoint
        this.router.post('/login', async (req, res) => {
            try {
                const { email, password } = req.body;

                // Input validation
                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        error: messages.auth.emailPasswordRequired
                    });
                }

                if (!validateEmail(email)) {
                    return res.status(400).json({
                        success: false,
                        error: messages.auth.invalidEmail
                    });
                }

                // Sanitize input
                const sanitizedEmail = this.authService.sanitizeInput(email.toLowerCase().trim());

                const result = await this.authService.login(sanitizedEmail, password);
                
                // Track endpoint usage
                if (this.database) {
                    this.database.incrementApiCalls(null, 'POST', '/api/v1/auth/login').catch(err => {
                        console.error('Error tracking endpoint usage:', err);
                    });
                }
                
                if (result.success) {
                    res.status(200).json(result);
                } else {
                    res.status(401).json(result);
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

module.exports = AuthRoutes;
