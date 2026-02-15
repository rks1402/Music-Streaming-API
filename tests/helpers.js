const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const userModel = require("../src/models/user.model");

/**
 * Create a user directly in the database (bypasses the API).
 * Returns the created user document.
 */
const createUser = async (overrides = {}) => {
  const defaults = {
    username: "testuser",
    email: "test@example.com",
    password: "password123",
    role: "user",
  };

  const data = { ...defaults, ...overrides };
  data.password = await bcrypt.hash(data.password, 10);

  return userModel.create(data);
};

/**
 * Register a user via the API and return the token cookie string
 * ready for use with `.set("Cookie", cookie)`.
 */
const getAuthCookie = async (role = "user") => {
  const uniqueId = Date.now() + Math.random().toString(36).slice(2);
  const userData = {
    username: `testuser_${uniqueId}`,
    email: `test_${uniqueId}@example.com`,
    password: "password123",
    role,
  };

  const res = await request(app).post("/api/auth/register").send(userData);

  const cookies = res.headers["set-cookie"];
  if (!cookies) return null;

  // set-cookie can be a string or array
  const cookieStr = Array.isArray(cookies) ? cookies[0] : cookies;
  return cookieStr;
};

/**
 * Generate a JWT token directly (for middleware unit tests).
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

module.exports = { createUser, getAuthCookie, generateToken };
