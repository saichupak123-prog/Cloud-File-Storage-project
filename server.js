require('dotenv').config(); // load variables from .env into process.env

const express = require('express');
const session = require('express-session');
const path = require('path');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');

const app = express();

// Parses incoming JSON request bodies (so req.body works in our routes).
app.use(express.json());

// Serves the frontend files (public/index.html, etc.) as static assets.
app.use(express.static(path.join(__dirname, 'public')));

// Sessions: keeps the user logged in between requests using a cookie.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Hook Passport into Express so req.user is available after login.
app.use(passport.initialize());
app.use(passport.session());

// Mount our two route files under their base paths.
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
