const musicModel = require("../models/music.model.js");
const albumModel = require("../models/album.model.js");
const jwt = require("jsonwebtoken");
const uploadFile = require("../services/storage.service.js");

const createMusic = async (req, res) => {
    const { title } = req.body;
    const file = req.file;
    const artist = req.user;

    if (!file || !title) {
        return res.status(400).json({ message: "Title and file are required" });
    }

    try {
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
    } catch (error) {
        console.error("Music creation failed:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const createAlbum = async (req, res) => {
    const {title, musics} = req.body;
    const artist = req.user;

    if(!title || !musics){
        return res.status(400).json({ message: "Title and musics are required" });
    }

    try {
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
    } catch (error) {
        console.error("Album creation failed:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAllMusic = async (req, res) => {
    try {
        const musics = await musicModel.find();
        return res.status(200).json({
            message: "Musics fetched successfully",
            musics, 
        });
    } catch (error) {
        console.error("Music fetching failed:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAllAlbum = async (req, res) => {
    try {
        const albums = await albumModel.find().select("title artist").populate("artist", "username email");
        return res.status(200).json({
            message: "Albums fetched successfully",
            albums,
        });
    } catch (error) {
        console.error("Album fetching failed:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getAlbumById = async (req, res) => {
    const { albumId } = req.params;
    try {
        const album = await albumModel.findById(albumId).populate("artist", "username email").populate("musics", "title uri");
        return res.status(200).json({
            message: "Album fetched successfully",
            album,
        });
    } catch (error) {
        console.error("Album fetching failed:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createMusic,
    createAlbum,
    getAllMusic,
    getAllAlbum,
    getAlbumById,
};