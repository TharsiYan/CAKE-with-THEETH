const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Check if running in Vercel environment
const isVercel = process.env.VERCEL === '1';

// Create PostgreSQL connection pool
// This automatically uses the POSTGRES_URL environment variable provided by Vercel
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize database with schema
async function initializeDatabase() {
    try {
        console.log('Connecting to PostgreSQL database...');
        
        // Create tables one by one
        await createTables();
        
        // Create default admin
        await createDefaultAdmin();
        
        // Create default shop settings
        await createDefaultShopSettings();
        
        console.log('PostgreSQL database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

async function createTables() {
    // Shop settings table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS shop_settings (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            shop_name TEXT NOT NULL DEFAULT 'Cake with THEETH',
            phone TEXT NOT NULL DEFAULT '0779788922',
            address TEXT NOT NULL DEFAULT 'Nedunkerny',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Admin credentials table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            username TEXT NOT NULL DEFAULT 'admin',
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Cakes table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS cakes (
            id SERIAL PRIMARY KEY,
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Comments table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            cake_id INTEGER NOT NULL REFERENCES cakes(id) ON DELETE CASCADE,
            visitor_name TEXT NOT NULL DEFAULT 'Anonymous',
            comment TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Ratings table
    await pool.query(`
        CREATE TABLE IF NOT EXISTS ratings (
            id SERIAL PRIMARY KEY,
            cake_id INTEGER NOT NULL REFERENCES cakes(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            visitor_ip TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(cake_id, visitor_ip)
        )
    `);
}

async function createDefaultAdmin() {
    const { rows } = await pool.query('SELECT * FROM admin WHERE id = 1');
    if (rows.length === 0) {
        // Strong, secure admin password replacing 'admin123'
        const defaultPassword = 'MasterBiteTheethCAKE!559';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        await pool.query(
            'INSERT INTO admin (id, username, password_hash) VALUES ($1, $2, $3)',
            [1, 'admin', hashedPassword]
        );
        console.log('========== IMPORTANT ===========');
        console.log(`Default admin created.`);
        console.log(`Username: admin`);
        console.log(`Password: ${defaultPassword}`);
        console.log('================================');
    }
}

async function createDefaultShopSettings() {
    const { rows } = await pool.query('SELECT * FROM shop_settings WHERE id = 1');
    if (rows.length === 0) {
        await pool.query(
            'INSERT INTO shop_settings (id, shop_name, phone, address) VALUES ($1, $2, $3, $4)',
            [1, 'Cake with THEETH', '0779788922', 'Nedunkerny']
        );
        console.log('Default shop settings created');
    }
}

// Wrapper to mimic the SQLite interface shape for easier migration in server.js, 
// automatically converting SQLite ? params to PostgreSQL $1, $2 params.
const dbAsync = {
    run: async (sql, params = []) => {
        // Convert ? to $1, $2, etc.
        let pgSql = sql;
        let pIndex = 1;
        while (pgSql.includes('?')) {
            pgSql = pgSql.replace('?', `$${pIndex++}`);
        }
        
        try {
            const result = await pool.query(pgSql, params);
            // Provide inserted rows for RETURNING queries, or count
            return { changes: result.rowCount, rows: result.rows };
        } catch (err) {
            throw err;
        }
    },
    
    get: async (sql, params = []) => {
        let pgSql = sql;
        let pIndex = 1;
        while (pgSql.includes('?')) {
            pgSql = pgSql.replace('?', `$${pIndex++}`);
        }
        
        try {
            const result = await pool.query(pgSql, params);
            return result.rows[0]; // SQLite .get() returns single object or undefined
        } catch (err) {
            throw err;
        }
    },
    
    all: async (sql, params = []) => {
        let pgSql = sql;
        let pIndex = 1;
        while (pgSql.includes('?')) {
            pgSql = pgSql.replace('?', `$${pIndex++}`);
        }
        
        try {
            const result = await pool.query(pgSql, params);
            return result.rows; // SQLite .all() returns an array
        } catch (err) {
            throw err;
        }
    }
};

// Automatically run initialization
// On Vercel, it connects immediately but initialization relies on process.env.POSTGRES_URL being present
if (process.env.POSTGRES_URL) {
    initializeDatabase().catch(console.error);
}

module.exports = { db: pool, dbAsync };
