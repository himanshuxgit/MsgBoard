const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('public/models/message.js'); // Create a Mongoose model for messages

// Route for the message board home page
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().exec();
    res.render('index', { title: 'Mini Messageboard', messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send('Error fetching messages');
  }
});

// Route for the new message form
router.get('/new', (req, res) => {
  res.render('form', { title: 'New Message' });
});

// Route for submitting a new message
router.post('/new', async (req, res) => {
  const { messageText, messageUser } = req.body;
  const newMessage = new Message({
    text: messageText,
    user: messageUser,
    added: new Date(),
  });

  try {
    await newMessage.save();
    res.redirect('/');
  } catch (err) {
    console.error('Error inserting message:', err);
    res.status(500).send('Error inserting message');
  }
});

// Route to delete a message
router.delete('/:messageId', async (req, res) => {
  const messageId = req.params.messageId;

  try {
    await Message.deleteOne({ _id: messageId }).exec();

    res.sendStatus(204); // Success, no content response
  } catch (err) {
    console.error('Error deleting message:', err);
    res.sendStatus(500); // Internal Server Error
  }
});

module.exports = router;
