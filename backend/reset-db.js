/**
 * Script to reset the database
 * Run this if you're having database initialization issues
 */
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');

if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log('✅ Database file deleted successfully');
        console.log('You can now run "npm start" to recreate it');
    } catch (err) {
        console.error('❌ Error deleting database file:', err);
    }
} else {
    console.log('ℹ️  Database file does not exist');
    console.log('You can run "npm start" to create it');
}
