const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github').Strategy;

const User = require('../models/User');

passport.use('register', new LocalStrategy({usernameField: 'email', passReqToCallback: true},
  function(req, email, password, done) {
    User.findOne({ email: email }, function(err, user) {
      if (err) { return done(err); }
      if (user) {
        return done(null, false, { message: 'Email ya registrado' });
      }
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) { return done(err); }
        const newUser = new User({
          email: email,
          password: hash,
          role: 'user'
        });
        newUser.save(function(err) {
          if (err) { return done(err); }
          return done(null, newUser);
        });
      });
    });
  }
));

passport.use('login', new LocalStrategy({usernameField: 'email'},
  function(email, password, done) {
    User.findOne({ email: email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      bcrypt.compare(password, user.password, function(err, result) {
        if (err) { return done(err); }
        if (result) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
      });
    });
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({ githubId: profile.id }, function (err, user) {
      if (err) { return cb(err); }
      if (!user) {
        user = new User({ githubId: profile.id, email: profile.emails[0].value });
        user.save(function (err) {
          if (err) console.log(err);
          return cb(err, user);
        });
      } else {
        return cb(err, user);
      }
    });
  }
));

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.post('/login', passport.authenticate('login', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/products');
});

router.get('/register', function(req, res, next) {
  res.render('register');
});

router.post('/register', passport.authenticate('register', { failureRedirect: '/register' }), function(req, res) {
  res.redirect('/login');
});

router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/products');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/login');
});

module.exports = router;
