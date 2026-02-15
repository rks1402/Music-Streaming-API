/**
 * @module routes/music
 * @description Music and album routes for streaming, uploading, and managing content.
 * All routes are prefixed with `/api/music` (mounted in app.js).
 * User routes require `authUser` middleware; artist routes require `authArtist`.
 */
const express = require("express");
const router = express.Router();
const {
  createMusic,
  createAlbum,
  getAllMusic,
  getAllAlbum,
  getAlbumById,
} = require("../controllers/music.controller.js");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware.js");

/** @description Multer instance using in-memory storage for file uploads */
const upload = multer({ storage: multer.memoryStorage() });

/** @route GET /api/music - Get all music tracks (user auth required) */
router.get("/", authMiddleware.authUser, getAllMusic);

/** @route GET /api/music/album - Get all albums (user auth required) */
router.get("/album", authMiddleware.authUser, getAllAlbum);

/** @route GET /api/music/album/:albumId - Get a single album by ID (user auth required) */
router.get("/album/:albumId", authMiddleware.authUser, getAlbumById);

/** @route POST /api/music/upload - Upload a new music track (artist auth required) */
router.post(
  "/upload",
  authMiddleware.authArtist,
  upload.single("file"),
  createMusic,
);

/** @route POST /api/music/create-album - Create a new album (artist auth required) */
router.post("/create-album", authMiddleware.authArtist, createAlbum);

module.exports = router;
