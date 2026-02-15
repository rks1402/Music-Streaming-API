const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

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
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role = "user" } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExist) {
      return res.status(422).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      },
    );

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
  } catch (error) {
    console.error("User registration failed:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

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
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn,
      },
    );

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
  } catch (error) {
    console.error("User login failed:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @description Log out the current user by clearing the token cookie.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response confirming logout
 */
const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("User logout failed:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
};
