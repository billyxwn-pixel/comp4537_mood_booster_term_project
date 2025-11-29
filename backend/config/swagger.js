/**
 * Swagger Configuration
 * API Documentation setup
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Mood Booster Chatbot API',
            version: '1.0.0',
            description: 'RESTful API for Mood Booster Chatbot application',
            contact: {
                name: 'API Support',
                email: 'support@moodbooster.com'
            }
        },
        servers: [
            {
                url: 'https://mood-booster-backend.onrender.com',
                description: 'Production server'
            },
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
    swaggerSpec,
    swaggerUi
};

