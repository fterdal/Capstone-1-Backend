const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../database");
const { Op } = require("sequelize");

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

// Admin check middleware
function isAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    return next();
  }
  return res.status(403).json({ error: "Admin access required" });
}

// block disabled users from certain actions
function blockIfDisabled(req, res, next) {
  if (req.user && req.user.isDisable) {
    return res.status(403).json({ error: "Account disabled. Action not allowed." });
  }
  next();
}

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
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
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
        isAdmin: user.isAdmin,
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

    // Find user by username or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: username },
        ],
      },
    });
    if (!user) {
      return res.status(401).send({ error: "Invalid credentials" });
    }

    // check if the user is disabled
    if (user.isDisable) {
      return res.status(403).send({ error: "Account disabled. Please contact support." });
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
        isAdmin: user.isAdmin,
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
router.get("/me", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "username",
        "img",
        "isAdmin",
        "isDisable",
        "createdAt",
        "updatedAt"
      ]
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("error fetching user info:", error);
    res.status(500).json({ error: "fail to fetch user info" });
  }
});

// Helper function to check if input looks like email
const looksLikeEmail = (input) => {
  return input.includes("@");
};

// Signup with username and password
router.post("/signup/username", async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

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

    // Check if input looks like email
    if (looksLikeEmail(username)) {
      return res
        .status(400)
        .send({
          error:
            "Username cannot be an email address. Please use a regular username.",
        });
    }

    // Check if username already exists (check both username and email fields to prevent duplicates)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
      },
    });

    if (existingUser) {
      return res.status(409).send({ error: "Username already exists" });
    }

    // Create new user
    const passwordHash = User.hashPassword(password);
    const userData = {
      username,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null,
    };

    const user = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
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
      message: "User created successfully with username",
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Username signup error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Signup with email and password
router.post("/signup/email", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).send({ error: "Email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).send({ error: "Password must be at least 6 characters long" });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).send({ error: "Please provide a valid email address" });
    }

    // Check if email already exists (check both email and username fields to prevent duplicates)
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: email },
          { username: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).send({ error: "Email already exists" });
    }

    // Create new user
    const passwordHash = User.hashPassword(password);
    const userData = {
      email: email,
      passwordHash,
      firstName: firstName || null,
      lastName: lastName || null
    };

    const user = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
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
      message: "User created successfully with email",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Email signup error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = {
  router,
  authenticateJWT,
  isAdmin,
  blockIfDisabled,
};
