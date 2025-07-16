const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require("../database");


const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({where: {googleId: profile.id}});

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
            let finalUsername = username;
            let counter = 1;
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
    
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
  }));

  //OAuth flow
  router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));

  //Handle callback
  router.get("/google/callback", passport.authenticate("google", {session: false}),
    async (req,res) => {
        try {
            let user = req.user;

             // Generate JWT token
                const token = jwt.sign(
                  {
                    id: user.id,
                    username: user.username,
                    auth0Id: user.auth0Id,
                    email: user.email,
                  },
                  JWT_SECRET,
                  { expiresIn: "24h" }
                );
            
                res.cookie("token", token, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "strict",
                  maxAge: 24 * 60 * 60 * 1000, // 24 hours
                });

                res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        } catch (error) {
            res.redirect(`${process.env.FRONTEND_URL}/login?error=google&message=Google%20login%20failed`);

        }

    });

    module.exports = router;