const musicModel = require("../models/music.model.js");
const albumModel = require("../models/album.model.js");
const uploadFile = require("../services/storage.service.js");
const AppError = require("../utils/AppError.js");
const asyncHandler = require("../utils/asyncHandler.js");

/**
 * @description Upload a new music track. Requires artist role.
 * Uploads the file to ImageKit and stores the metadata in the database.
 * @param {import('express').Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Title of the music track
 * @param {Express.Multer.File} req.file - The uploaded audio file (from multer)
 * @param {string} req.user - The authenticated artist's user ID (set by auth middleware)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response with music data or error message
 */
const createMusic = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const file = req.file;
  const artist = req.user;

  if (!file || !title) {
    throw new AppError("Title and file are required", 400);
  }

  const response = await uploadFile(file.buffer.toString("base64"));

  const music = await musicModel.create({
    uri: response.url,
    title,
    artist: artist,
  });

  return res.status(201).json({
    message: "Music created successfully",
    music: {
      id: music._id,
      title: music.title,
      uri: music.uri,
      artist: music.artist,
    },
  });
});

/**
 * @description Create a new album. Requires artist role.
 * @param {import('express').Request} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.title - Title of the album
 * @param {string[]} req.body.musics - Array of music track ObjectIds to include in the album
 * @param {string} req.user - The authenticated artist's user ID (set by auth middleware)
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response with album data or error message
 */
const createAlbum = asyncHandler(async (req, res) => {
  const { title, musics } = req.body;
  const artist = req.user;

  if (!title || !musics) {
    throw new AppError("Title and musics are required", 400);
  }

  const album = await albumModel.create({
    title,
    artist: artist,
    musics: musics,
  });

  return res.status(201).json({
    message: "Album created successfully",
    album: {
      id: album._id,
      title: album.title,
      artist: album.artist,
      musics: album.musics,
    },
  });
});

/**
 * @description Fetch all music tracks from the database.
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response with array of music tracks
 */
const getAllMusic = asyncHandler(async (req, res) => {
  const musics = await musicModel.find();
  return res.status(200).json({
    message: "Musics fetched successfully",
    musics,
  });
});

/**
 * @description Fetch all albums with populated artist info (username, email).
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response with array of albums
 */
const getAllAlbum = asyncHandler(async (req, res) => {
  const albums = await albumModel
    .find()
    .select("title artist")
    .populate("artist", "username email");
  return res.status(200).json({
    message: "Albums fetched successfully",
    albums,
  });
});

/**
 * @description Fetch a single album by its ID, with populated artist and music data.
 * @param {import('express').Request} req - Express request object
 * @param {string} req.params.albumId - The album's ObjectId
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<import('express').Response>} JSON response with the album data
 */
const getAlbumById = asyncHandler(async (req, res) => {
  const { albumId } = req.params;
  const album = await albumModel
    .findById(albumId)
    .populate("artist", "username email")
    .populate("musics", "title uri");

  if (!album) {
    throw new AppError("Album not found", 404);
  }

  return res.status(200).json({
    message: "Album fetched successfully",
    album,
  });
});

module.exports = {
  createMusic,
  createAlbum,
  getAllMusic,
  getAllAlbum,
  getAlbumById,
};
