const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();


app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({ extended: false }));

// MongoDB Atlas connection URL loaded from environment variables
const mongoURL = process.env.MONGODB_URI;

// Create a MongoDB client
const client = new MongoClient(mongoURL);

// Connect to the MongoDB Atlas cluster
client.connect((err) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }

  console.log('Connected to MongoDB Atlas');

  // Define MongoDB collection for messages
  const db = client.db('messageBoard'); // Replace 'messageBoard' with your preferred database name
  const messagesCollection = db.collection('messages');

  // Create an index on the 'added' field (descending order)
  messagesCollection.createIndex({ added: -1 }, (indexErr, result) => {
    if (indexErr) {
      console.error('Error creating index:', indexErr);
    } else {
      console.log('Index created:', result);
    }
  });


app.get('/', async (req, res) => {
  try {
    const messages = await messagesCollection.find().toArray();
    res.render('index', { title: 'Mini Messageboard', messages });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send('Error fetching messages');
  }
});

app.get('/new', (req, res) => {
  res.render('form', { title: 'New Message' });
});

app.post('/new', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
module.exports = app; 