-- Cake with THEETH - SQLite Database Schema
-- Simple, lightweight database for small business

-- Shop settings table
CREATE TABLE IF NOT EXISTS shop_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    shop_name TEXT NOT NULL DEFAULT 'Cake with THEETH',
    phone TEXT NOT NULL DEFAULT '0779788922',
    address TEXT NOT NULL DEFAULT 'Nedunkerny',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin credentials table
CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    username TEXT NOT NULL DEFAULT 'admin',
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Cakes table
CREATE TABLE IF NOT EXISTS cakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    weight TEXT NOT NULL,
    price TEXT NOT NULL,
    price_range TEXT,
    type TEXT NOT NULL,
    selling_type TEXT NOT NULL CHECK (selling_type IN ('returnable', 'permanent')),
    description TEXT,
    images TEXT NOT NULL, -- JSON array of image filenames
    video TEXT, -- optional video filename
    is_available BOOLEAN DEFAULT 1,
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cake_id INTEGER NOT NULL,
    visitor_name TEXT NOT NULL DEFAULT 'Anonymous',
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cake_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    visitor_ip TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE CASCADE,
    UNIQUE(cake_id, visitor_ip)
);

-- Insert default shop settings
INSERT OR IGNORE INTO shop_settings (id, shop_name, phone, address) 
VALUES (1, 'Cake with THEETH', '0779788922', 'Nedunkerny');

-- Insert default admin (password: admin123)
-- This will be hashed in the application
INSERT OR IGNORE INTO admin (id, username, password_hash) 
VALUES (1, 'admin', '$2a$10$YourHashedPasswordHere');
