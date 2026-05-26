const express = require('express');
const {
    createForum,
    fetchAllForums,
    searchForumsByName,
    likeForumPost,
    addCommentToForum,
    fetchForumComments
} = require('../db/ForumsService.js');

const router = express.Router();

// get all forums or search forums by structural title query parameter: /forums?search=Rock
router.get('/', async (req, res) => {
    const searchQuery = req.query.search;
    try {
        let forums;
        if (searchQuery && searchQuery.trim() !== '') {
            forums = await searchForumsByName(searchQuery);
        } else {
            forums = await fetchAllForums();
        }
        res.status(200).json(forums);
    } catch (error) {
        console.error('Error handling forum lists:', error);
        res.status(500).json({ message: 'Error handling forum lists' });
    }
});

// publish a new forum
router.post('/', async (req, res) => {
    const { title, content, createdBy } = req.body;

    if (!title?.trim() || !content?.trim() || !createdBy?.trim()) {
        return res.status(400).json({ message: 'Title, content, and author signature are required.' });
    }

    try {
        const forumId = await createForum(title, content, createdBy);
        res.status(201).json({ message: 'Forum created successfully', id: forumId });
    } catch (error) {
        console.error('Error processing new forum creation:', error);
        res.status(500).json({ message: 'Error processing new forum creation', error: error.message });
    }
});

// increment like for forum
router.patch('/:id/like/:amount', async (req, res) => {
    try {
        await likeForumPost(req.params.id, req.params.amount);
        res.status(200).json({ message: 'Forum post liked successfully' });
    } catch (error) {
        console.error('Error tracking upvote like:', error);
        res.status(500).json({ message: 'Error tracking upvote like' });
    }
});

// get comments for a forum post
router.get('/:id/comments', async (req, res) => {
    try {
        const comments = await fetchForumComments(req.params.id);
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error pulling discussion replies:', error);
        res.status(500).json({ message: 'Error pulling discussion replies' });
    }
});

// add comment
router.post('/:id/comments', async (req, res) => {
    const { authorId, comment } = req.body;

    if (!authorId?.trim() || !comment?.trim()) {
        return res.status(400).json({ message: 'Comment text and author credentials are required.' });
    }

    try {
        const commentId = await addCommentToForum(req.params.id, authorId, comment);
        res.status(201).json({ message: 'Comment logged successfully', id: commentId });
    } catch (error) {
        console.error('Error appending comment:', error);
        res.status(500).json({ message: 'Error appending comment', error: error.message });
    }
});

module.exports = router;