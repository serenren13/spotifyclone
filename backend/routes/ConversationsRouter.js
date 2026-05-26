const express = require('express');
const { 
    getOrCreateConversation, 
    sendMessage, 
    fetchMessagesForConversation, 
    fetchUserInbox 
} = require('../db/ConversationsService.js');

const router = express.Router();

// get users entire active inbox
router.get('/inbox/:userId', async (req, res) => {
    try {
        const inbox = await fetchUserInbox(req.params.userId);
        res.status(200).json(inbox);
    } catch (error) {
        console.error('Error fetching inbox:', error);
        res.status(500).json({ message: 'Error fetching inbox' });
    }
});

// start or open a chat between two users
router.post('/initialize', async (req, res) => {
    const { user1, user2 } = req.body;

    if (!user1?.trim() || !user2?.trim()) {
        return res.status(400).json({ message: 'Both participants are required.' });
    }

    try {
        const conversation = await getOrCreateConversation(user1, user2);
        res.status(200).json(conversation);
    } catch (error) {
        console.error('Error initializing conversation:', error);
        res.status(500).json({ message: 'Error initializing conversation' });
    }
});

// send a message
router.post('/:conversationId/messages', async (req, res) => {
    const { senderId, text } = req.body;
    const { conversationId } = req.params;

    if (!senderId?.trim() || !text?.trim()) {
        return res.status(400).json({ message: 'Sender and text content are required.' });
    }

    try {
        const message = await sendMessage(conversationId, senderId, text);
        res.status(201).json(message);
    } catch (error) {
        console.error('Error transmitting message:', error);
        res.status(500).json({ message: 'Error transmitting message', error: error.message });
    }
});

// get history of messages for a room
router.get('/:conversationId/messages', async (req, res) => {
    try {
        const messages = await fetchMessagesForConversation(req.params.conversationId);
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error retrieving conversation history:', error);
        res.status(500).json({ message: 'Error retrieving conversation history' });
    }
});

module.exports = router;