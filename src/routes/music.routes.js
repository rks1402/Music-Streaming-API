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

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", authMiddleware.authUser, getAllMusic);
router.get("/album", authMiddleware.authUser, getAllAlbum);
router.get("/album/:albumId", authMiddleware.authUser, getAlbumById);
router.post(
  "/upload",
  authMiddleware.authArtist,
  upload.single("file"),
  createMusic,
);
router.post("/create-album", authMiddleware.authArtist, createAlbum);

module.exports = router;
