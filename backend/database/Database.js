const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

/**
 * Database class to handle all database operations
 * Implements OOP principles with singleton pattern
 * 
 * Note: ChatGPT was used for syntax correction and debugging
 */
class Database {
    constructor(dbPath = './database.db') {
        this.dbPath = dbPath;
        this.db = null;
    }

    /**
     * Initialize database connection and create tables
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    console.log('Database connected');
                    // Enable foreign keys
                    this.db.run('PRAGMA foreign_keys = ON', (err) => {
                        if (err) {
                            console.error('Error enabling foreign keys:', err);
                            reject(err);
                        } else {
                            this.createTables().then(resolve).catch(reject);
                        }
                    });
                }
            });
        });
    }

    /**
     * Create all necessary tables
     */
    async createTables() {
        return new Promise((resolve, reject) => {
            const queries = [
                // Users table
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    is_admin INTEGER DEFAULT 0,
                    api_calls_used INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                // Chat history table
                `CREATE TABLE IF NOT EXISTS chat_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    user_message TEXT NOT NULL,
                    bot_response TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )`,
                // API endpoint usage stats table (separate entity for proper DB design)
                `CREATE TABLE IF NOT EXISTS endpoint_stats (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    method TEXT NOT NULL,
                    endpoint TEXT NOT NULL,
                    request_count INTEGER DEFAULT 0,
                    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(method, endpoint)
                )`,
                // User API consumption per endpoint (for user breakdown)
                `CREATE TABLE IF NOT EXISTS user_endpoint_usage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    method TEXT NOT NULL,
                    endpoint TEXT NOT NULL,
                    request_count INTEGER DEFAULT 0,
                    last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    UNIQUE(user_id, method, endpoint)
                )`,
                // Create index for faster lookups
                `CREATE INDEX IF NOT EXISTS idx_user_id ON chat_history(user_id)`,
                `CREATE INDEX IF NOT EXISTS idx_email ON users(email)`,
                `CREATE INDEX IF NOT EXISTS idx_endpoint_stats ON endpoint_stats(method, endpoint)`,
                `CREATE INDEX IF NOT EXISTS idx_user_endpoint_usage ON user_endpoint_usage(user_id)`
            ];

            // Execute queries sequentially to ensure proper order
            this.executeQueriesSequentially(queries, 0, resolve, reject);
        });
    }

    /**
     * Execute queries sequentially
     */
    executeQueriesSequentially(queries, index, resolve, reject) {
        if (index >= queries.length) {
            // All queries completed, initialize admin user
            console.log('All tables and indexes created successfully');
            this.initializeAdminUser().then(resolve).catch(reject);
            return;
        }

        const query = queries[index];
        console.log(`Executing query ${index + 1}/${queries.length}...`);
        this.db.run(query, (err) => {
            if (err) {
                console.error(`Error executing query ${index + 1}/${queries.length}:`, err);
                console.error('Query:', query.substring(0, 100) + '...');
                console.error('Full error:', err.message);
                reject(err);
            } else {
                console.log(`Query ${index + 1}/${queries.length} completed successfully`);
                // Execute next query
                this.executeQueriesSequentially(queries, index + 1, resolve, reject);
            }
        });
    }

