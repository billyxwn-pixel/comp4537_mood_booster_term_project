const express = require('express');
const router = express.Router();

/**
 * Authentication Routes
 */
class AuthRoutes {
    constructor(authService) {
        this.authService = authService;
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        // Register endpoint
        this.router.post('/register', async (req, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email and password are required'
                    });
                }

                // Sanitize input
                const sanitizedEmail = this.authService.sanitizeInput(email.toLowerCase().trim());

                const result = await this.authService.register(sanitizedEmail, password);
                
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

        // Login endpoint
        this.router.post('/login', async (req, res) => {
            try {
                const { email, password } = req.body;

                if (!email || !password) {
                    return res.status(400).json({
                        success: false,
                        error: 'Email and password are required'
                    });
                }

                // Sanitize input
                const sanitizedEmail = this.authService.sanitizeInput(email.toLowerCase().trim());

                const result = await this.authService.login(sanitizedEmail, password);
                
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
