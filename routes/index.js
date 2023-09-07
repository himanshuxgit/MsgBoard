const express = require('express');
const { ObjectId } = require('mongodb');
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

// Route to delete a message
router.delete('/:messageId', async (req, res) => {
  const messageId = req.params.messageId; // Use route parameter to get messageId

  try {
    const result = await messagesCollection.deleteOne({ _id: ObjectId(messageId) });

    if (result.deletedCount === 1) {
      console.log(`Message with ID ${messageId} deleted.`);
      res.sendStatus(204); // Success, no content response
    } else {
      console.log(`Message with ID ${messageId} not found.`);
      res.sendStatus(404); // Not Found
    }
  } catch (err) {
    console.error('Error deleting message:', err);
    res.sendStatus(500); // Internal Server Error
  }
});

module.exports = router;
