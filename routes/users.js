const express = require('express');
const db = require('../db');

const router = express.Router();

// Auth middleware
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// Get all users (explore/search)
router.get('/', requireAuth, (req, res) => {
    try {
        const { search } = req.query;
        let users;

        if (search) {
            users = db.prepare(`
        SELECT id, username, display_name, bio, avatar, created_at
        FROM users
        WHERE (username LIKE ? OR display_name LIKE ?) AND id != ?
        LIMIT 50
      `).all(`%${search}%`, `%${search}%`, req.session.userId);
        } else {
            users = db.prepare(`
        SELECT id, username, display_name, bio, avatar, created_at
        FROM users
        WHERE id != ?
        ORDER BY created_at DESC
        LIMIT 50
      `).all(req.session.userId);
        }

        // Add follow status for each user
        const followCheck = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?');
        users = users.map(user => ({
            ...user,
            is_following: !!followCheck.get(req.session.userId, user.id)
        }));

        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user profile
router.get('/:id', requireAuth, (req, res) => {
    try {
        const user = db.prepare('SELECT id, username, display_name, bio, avatar, created_at FROM users WHERE id = ?').get(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(req.params.id).count;
        const followerCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(req.params.id).count;
        const followingCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(req.params.id).count;
        const isFollowing = !!db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.session.userId, req.params.id);

        res.json({
            user: {
                ...user,
                post_count: postCount,
                follower_count: followerCount,
                following_count: followingCount,
                is_following: isFollowing
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update profile
router.put('/:id', requireAuth, (req, res) => {
    try {
        if (parseInt(req.params.id) !== req.session.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const { display_name, bio } = req.body;
        db.prepare('UPDATE users SET display_name = ?, bio = ? WHERE id = ?').run(
            display_name || '',
            bio || '',
            req.session.userId
        );

        const user = db.prepare('SELECT id, username, display_name, bio, avatar, created_at FROM users WHERE id = ?').get(req.session.userId);
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Follow user
router.post('/:id/follow', requireAuth, (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        if (targetId === req.session.userId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const target = db.prepare('SELECT id FROM users WHERE id = ?').get(targetId);
        if (!target) {
            return res.status(404).json({ error: 'User not found' });
        }

        const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(req.session.userId, targetId);
        if (existing) {
            return res.status(400).json({ error: 'Already following' });
        }

        db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.session.userId, targetId);
        res.json({ message: 'Followed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Unfollow user
router.delete('/:id/follow', requireAuth, (req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.session.userId, targetId);
        res.json({ message: 'Unfollowed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get followers
router.get('/:id/followers', requireAuth, (req, res) => {
    try {
        const followers = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
    `).all(req.params.id);

        const followCheck = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?');
        const result = followers.map(u => ({
            ...u,
            is_following: !!followCheck.get(req.session.userId, u.id)
        }));

        res.json({ users: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get following
router.get('/:id/following', requireAuth, (req, res) => {
    try {
        const following = db.prepare(`
      SELECT u.id, u.username, u.display_name, u.avatar
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
    `).all(req.params.id);

        const followCheck = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?');
        const result = following.map(u => ({
            ...u,
            is_following: !!followCheck.get(req.session.userId, u.id)
        }));

        res.json({ users: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
