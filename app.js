const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const { DateTime} = require('luxon');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));

// MongoDB Atlas connection URL loaded from environment variables
const mongoURL = process.env.MONGODB_URI;

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Define a Mongoose schema and model for messages
const messageSchema = new mongoose.Schema({
  text: String,
  user: String,
  added: {
    type: Date,
    default: Date.now,
  },
}, { collection: 'messages' });

const Message = mongoose.model('Message', messageSchema);

function formatToIST(utcDate) {
  try {
    const istTime = DateTime.fromJSDate(utcDate).setZone('Asia/Kolkata'); // IST time zone
    
    // Format the local time as desired (e.g., 'yyyy-MM-dd HH:mm:ss')
    return istTime.toFormat('yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error('Error formatting to IST:', error);
    return null;
  }
}

// Route for the message board home page
app.get('/', async (req, res) => {
  try {
    const messages = await Message.find().exec();
    
    const formattedMessages = messages.map((message) => ({
      ...message.toObject(),
      added: formatToIST(message.added),
    }));
    
    res.render('index', { title: 'Mini Messageboard', messages: formattedMessages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send('Error fetching messages');
  }
});


// Route for submitting a new message
app.get('/new', (req, res) => {
  res.render('form', { title: 'New Message' });
});

app.post('/new', async (req, res) => {
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
app.delete('/messages/:messageId', async (req, res) => {
  const messageId = req.params.messageId;

  try {
    await Message.deleteOne({ _id: messageId }).exec();
    res.sendStatus(204); // Success, no content response
  } catch (err) {
    console.error('Error deleting message:', err);
    res.sendStatus(500); // Internal Server Error
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
