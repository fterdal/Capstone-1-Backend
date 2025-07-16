require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const app = express();
const apiRouter = require("./api");
const { router: authRouter } = require("./auth");
const { db } = require("./database");
const cors = require("cors");

const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// body parser middleware
app.use(express.json());

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// cookie parser middleware
app.use(cookieParser());

// Session middleware for passport
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan("dev")); // logging middleware
app.use(express.static(path.join(__dirname, "public"))); // serve static files from public folder
app.use("/api", apiRouter); // mount api router
app.use("/auth", authRouter); // mount auth router

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.sendStatus(500);
});

const runApp = async () => {
  try {
    await db.sync();
    console.log("✅ Connected to the database");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
  }
};

runApp();

module.exports = app;
