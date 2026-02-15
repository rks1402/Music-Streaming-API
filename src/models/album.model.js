/**
 * @module models/album
 * @description Mongoose model for the Album entity (collection of music tracks).
 */
const mongoose = require("mongoose");

/**
 * @typedef {Object} Album
 * @property {string} title - Title of the album
 * @property {mongoose.Types.ObjectId} artist - Reference to the User who created the album
 * @property {mongoose.Types.ObjectId[]} musics - Array of references to Music tracks in the album
 */

/**
 * Mongoose schema for the Album model.
 * @type {mongoose.Schema<Album>}
 */
const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  musics: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "music",
    },
  ],
});

const albumModel = mongoose.model("album", albumSchema);

module.exports = albumModel;
