const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user'); // Import your User model

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true,
},
function(request, accessToken, refreshToken, profile, done) {
    // Check if the user already exists in the database
    User.findOne({ googleId: profile.id }, (err, existingUser) => {
        if (err) {
            return done(err);
        }

        if (existingUser) {
            // User already exists, return the existing user
            return done(null, existingUser);
        }

        // User doesn't exist, create a new user document
        const newUser = new User({
            googleId: profile.id,
            // Set other user fields as needed
        });

        newUser.save((err) => {
            if (err) {
                return done(err);
            }
            return done(null, newUser);
        });
    });
}
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});