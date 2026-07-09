const express = require('express');
const passport = require('passport');
const router = express.Router();

// Step 1: user clicks "Sign in with Google" -> hits this route
// -> Passport redirects them to Google's login screen.
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Google redirects back here after the user logs in.
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Login succeeded -> send them back to the main app page.
    res.redirect('/');
  }
);

// Simple endpoint the frontend can call to check "am I logged in?"
router.get('/me', (req, res) => {
  if (req.user) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
