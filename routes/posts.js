const express = require('express');
const db = require('../db');

const router = express.Router();

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// Create post
router.post('/', requireAuth, (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Content is required' });
        }

        let image = '';
        if (req.file) {
            image = '/uploads/' + req.file.filename;
        }

        const result = db.prepare('INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)').run(
            req.session.userId, content.trim(), image
        );

        const post = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        0 as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(result.lastInsertRowid);

        res.status(201).json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get feed (posts from followed users + own posts)
router.get('/feed', requireAuth, (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const posts = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(req.session.userId, req.session.userId, req.session.userId, limit, offset);

        res.json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single post
router.get('/:id', requireAuth, (req, res) => {
    try {
        const post = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(req.session.userId, req.params.id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comments = db.prepare(`
      SELECT c.*, u.username, u.display_name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(req.params.id);

        res.json({ post, comments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get posts by user
router.get('/user/:userId', requireAuth, (req, res) => {
    try {
        const posts = db.prepare(`
      SELECT p.*, u.username, u.display_name, u.avatar,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).all(req.session.userId, req.params.userId);

        res.json({ posts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete post
router.delete('/:id', requireAuth, (req, res) => {
    try {
        const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.user_id !== req.session.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Like post
router.post('/:id/like', requireAuth, (req, res) => {
    try {
        const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const existing = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').get(req.params.id, req.session.userId);
        if (existing) {
            return res.status(400).json({ error: 'Already liked' });
        }

        db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(req.params.id, req.session.userId);
        const likeCount = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(req.params.id).count;

        res.json({ like_count: likeCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Unlike post
router.delete('/:id/like', requireAuth, (req, res) => {
    try {
        db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(req.params.id, req.session.userId);
        const likeCount = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(req.params.id).count;

        res.json({ like_count: likeCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
