const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Authentication Service
 * Handles user registration, login, and JWT token generation
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */
class AuthService {
    constructor(database, jwtSecret) {
        this.database = database;
        this.jwtSecret = jwtSecret;
        this.tokenExpiry = '24h';
    }

    /**
     * Register a new user
     */
    async register(email, password) {
        try {
            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Invalid email format');
            }

            // Validate password length
            if (password.length < 3) {
                throw new Error('Password must be at least 3 characters long');
            }

            // Check if user already exists
            const existingUser = await this.database.getUserByEmail(email);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create user
            const user = await this.database.createUser(email, passwordHash);

            // Generate JWT token
            const token = this.generateToken(user.id, email, false);

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    api_calls_used: user.api_calls_used
                },
                token
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            // Validate input
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Get user from database
            const user = await this.database.getUserByEmail(email);
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // Generate JWT token
            const token = this.generateToken(user.id, user.email, user.is_admin === 1);

            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    is_admin: user.is_admin === 1,
                    api_calls_used: user.api_calls_used
                },
                token
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate JWT token
     */
    generateToken(userId, email, isAdmin) {
        const payload = {
            userId,
            email,
            isAdmin
        };
        return jwt.sign(payload, this.jwtSecret, { expiresIn: this.tokenExpiry });
    }

    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            return {
                valid: true,
                userId: decoded.userId,
                email: decoded.email,
                isAdmin: decoded.isAdmin
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Sanitize input to prevent XSS
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }
}

module.exports = AuthService;
