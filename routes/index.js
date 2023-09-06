const express = require('express');
const router = express.Router();

// Import the MongoDB client and collection (defined in app.js)
const { client, messagesCollection } = require('../app');

// Route for the message board home page
router.get('/', async (req, res) => {
  try {
    const messages = await messagesCollection.find().toArray();
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
  const newMessage = {
    text: messageText,
    user: messageUser,
    added: new Date(),
  };

  try {
    await messagesCollection.insertOne(newMessage);
    res.redirect('/');
  } catch (err) {
    console.error('Error inserting message:', err);
    res.status(500).send('Error inserting message');
  }
});

module.exports = router;
