/**
 * @module config/config
 * @description Centralized application configuration. Reads all environment
 * variables in one place, validates required values, and exports a config object.
 * All other modules should import from this file instead of using `process.env` directly.
 */
require("dotenv").config();

/**
 * @typedef {Object} AppConfig
 * @property {number} port - Server port number
 * @property {string} mongodbUri - MongoDB connection string
 * @property {string} jwtSecret - Secret key for signing JWT tokens
 * @property {string} jwtExpiresIn - JWT token expiration duration
 * @property {string} imagekitPrivateKey - ImageKit private API key
 */

/** @type {AppConfig} */
const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  imagekitPrivateKey: process.env.IMAGEKIT_PRIVATE_KEY,
};

// Validate required config values — fail fast on startup
const requiredKeys = ["mongodbUri", "jwtSecret", "imagekitPrivateKey"];
for (const key of requiredKeys) {
  if (!config[key]) {
    throw new Error(`Missing required environment variable for config.${key}`);
  }
}

module.exports = config;
