const axios = require('axios');

/**
 * Chat Service
 * Handles communication with LLM service
 */
class ChatService {
    constructor(database, llmServiceUrl) {
        this.database = database;
        this.llmServiceUrl = llmServiceUrl;
        this.maxFreeCalls = 20;
    }

    /**
     * Send message to LLM and get response
     */
    async sendMessage(userId, userMessage) {
        try {
            // Get user to check API call limit
            const user = await this.database.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Check if user has exceeded free API calls
            const hasExceededLimit = user.api_calls_used >= this.maxFreeCalls;

            // Call LLM service
            let botResponse;
            try {
                const response = await axios.post(`${this.llmServiceUrl}/api/chat`, {
                    message: userMessage
                }, {
                    timeout: 30000 // 30 second timeout
                });
                botResponse = response.data.response;
            } catch (error) {
                console.error('Error calling LLM service:', error.message);
                botResponse = "I'm having trouble connecting right now. Please try again later! 😊";
            }

            // Increment API calls count
            await this.database.incrementApiCalls(userId);

            // Save chat history
            await this.database.saveChatHistory(userId, userMessage, botResponse);

            // Get updated user info
            const updatedUser = await this.database.getUserById(userId);

            return {
                success: true,
                response: botResponse,
                hasExceededLimit: updatedUser.api_calls_used >= this.maxFreeCalls,
                apiCallsRemaining: Math.max(0, this.maxFreeCalls - updatedUser.api_calls_used),
                apiCallsUsed: updatedUser.api_calls_used
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get user's chat history
     */
    async getChatHistory(userId) {
        try {
            const history = await this.database.getChatHistory(userId);
            return {
                success: true,
                history: history.reverse() // Return in chronological order
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sanitize message input
     */
    sanitizeMessage(message) {
        if (typeof message !== 'string') {
            return '';
        }
        // Remove script tags and other potentially dangerous content
        return message
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .trim()
            .substring(0, 1000); // Limit message length
    }
}

module.exports = ChatService;
