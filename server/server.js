const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const { db, dbAsync } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const isVideo = file.mimetype.startsWith('video/');
        const dest = isVideo 
            ? path.join(__dirname, 'uploads', 'videos')
            : path.join(__dirname, 'uploads', 'images');
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        const allowedImages = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const allowedVideos = ['video/mp4', 'video/webm', 'video/quicktime'];
        
        if (allowedImages.includes(file.mimetype) || allowedVideos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ============ PUBLIC ROUTES ============

// Get shop settings
app.get('/api/shop', async (req, res) => {
    try {
        const shop = await dbAsync.get('SELECT * FROM shop_settings WHERE id = 1');
        res.json(shop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all cakes (public)
app.get('/api/cakes', async (req, res) => {
    try {
        const cakes = await dbAsync.all(`
            SELECT c.*, 
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as rating_count
            FROM cakes c
            LEFT JOIN ratings r ON c.id = r.cake_id
            WHERE c.is_available = 1
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);
        
        // Parse images JSON for each cake
        cakes.forEach(cake => {
            cake.images = JSON.parse(cake.images || '[]');
        });
        
        res.json(cakes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single cake with comments
app.get('/api/cakes/:id', async (req, res) => {
    try {
        const cake = await dbAsync.get(`
            SELECT c.*, 
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as rating_count
            FROM cakes c
            LEFT JOIN ratings r ON c.id = r.cake_id
            WHERE c.id = ?
            GROUP BY c.id
        `, [req.params.id]);
        
        if (!cake) {
            return res.status(404).json({ error: 'Cake not found' });
        }
        
        cake.images = JSON.parse(cake.images || '[]');
        
        // Get comments
        const comments = await dbAsync.all(
            'SELECT * FROM comments WHERE cake_id = ? ORDER BY created_at DESC',
            [req.params.id]
        );
        
        cake.comments = comments;
        
        res.json(cake);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Like a cake
app.post('/api/cakes/:id/like', async (req, res) => {
    try {
        await dbAsync.run(
            'UPDATE cakes SET likes = likes + 1 WHERE id = ?',
            [req.params.id]
        );
        
        const cake = await dbAsync.get('SELECT likes FROM cakes WHERE id = ?', [req.params.id]);
        res.json({ likes: cake.likes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add comment to cake
app.post('/api/cakes/:id/comments', async (req, res) => {
    try {
        const { visitor_name, comment } = req.body;
        
        if (!comment || comment.trim() === '') {
            return res.status(400).json({ error: 'Comment is required' });
        }
        
        const result = await dbAsync.run(
            'INSERT INTO comments (cake_id, visitor_name, comment) VALUES (?, ?, ?)',
            [req.params.id, visitor_name || 'Anonymous', comment]
        );
        
        res.json({ 
            id: result.id, 
            cake_id: parseInt(req.params.id),
            visitor_name: visitor_name || 'Anonymous',
            comment,
            created_at: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rate a cake
app.post('/api/cakes/:id/rate', async (req, res) => {
    try {
        const { rating } = req.body;
        const visitorIp = req.ip || req.connection.remoteAddress;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }
        
        // Insert or update rating
        await dbAsync.run(`
            INSERT INTO ratings (cake_id, rating, visitor_ip) 
            VALUES (?, ?, ?)
            ON CONFLICT(cake_id, visitor_ip) 
            DO UPDATE SET rating = excluded.rating, created_at = CURRENT_TIMESTAMP
        `, [req.params.id, rating, visitorIp]);
        
        // Get updated average
        const result = await dbAsync.get(
            'SELECT AVG(rating) as average FROM ratings WHERE cake_id = ?',
            [req.params.id]
        );
        
        res.json({ average_rating: result.average });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ADMIN ROUTES ============

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await dbAsync.get('SELECT * FROM admin WHERE id = 1');
        
        if (!admin || admin.username !== username) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const validPassword = await bcrypt.compare(password, admin.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
        
        res.json({ token, username: admin.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change admin credentials
app.put('/api/admin/credentials', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newUsername, newPassword } = req.body;
        
        const admin = await dbAsync.get('SELECT * FROM admin WHERE id = 1');
        const validPassword = await bcrypt.compare(currentPassword, admin.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        const updates = [];
        const params = [];
        
        if (newUsername) {
            updates.push('username = ?');
            params.push(newUsername);
        }
        
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updates.push('password_hash = ?');
            params.push(hashedPassword);
        }
        
        if (updates.length > 0) {
            params.push(1); // id
            await dbAsync.run(
                `UPDATE admin SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                params
            );
        }
        
        res.json({ message: 'Credentials updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update shop settings
app.put('/api/shop', authenticateToken, async (req, res) => {
    try {
        const { shop_name, phone, address } = req.body;
        
        await dbAsync.run(
            'UPDATE shop_settings SET shop_name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
            [shop_name, phone, address]
        );
        
        const shop = await dbAsync.get('SELECT * FROM shop_settings WHERE id = 1');
        res.json(shop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all cakes (admin - includes unavailable)
app.get('/api/admin/cakes', authenticateToken, async (req, res) => {
    try {
        const cakes = await dbAsync.all(`
            SELECT c.*, 
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT r.id) as rating_count
            FROM cakes c
            LEFT JOIN ratings r ON c.id = r.cake_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);
        
        cakes.forEach(cake => {
            cake.images = JSON.parse(cake.images || '[]');
        });
        
        res.json(cakes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create cake with images/video
app.post('/api/admin/cakes', authenticateToken, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, weight, price, price_range, type, selling_type, description, is_available } = req.body;
        
        // Process uploaded images
        const imageFiles = req.files['images'] || [];
        const images = imageFiles.map(file => `/uploads/images/${file.filename}`);
        
        // Process uploaded video
        const videoFile = req.files['video']?.[0];
        const video = videoFile ? `/uploads/videos/${videoFile.filename}` : null;
        
        const result = await dbAsync.run(
            `INSERT INTO cakes (name, weight, price, price_range, type, selling_type, description, images, video, is_available)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, weight, price, price_range, type, selling_type, description, JSON.stringify(images), video, is_available ? 1 : 0]
        );
        
        const cake = await dbAsync.get('SELECT * FROM cakes WHERE id = ?', [result.id]);
        cake.images = JSON.parse(cake.images || '[]');
        
        res.status(201).json(cake);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update cake
app.put('/api/admin/cakes/:id', authenticateToken, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, weight, price, price_range, type, selling_type, description, is_available, existing_images } = req.body;
        
        // Get existing cake
        const existingCake = await dbAsync.get('SELECT * FROM cakes WHERE id = ?', [req.params.id]);
        if (!existingCake) {
            return res.status(404).json({ error: 'Cake not found' });
        }
        
        // Process images
        let images = existing_images ? JSON.parse(existing_images) : JSON.parse(existingCake.images || '[]');
        
        // Add new images
        const newImageFiles = req.files['images'] || [];
        newImageFiles.forEach(file => {
            images.push(`/uploads/images/${file.filename}`);
        });
        
        // Process video
        let video = existingCake.video;
        const newVideoFile = req.files['video']?.[0];
        if (newVideoFile) {
            // Delete old video if exists
            if (video) {
                const oldVideoPath = path.join(__dirname, video);
                if (fs.existsSync(oldVideoPath)) {
                    fs.unlinkSync(oldVideoPath);
                }
            }
            video = `/uploads/videos/${newVideoFile.filename}`;
        }
        
        await dbAsync.run(
            `UPDATE cakes SET 
                name = ?, weight = ?, price = ?, price_range = ?, 
                type = ?, selling_type = ?, description = ?, 
                images = ?, video = ?, is_available = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, weight, price, price_range, type, selling_type, description, JSON.stringify(images), video, is_available ? 1 : 0, req.params.id]
        );
        
        const cake = await dbAsync.get('SELECT * FROM cakes WHERE id = ?', [req.params.id]);
        cake.images = JSON.parse(cake.images || '[]');
        
        res.json(cake);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete cake
app.delete('/api/admin/cakes/:id', authenticateToken, async (req, res) => {
    try {
        const cake = await dbAsync.get('SELECT * FROM cakes WHERE id = ?', [req.params.id]);
        
        if (!cake) {
            return res.status(404).json({ error: 'Cake not found' });
        }
        
        // Delete associated files
        const images = JSON.parse(cake.images || '[]');
        images.forEach(imagePath => {
            const fullPath = path.join(__dirname, imagePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        });
        
        if (cake.video) {
            const videoPath = path.join(__dirname, cake.video);
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        }
        
        await dbAsync.run('DELETE FROM cakes WHERE id = ?', [req.params.id]);
        
        res.json({ message: 'Cake deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete image from cake
app.delete('/api/admin/cakes/:id/images', authenticateToken, async (req, res) => {
    try {
        const { imagePath } = req.body;
        
        const cake = await dbAsync.get('SELECT * FROM cakes WHERE id = ?', [req.params.id]);
        if (!cake) {
            return res.status(404).json({ error: 'Cake not found' });
        }
        
        let images = JSON.parse(cake.images || '[]');
        images = images.filter(img => img !== imagePath);
        
        // Delete file
        const fullPath = path.join(__dirname, imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
        
        await dbAsync.run(
            'UPDATE cakes SET images = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(images), req.params.id]
        );
        
        res.json({ images });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete video from cake
app.delete('/api/admin/cakes/:id/video', authenticateToken, async (req, res) => {
    try {
        const cake = await dbAsync.get('SELECT * FROM cakes WHERE id = ?', [req.params.id]);
        if (!cake) {
            return res.status(404).json({ error: 'Cake not found' });
        }
        
        if (cake.video) {
            const videoPath = path.join(__dirname, cake.video);
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        }
        
        await dbAsync.run(
            'UPDATE cakes SET video = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [req.params.id]
        );
        
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete comment
app.delete('/api/admin/comments/:id', authenticateToken, async (req, res) => {
    try {
        await dbAsync.run('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve static frontend files in production
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    // Serve index.html for all non-API routes (SPA support)
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
            res.sendFile(path.join(distPath, 'index.html'));
        }
    });
    
    console.log('Serving frontend from:', distPath);
} else {
    console.log('Dist folder not found. Frontend will not be served.');
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    if (fs.existsSync(distPath)) {
        console.log(`Website available at http://localhost:${PORT}`);
    }
});

module.exports = app;
