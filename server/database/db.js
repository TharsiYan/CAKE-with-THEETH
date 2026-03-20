const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'cake_shop.db');

// Check if running in Vercel environment
const isVercel = process.env.VERCEL === '1';

// In Vercel, use READONLY mode to avoid "EROFS: read-only file system" errors
const dbMode = isVercel 
    ? sqlite3.OPEN_READONLY 
    : (sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);

if (!isVercel) {
    // Ensure database directory exists only in local writable environment
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
}

// Create database connection
const db = new sqlite3.Database(DB_PATH, dbMode, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log(`Connected to SQLite database at: ${DB_PATH} (Vercel: ${isVercel})`);
        if (!isVercel) {
            initializeDatabase();
        }
    }
});

// Initialize database with schema
async function initializeDatabase() {
    try {
        // Enable foreign keys
        await runAsync('PRAGMA foreign_keys = ON');
        
        // Create tables one by one
        await createTables();
        
        // Create default admin
        await createDefaultAdmin();
        
        // Create default shop settings
        await createDefaultShopSettings();
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

async function createTables() {
    // Shop settings table
    await runAsync(`
        CREATE TABLE IF NOT EXISTS shop_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            shop_name TEXT NOT NULL DEFAULT 'Cake with THEETH',
            phone TEXT NOT NULL DEFAULT '0779788922',
            address TEXT NOT NULL DEFAULT 'Nedunkerny',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Admin credentials table
    await runAsync(`
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            username TEXT NOT NULL DEFAULT 'admin',
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Cakes table
    await runAsync(`
        CREATE TABLE IF NOT EXISTS cakes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            weight TEXT NOT NULL,
            price TEXT NOT NULL,
            price_range TEXT,
            type TEXT NOT NULL,
            selling_type TEXT NOT NULL CHECK (selling_type IN ('returnable', 'permanent')),
            description TEXT,
            images TEXT NOT NULL DEFAULT '[]',
            video TEXT,
            is_available INTEGER DEFAULT 1,
            likes INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Comments table
    await runAsync(`
        CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cake_id INTEGER NOT NULL,
            visitor_name TEXT NOT NULL DEFAULT 'Anonymous',
            comment TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
        )
    `);

    // Ratings table
    await runAsync(`
        CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cake_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            visitor_ip TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE,
            UNIQUE(cake_id, visitor_ip)
        )
    `);
}

async function createDefaultAdmin() {
    const row = await getAsync('SELECT * FROM admin WHERE id = 1');
    if (!row) {
        const defaultPassword = 'admin123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        await runAsync(
            'INSERT INTO admin (id, username, password_hash) VALUES (1, ?, ?)',
            ['admin', hashedPassword]
        );
        console.log('Default admin created (username: admin, password: admin123)');
    }
}

async function createDefaultShopSettings() {
    const row = await getAsync('SELECT * FROM shop_settings WHERE id = 1');
    if (!row) {
        await runAsync(
            'INSERT INTO shop_settings (id, shop_name, phone, address) VALUES (1, ?, ?, ?)',
            ['Cake with THEETH', '0779788922', 'Nedunkerny']
        );
        console.log('Default shop settings created');
    }
}

// Helper functions for async database operations
function runAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

function getAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Promisify database methods for easier async/await
const dbAsync = {
    run: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, changes: this.changes });
            });
        });
    },
    
    get: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },
    
    all: (sql, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

module.exports = { db, dbAsync };
