const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const { DateTime} = require('luxon');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const crypto = require('crypto');
const sessionSecret = crypto.randomBytes(32).toString('hex');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: false }));
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {

  return done(null, profile);
}));
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());

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
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    // If authenticated, redirect to the message board
    res.redirect('/messages');
  } else {
    // Display the Google login link if not authenticated
    res.render('home', { title: 'Mini Messageboard', user: {} });
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful login redirects to the message board
    res.redirect('/messages');
  }
);
// Route for the message board home page
app.get('/messages', isAuthenticated, async (req, res) => {
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
app.post('/new', isAuthenticated, async (req, res) => {
  try {
    const { messageText, messageUser } = req.body;

    // Create a new message and save it directly in a single step
    await Message.create({
      text: messageText,
      user: messageUser,
      added: new Date(),
    });

    res.redirect('/');
  } catch (err) {
    console.error('Error inserting message:', err);
    res.status(500).send('Error inserting message');
  }
});
// Route for rendering the /new page
app.get('/new', isAuthenticated, (req, res) => {
  res.render('form', { title: 'New Message', user: req.user }); // Pass the user variable
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); 
  }
  res.redirect('/auth/google'); // You can customize the redirection URL
}



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
