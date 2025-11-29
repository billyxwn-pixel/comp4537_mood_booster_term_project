/**
 * Input Validation Utilities
 * Server-side input validation for all endpoints
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }
    // Email regex pattern
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validate number
 * @param {any} value - Value to validate
 * @returns {boolean} - True if valid number
 */
function validateNumber(value) {
    if (value === null || value === undefined) {
        return false;
    }
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
}

/**
 * Validate integer
 * @param {any} value - Value to validate
 * @returns {boolean} - True if valid integer
 */
function validateInteger(value) {
    if (!validateNumber(value)) {
        return false;
    }
    return Number.isInteger(Number(value));
}

/**
 * Validate string (non-empty)
 * @param {any} value - Value to validate
 * @param {number} minLength - Minimum length (optional)
 * @param {number} maxLength - Maximum length (optional)
 * @returns {boolean} - True if valid string
 */
function validateString(value, minLength = 0, maxLength = Infinity) {
    if (!value || typeof value !== 'string') {
        return false;
    }
    const trimmed = value.trim();
    return trimmed.length >= minLength && trimmed.length <= maxLength;
}

module.exports = {
    validateEmail,
    validateNumber,
    validateInteger,
    validateString
};

