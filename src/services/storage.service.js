/**
 * @module services/storage
 * @description File upload service using ImageKit SDK.
 */
const ImageKit = require("@imagekit/nodejs");
const config = require("../config/config");

/** @type {ImageKit} ImageKit client instance */
const imageKit = new ImageKit({
  privateKey: config.imagekitPrivateKey,
});

/**
 * @description Upload a base64-encoded file to ImageKit.
 * @param {string} file - Base64-encoded file content
 * @returns {Promise<Object>} ImageKit upload response containing `url`, `fileId`, etc.
 */
const uploadFile = async (file) => {
  const response = await imageKit.files.upload({
    file: file,
    fileName: "music_" + Date.now(),
    folder: "project-2/music",
  });
  return response;
};

module.exports = uploadFile;
