const express = require('express');
const {
    createForum,
    fetchAllForums,
    searchForumsByName,
    likeForumPost,
    addCommentToForum,
    fetchForumComments,
    likeForumComment,
} = require('../db/ForumsService.js');
const { deleteDoc, doc } = require('firebase/firestore');
const { db } = require('../firebase.js');

const router = express.Router();

// get all forums or search forums by title query parameter: /forums?search=Rock
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

// get single forum by id
router.get('/:id', async (req, res) => {
    try {
        const forums = await fetchAllForums();
        const forum = forums.find(f => f.id === req.params.id);
        if (!forum) return res.status(404).json({ message: 'Forum not found' });
        res.status(200).json(forum);
    } catch (error) {
        console.error('Error fetching forum:', error);
        res.status(500).json({ message: 'Error fetching forum' });
    }
});

// publish a new forum
router.post('/', async (req, res) => {
    const { title, content, createdBy, creatorId } = req.body; 
    
    if (!title?.trim() || !content?.trim() || !createdBy?.trim() || !creatorId?.trim()) {
        return res.status(400).json({ message: 'Title, content, author, and creatorId are required.' });
    }
    
    try {
        const forumId = await createForum(title, content, createdBy, creatorId);
        res.status(201).json({ message: 'Forum created successfully', id: forumId });
    } catch (error) {
        console.error('Error processing new forum creation:', error);
        res.status(500).json({ message: 'Error processing new forum creation', error: error.message });
    }
});

// delete a forum post
router.delete('/:id', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'forums', req.params.id));
        res.status(200).json({ message: 'Forum deleted successfully' });
    } catch (error) {
        console.error('Error deleting forum:', error);
        res.status(500).json({ message: 'Error deleting forum' });
    }
});

// increment like for forum (+1 or -1)
router.patch('/:id/like', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    try {
        const liked = await likeForumPost(req.params.id, userId);
        res.status(200).json({ message: 'Like updated', liked });
    } catch (error) {
        console.error('Error tracking like:', error);
        res.status(500).json({ message: 'Error tracking like' });
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

// like or unlike a comment
router.patch('/:id/comments/:commentId/like', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    try {
        const liked = await likeForumComment(req.params.id, req.params.commentId, userId);
        res.status(200).json({ message: 'Comment like updated', liked });
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ message: 'Error liking comment' });
    }
});

// delete a comment
router.delete('/:id/comments/:commentId', async (req, res) => {
    try {
        await deleteDoc(doc(db, 'forums', req.params.id, 'comments', req.params.commentId));
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

module.exports = router;