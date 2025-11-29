/**
 * Stats Middleware
 * Tracks API endpoint usage statistics
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */

class StatsMiddleware {
    constructor(database) {
        this.database = database;
    }

    /**
     * Middleware to track endpoint usage
     */
    trackEndpointUsage() {
        return async (req, res, next) => {
            // Track the endpoint usage after response is sent
            const originalSend = res.json;
            res.json = function(data) {
                // Track endpoint usage (don't await to avoid blocking response)
                const method = req.method;
                const endpoint = req.route ? req.route.path : req.path;
                const userId = req.user ? req.user.userId : null;
                
                // Track stats asynchronously
                if (userId) {
                    database.incrementApiCalls(userId, method, endpoint).catch(err => {
                        console.error('Error tracking endpoint usage:', err);
                    });
                }
                
                // Call original send
                return originalSend.call(this, data);
            };
            
            next();
        };
    }
}

module.exports = StatsMiddleware;

