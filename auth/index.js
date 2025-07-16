const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../database");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to authenticate JWT tokens
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).send({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Auth0 authentication route
router.post("/auth0", async (req, res) => {
  try {
    const { auth0Id, email, username } = req.body;

    if (!auth0Id) {
      return res.status(400).send({ error: "Auth0 ID is required" });
    }

    // Try to find existing user by auth0Id first
    let user = await User.findOne({ where: { auth0Id } });

    if (!user && email) {
      // If no user found by auth0Id, try to find by email
      user = await User.findOne({ where: { email } });

      if (user) {
        // Update existing user with auth0Id
        user.auth0Id = auth0Id;
        await user.save();
      }
    }

    if (!user) {
      // Create new user if not found
      const userData = {
        auth0Id,
        email: email || null,
        username: username || email?.split("@")[0] || `user_${Date.now()}`, // Use email prefix as username if no username provided
        passwordHash: null, // Auth0 users don't have passwords
      };

      // Ensure username is unique
      let finalUsername = userData.username;
      let counter = 1;
      while (await User.findOne({ where: { username: finalUsername } })) {
        finalUsername = `${userData.username}_${counter}`;
        counter++;
      }
      userData.username = finalUsername;

      user = await User.create(userData);
    }

    // Generate JWT token with auth0Id included
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

    res.send({
      message: "Auth0 authentication successful",
      user: {
        id: user.id,
        username: user.username,
        auth0Id: user.auth0Id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Auth0 authentication error:", error);
    res.sendStatus(500);
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .send({ error: "Username and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .send({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).send({ error: "Username already exists" });
    }

    // Create new user
    const passwordHash = User.hashPassword(password);
    const user = await User.create({ username, passwordHash });

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
      secure: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.send({
      message: "User created successfully",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.sendStatus(500);
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send({ error: "Username and password are required" });
      return;
    }

    // Find user
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    // Check password
    if (!user.checkPassword(password)) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

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

    res.send({
      message: "Login successful",
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.sendStatus(500);
  }
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.send({ message: "Logout successful" });
});

// Get current user route (protected)
router.get("/me", (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.send({});
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).send({ error: "Invalid or expired token" });
    }
    res.send({ user: user });
  });
});


module.exports = { router, authenticateJWT };
