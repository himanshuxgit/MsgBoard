const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: String, // Google OAuth2 ID
    name: String,      // User's Name
    email: String,     // User's Email Address
});

const User = mongoose.model('User', userSchema);

module.exports = User;
