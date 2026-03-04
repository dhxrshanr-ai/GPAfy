const express = require('express');
const db = require('../db');

const router = express.Router();

function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
}

// Add comment to a post
router.post('/posts/:postId/comments', requireAuth, (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const result = db.prepare('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)').run(
            req.params.postId, req.session.userId, content.trim()
        );

        const comment = db.prepare(`
      SELECT c.*, u.username, u.display_name, u.avatar
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(result.lastInsertRowid);

        res.status(201).json({ comment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete comment
router.delete('/comments/:id', requireAuth, (req, res) => {
    try {
        const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.id);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        if (comment.user_id !== req.session.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.id);
        res.json({ message: 'Comment deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
