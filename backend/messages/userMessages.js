/**
 * User-facing message strings
 * All user messages are stored here for easy maintenance
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */

module.exports = {
    // Authentication messages
    auth: {
        emailRequired: 'Email is required',
        passwordRequired: 'Password is required',
        emailPasswordRequired: 'Email and password are required',
        invalidEmail: 'Invalid email format',
        registrationSuccess: 'Registration successful',
        registrationFailed: 'Registration failed',
        loginSuccess: 'Login successful',
        loginFailed: 'Login failed',
        invalidCredentials: 'Invalid email or password',
        emailExists: 'Email already exists',
        userNotFound: 'User not found'
    },
    
    // User profile messages
    profile: {
        profileUpdated: 'Profile updated successfully',
        profileUpdateFailed: 'Failed to update profile',
        emailAlreadyExists: 'Email already exists',
        invalidUserId: 'Invalid user ID'
    },
    
    // Chat messages
    chat: {
        messageRequired: 'Message is required',
        messageSent: 'Message sent successfully',
        messageFailed: 'Failed to send message',
        historyLoadFailed: 'Failed to load chat history',
        apiLimitExceeded: 'You have exceeded your free API calls (20 calls). The service will continue to work, but please note this limitation.'
    },
    
    // Admin messages
    admin: {
        usersLoadFailed: 'Failed to load users',
        userDeleted: 'User deleted successfully',
        userDeleteFailed: 'Failed to delete user',
        cannotDeleteSelf: 'Cannot delete your own account',
        chatHistoryLoadFailed: 'Failed to load chat history',
        statsLoadFailed: 'Failed to load statistics'
    },
    
    // General messages
    general: {
        internalError: 'Internal server error',
        endpointNotFound: 'Endpoint not found',
        unauthorized: 'Unauthorized access',
        forbidden: 'Forbidden - Admin access required',
        validationError: 'Validation error',
        success: 'Operation successful',
        failed: 'Operation failed'
    },
    
    // API consumption messages
    api: {
        callsUsed: 'API Calls: {used} / {limit} used',
        callsRemaining: '({remaining} remaining)',
        noConsumptionData: 'No API consumption data available'
    }
};

