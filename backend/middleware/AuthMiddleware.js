/**
 * Authentication Middleware
 * Verifies JWT tokens and extracts user information
 */
class AuthMiddleware {
    constructor(authService) {
        this.authService = authService;
    }

    /**
     * Middleware to verify JWT token
     */
    verifyToken() {
        return (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader) {
                    return res.status(401).json({
                        success: false,
                        error: 'No authorization header provided'
                    });
                }

                const token = authHeader.startsWith('Bearer ') 
                    ? authHeader.slice(7) 
                    : authHeader;

                const decoded = this.authService.verifyToken(token);
                if (!decoded.valid) {
                    return res.status(401).json({
                        success: false,
                        error: 'Invalid or expired token'
                    });
                }

                // Attach user info to request
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    isAdmin: decoded.isAdmin
                };

                next();
            } catch (error) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication failed'
                });
            }
        };
    }

    /**
     * Middleware to check if user is admin
     */
    requireAdmin() {
        return (req, res, next) => {
            if (!req.user || !req.user.isAdmin) {
                return res.status(403).json({
                    success: false,
                    error: 'Admin access required'
                });
            }
            next();
        };
    }
}

module.exports = AuthMiddleware;
