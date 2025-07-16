const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require("../database");
require('../passport');

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = User.findOne({where: {googleId: profile.id}});

        if (!user) {
            // Try by email
            const email = profile.emails?.[0]?.value;
            if (email) {
              user = await User.findOne({ where: { email } });
      
              if (user) {
                user.googleId = profile.id;
                await user.save();
              }
            }
          }
      
          if (!user) {
            // Create new user
            const email = profile.emails?.[0]?.value || null;
            const username = email ? email.split('@')[0] : `user_${Date.now()}`;
      
            // Ensure username is unique 
            const finalUsername = username;
            const counter = 1;
            while (await User.findOne({ where: { username: finalUsername } })) {
              finalUsername = `${username}_${counter}`;
              counter++;
            }
      
            user = await User.create({
              googleId: profile.id,
              email,
              username: finalUsername,
              passwordHash: null,
            });
          }
    
        return done(null, profile);
    } catch (error) {
        return done(err, null);
    }
  }));

  //OAuth flow
  router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));