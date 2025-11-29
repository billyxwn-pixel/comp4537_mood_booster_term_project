require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('./database/Database');
const AuthService = require('./services/AuthService');
const ChatService = require('./services/ChatService');
const AuthMiddleware = require('./middleware/AuthMiddleware');
const AuthRoutes = require('./routes/AuthRoutes');
const ChatRoutes = require('./routes/ChatRoutes');
const UserRoutes = require('./routes/UserRoutes');
const AdminRoutes = require('./routes/AdminRoutes');

/**
 * Main Server Application
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */
class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.database = null;
        this.authService = null;
        this.chatService = null;
        this.authMiddleware = null;
    }

    /**
     * Initialize server components
     */
    async initialize() {
        try {
            // Initialize database
            this.database = new Database(process.env.DB_PATH || './database.db');
            await this.database.initialize();

            // Initialize services
            this.authService = new AuthService(
                this.database,
                process.env.JWT_SECRET || 'default_secret_change_in_production'
            );
            this.chatService = new ChatService(
                this.database,
                process.env.LLM_SERVICE_URL || 'http://localhost:5000'
            );
            this.authMiddleware = new AuthMiddleware(this.authService);

            // Setup middleware
            this.setupMiddleware();

            // Setup routes
            this.setupRoutes();

            console.log('Server initialized successfully');
        } catch (error) {
            console.error('Error initializing server:', error);
            process.exit(1);
        }
    }

    /**
     * Setup Express middleware
     */
    setupMiddleware() {
        // CORS configuration
        this.app.use(cors({
            origin: [
                "http://localhost:5173",
                "https://mood-booster-term-project-frontend.vercel.app"
            ],
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"]
        }));

        // Body parser
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging (simple)
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Setup API routes
     */
    setupRoutes() {
        // Swagger API documentation
        const { swaggerSpec, swaggerUi } = require('./config/swagger');
        this.app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
        this.app.get('/doc.json', (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.send(swaggerSpec);
        });

        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });

        // API routes
        const authRoutes = new AuthRoutes(this.authService, this.database);
        const chatRoutes = new ChatRoutes(this.chatService, this.authMiddleware, this.database);
        const userRoutes = new UserRoutes(this.database, this.authMiddleware);
        const adminRoutes = new AdminRoutes(this.database, this.authMiddleware);

        // API versioning - all routes under /api/v1
        this.app.use('/api/v1/auth', authRoutes.getRouter());
        this.app.use('/api/v1/chat', chatRoutes.getRouter());
        this.app.use('/api/v1/user', userRoutes.getRouter());
        this.app.use('/api/v1/admin', adminRoutes.getRouter());
        
        // Legacy routes for backward compatibility (redirect to v1)
        this.app.use('/api/auth', authRoutes.getRouter());
        this.app.use('/api/chat', chatRoutes.getRouter());
        this.app.use('/api/user', userRoutes.getRouter());
        this.app.use('/api/admin', adminRoutes.getRouter());

        // 404 handler
        this.app.use((req, res) => {
            res.status(404).json({ success: false, error: 'Endpoint not found' });
        });

        // Error handler
        this.app.use((err, req, res, next) => {
            console.error('Error:', err);
            res.status(500).json({ success: false, error: 'Internal server error' });
        });
    }

    /**
     * Start the server
     */
    async start() {
        await this.initialize();
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`LLM Service URL: ${process.env.LLM_SERVICE_URL || 'http://localhost:5000'}`);
        });
    }

    /**
     * Graceful shutdown
     */
    shutdown() {
        console.log('Shutting down server...');
        if (this.database) {
            this.database.close();
        }
        process.exit(0);
    }
}

// Start server
const server = new Server();
server.start();

// Handle graceful shutdown
process.on('SIGTERM', () => server.shutdown());
process.on('SIGINT', () => server.shutdown());
