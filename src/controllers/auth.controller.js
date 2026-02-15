const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @description Register a new user. Hashes the password, creates the user in the database,
 * generates a JWT token, and sets it as a cookie.
 * @param {import('express').Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - The username for the new user
 * @param {string} req.body.email - The email for the new user
 * @param {string} req.body.password - The plaintext password
 * @param {"user"|"artist"} [req.body.role="user"] - The role of the user
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response with user data or error message
 */
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role = "user" } = req.body;

  if (!username || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  const isUserAlreadyExist = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (isUserAlreadyExist) {
    throw new AppError("User already exists", 422);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.cookie("token", token);

  return res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @description Authenticate a user with email/username and password.
 * Verifies credentials, generates a JWT token, and sets it as a cookie.
 * @param {import('express').Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} [req.body.username] - The username (either username or email required)
 * @param {string} [req.body.email] - The email (either username or email required)
 * @param {string} req.body.password - The plaintext password
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response with user data or error message
 */
const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await userModel.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

  res.cookie("token", token);

  return res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @description Log out the current user by clearing the token cookie.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response confirming logout
 */
const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return res.status(200).json({ message: "User logged out successfully" });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
