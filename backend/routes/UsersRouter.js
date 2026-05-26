const express = require('express');
const { saveUser, userFromId, fetchPublicUsers, updateUserProfile } = require('../db/UsersService.js');

const router = express.Router();

// get all public users (for discover page)
router.get('/discover', async (req, res) => {
    try {
        const users = await fetchPublicUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching public users:', error);
        res.status(500).json({ message: 'Error fetching public users' });
    }
});

// get use profile by id
router.get('/:id', async (req, res) => {
    try {
        const user = await userFromId(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ message: 'Error getting user profile' });
    }
});

// create or update account from spotify login
router.post('/', async (req, res) => {
    const { userId, displayName, bio, isPrivate, spotifyId, email } = req.body;

    if (!userId?.trim()) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const saved = await saveUser(userId, { displayName, bio, isPrivate, spotifyId, email });
        res.status(201).json(saved);
    } catch (error) {
        console.error('Error saving user profile:', error);
        res.status(500).json({ message: 'Error saving user profile', error: error.message });
    }
});

// update user profile settings
router.patch('/:id', async (req, res) => {
    try {
        await updateUserProfile(req.params.id, req.body);
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
});

module.exports = router;