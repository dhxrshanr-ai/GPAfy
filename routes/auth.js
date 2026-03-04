const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// Register
router.post('/register', (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
        if (existing) {
            return res.status(400).json({ error: 'Username or email already taken' });
        }

        const password_hash = bcrypt.hashSync(password, 10);
        const result = db.prepare(
            'INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)'
        ).run(username, email, password_hash, username);

        req.session.userId = result.lastInsertRowid;

        const user = db.prepare('SELECT id, username, email, display_name, bio, avatar, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
        res.status(201).json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (!bcrypt.compareSync(password, user.password_hash)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;

        res.json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                display_name: user.display_name,
                bio: user.bio,
                avatar: user.avatar,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Logged out' });
});

// Get current user
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = db.prepare('SELECT id, username, email, display_name, bio, avatar, created_at FROM users WHERE id = ?').get(req.session.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
});

module.exports = router;