    /**
     * Initialize admin user if it doesn't exist
     */
    async initializeAdminUser() {
        return new Promise((resolve, reject) => {
            const adminEmail = 'admin@admin.com';
            const adminPassword = '111';
            
            // Check if admin exists
            this.db.get('SELECT id FROM users WHERE email = ?', [adminEmail], async (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!row) {
                    // Create admin user
                    const passwordHash = await bcrypt.hash(adminPassword, 10);
                    this.db.run(
                        'INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, ?)',
                        [adminEmail, passwordHash, 1],
                        async (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log('Admin user created');
                                // Also create test user
                                await this.initializeTestUser();
                                resolve();
                            }
                        }
                    );
                } else {
                    // Even if admin exists, ensure test user exists
                    this.initializeTestUser().then(() => resolve()).catch(() => resolve());
                }
            });
        });
    }

    /**
     * Initialize test user if it doesn't exist
     */
    async initializeTestUser() {
        return new Promise((resolve, reject) => {
            const testEmail = 'hello@hello.com';
            const testPassword = '222';
            
            // Check if test user exists
            this.db.get('SELECT id FROM users WHERE email = ?', [testEmail], async (err, row) => {
                if (err) {
                    // Non-fatal error, just log and continue
                    console.warn('Error checking test user:', err);
                    resolve();
                    return;
                }

                if (!row) {
                    // Create test user
                    const passwordHash = await bcrypt.hash(testPassword, 10);
                    this.db.run(
                        'INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, ?)',
                        [testEmail, passwordHash, 0],
                        (err) => {
                            if (err) {
                                // Non-fatal error, just log and continue
                                console.warn('Error creating test user:', err);
                            } else {
                                console.log('Test user created');
                            }
                            resolve();
                        }
                    );
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Create a new user
     */
    async createUser(email, passwordHash) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO users (email, password_hash) VALUES (?, ?)',
                [email, passwordHash],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ id: this.lastID, email, api_calls_used: 0 });
                    }
                }
            );
        });
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id, email, password_hash, is_admin, api_calls_used FROM users WHERE email = ?',
                [email],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row || null);
                    }
                }
            );
        });
    }

    /**
     * Get user by ID
     */
    async getUserById(userId) {
        return new Promise((resolve, reject) => {
            this.db.get(
                'SELECT id, email, is_admin, api_calls_used FROM users WHERE id = ?',
                [userId],
                (err, row) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row || null);
                    }
                }
            );
        });
    }

    /**
     * Increment API calls for a user and track endpoint usage
     */
    async incrementApiCalls(userId, method, endpoint) {
        return new Promise((resolve, reject) => {
            // Track endpoint stats (global) - always track
            this.db.run(
                `INSERT INTO endpoint_stats (method, endpoint, request_count, last_updated)
                 VALUES (?, ?, 1, CURRENT_TIMESTAMP)
                 ON CONFLICT(method, endpoint) DO UPDATE SET
                 request_count = request_count + 1,
                 last_updated = CURRENT_TIMESTAMP`,
                [method, endpoint],
                (err) => {
                    if (err) {
                        console.error('Error tracking endpoint stats:', err);
                    }
                }
            );
            
            // Only track user-specific stats if userId is provided
            if (userId) {
                // Increment user's total API calls
                this.db.run(
                    'UPDATE users SET api_calls_used = api_calls_used + 1 WHERE id = ?',
                    [userId],
                    (err) => {
                        if (err) {
                            console.error('Error incrementing user API calls:', err);
                        }
                    }
                );
                
                // Track user-specific endpoint usage
                this.db.run(
                    `INSERT INTO user_endpoint_usage (user_id, method, endpoint, request_count, last_used)
                     VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
                     ON CONFLICT(user_id, method, endpoint) DO UPDATE SET
                     request_count = request_count + 1,
                     last_used = CURRENT_TIMESTAMP`,
                    [userId, method, endpoint],
                    (err) => {
                        if (err) {
                            console.error('Error tracking user endpoint usage:', err);
                        }
                        resolve();
                    }
                );
            } else {
                // No userId, just resolve
                resolve();
            }
        });
    }

    /**
     * Get endpoint usage statistics
     */
    async getEndpointStats() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT method, endpoint, request_count FROM endpoint_stats ORDER BY request_count DESC',
                [],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                }
            );
        });
    }

    /**
     * Get user endpoint usage statistics
     */
    async getUserEndpointUsage(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT method, endpoint, request_count FROM user_endpoint_usage WHERE user_id = ? ORDER BY request_count DESC',
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                }
            );
        });
    }

    /**
     * Save chat message to history
     */
    async saveChatHistory(userId, userMessage, botResponse) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'INSERT INTO chat_history (user_id, user_message, bot_response) VALUES (?, ?, ?)',
                [userId, userMessage, botResponse],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    /**
     * Get chat history for a user
     */
    async getChatHistory(userId, limit = 50) {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT id, user_message, bot_response, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
                [userId, limit],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                }
            );
        });
    }

    /**
     * Get all users (admin only)
     */
    async getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all(
                'SELECT id, email, is_admin, api_calls_used, created_at FROM users ORDER BY created_at DESC',
                [],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                }
            );
        });
    }

    /**
     * Update user email
     */
    async updateUserEmail(userId, email) {
        return new Promise((resolve, reject) => {
            this.db.run(
                'UPDATE users SET email = ? WHERE id = ?',
                [email, userId],
                function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }

    /**
     * Delete user (admin only)
     */
    async deleteUser(userId) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM users WHERE id = ?', [userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = Database;
