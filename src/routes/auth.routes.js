/**
 * @module routes/auth
 * @description Authentication routes for user registration, login, and logout.
 * All routes are prefixed with `/api/auth` (mounted in app.js).
 */
const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/auth.controller");

/** @route POST /api/auth/register - Register a new user */
router.post("/register", registerUser);

/** @route POST /api/auth/login - Authenticate and log in a user */
router.post("/login", loginUser);

/** @route POST /api/auth/logout - Log out the current user */
router.post("/logout", logoutUser);

module.exports = router;
