const ImageKit = require("@imagekit/nodejs");

const imageKit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const uploadFile = async (file) => {
  const response = await imageKit.files.upload({
    file: file,
    fileName: "music_" + Date.now(),
    folder: "project-2/music",
  });
  return response;
};

module.exports = uploadFile;
