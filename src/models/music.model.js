/**
 * @module models/music
 * @description Mongoose model for the Music entity (individual tracks).
 */
const mongoose = require("mongoose");

/**
 * @typedef {Object} Music
 * @property {string} uri - URL of the uploaded audio file (from ImageKit)
 * @property {string} title - Title of the music track
 * @property {mongoose.Types.ObjectId} artist - Reference to the User who uploaded the track
 */

/**
 * Mongoose schema for the Music model.
 * @type {mongoose.Schema<Music>}
 */
const musicSchema = new mongoose.Schema({
  uri: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
});

const musicModel = mongoose.model("music", musicSchema);

module.exports = musicModel;
