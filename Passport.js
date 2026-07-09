const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    // This function runs after Google confirms the user's identity.
    // "profile" contains the user's Google account info (id, name, email).
    (accessToken, refreshToken, profile, done) => {
      // In a real app you'd look this user up in a database here.
      // For this project, we just use their Google profile id as their
      // unique folder name in S3 — no database needed.
      const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails?.[0]?.value,
      };
      done(null, user);
    }
  )
);

// These two functions control what gets stored in the session cookie
// and how the full user object is restored on each request.
passport.serializeUser((user, done) => {
  done(null, user); // storing the whole small user object is fine here
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
