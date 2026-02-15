/**
 * @module app
 * @description Express application setup. Configures middleware (JSON parsing, CORS,
 * cookie-parser) and mounts the auth and music route handlers.
 */
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes.js");
const musicRoutes = require("./routes/music.routes.js");
const errorHandler = require("./middlewares/error.middleware.js");

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/music", musicRoutes);

// Global error handler — must be registered after all routes
app.use(errorHandler);

module.exports = app;
