/**
 * @module models/user
 * @description Mongoose model for the User entity.
 */
const mongoose = require("mongoose");

/**
 * @typedef {Object} User
 * @property {string} username - Unique username
 * @property {string} email - Unique email address
 * @property {string} password - Hashed password (bcrypt)
 * @property {"user"|"artist"} role - User role, defaults to "user"
 */

/**
 * Mongoose schema for the User model.
 * @type {mongoose.Schema<User>}
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "artist"],
    default: "user",
  },
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
