const jwt = require("jsonwebtoken");
const config = require("../config/config");

/**
 * @description Express middleware that authenticates and authorizes artist-only routes.
 * Verifies the JWT token from cookies and checks that the user role is "artist".
 * Sets `req.user` to the user's ID on success.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void|import('express').Response} Calls next() on success, or returns 401/403 JSON response
 */
const authArtist = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, config.jwtSecret);

    if (decodedToken.role !== "artist") {
      return res.status(403).json({ message: "Access Forbidden" });
    }

    req.user = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

/**
 * @description Express middleware that authenticates and authorizes user-only routes.
 * Verifies the JWT token from cookies and checks that the user role is "user".
 * Sets `req.user` to the user's ID on success.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 * @returns {void|import('express').Response} Calls next() on success, or returns 401/403 JSON response
 */
const authUser = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, config.jwtSecret);

    if (decodedToken.role !== "user") {
      return res.status(403).json({ message: "Access Forbidden" });
    }

    req.user = decodedToken.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authArtist, authUser };
