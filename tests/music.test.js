const request = require("supertest");
const app = require("../src/app");
const { getAuthCookie, createUser, generateToken } = require("./helpers");
const musicModel = require("../src/models/music.model");
const mongoose = require("mongoose");

// Mock the storage service to avoid real ImageKit uploads
jest.mock("../src/services/storage.service.js", () => {
  return jest.fn().mockResolvedValue({
    url: "https://ik.imagekit.io/test/music_mock.mp3",
    fileId: "mock-file-id",
  });
});

describe("Music Endpoints", () => {
  let userCookie;
  let artistCookie;

  beforeEach(async () => {
    userCookie = await getAuthCookie("user");
    artistCookie = await getAuthCookie("artist");
  });

  // ─── GET /api/music ────────────────────────────────────────
  describe("GET /api/music", () => {
    it("should return 401 without authentication", async () => {
      const res = await request(app).get("/api/music");
      expect(res.status).toBe(401);
    });

    it("should return 403 when artist tries to access user-only route", async () => {
      const res = await request(app)
        .get("/api/music")
        .set("Cookie", artistCookie);
      expect(res.status).toBe(403);
    });

    it("should return empty music array for authenticated user", async () => {
      const res = await request(app)
        .get("/api/music")
        .set("Cookie", userCookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Musics fetched successfully");
      expect(res.body.musics).toEqual([]);
    });

    it("should return music list when music exists", async () => {
      // Create some music directly in the database
      const user = await createUser({
        username: "musicartist",
        email: "musicartist@example.com",
        role: "artist",
      });
      await musicModel.create({
        title: "Test Song",
        uri: "https://example.com/song.mp3",
        artist: user._id,
      });

      const res = await request(app)
        .get("/api/music")
        .set("Cookie", userCookie);

      expect(res.status).toBe(200);
      expect(res.body.musics).toHaveLength(1);
      expect(res.body.musics[0].title).toBe("Test Song");
    });
  });

  // ─── POST /api/music/upload ────────────────────────────────
  describe("POST /api/music/upload", () => {
    it("should return 401 without authentication", async () => {
      const res = await request(app).post("/api/music/upload");
      expect(res.status).toBe(401);
    });

    it("should return 403 when a regular user tries to upload", async () => {
      const res = await request(app)
        .post("/api/music/upload")
        .set("Cookie", userCookie)
        .field("title", "My Song")
        .attach("file", Buffer.from("fake-audio-data"), "song.mp3");

      expect(res.status).toBe(403);
    });

    it("should upload music successfully as an artist", async () => {
      const res = await request(app)
        .post("/api/music/upload")
        .set("Cookie", artistCookie)
        .field("title", "My New Song")
        .attach("file", Buffer.from("fake-audio-data"), "song.mp3");

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Music created successfully");
      expect(res.body.music).toHaveProperty("id");
      expect(res.body.music.title).toBe("My New Song");
      expect(res.body.music.uri).toBe(
        "https://ik.imagekit.io/test/music_mock.mp3",
      );
    });

    it("should return 400 when title is missing", async () => {
      const res = await request(app)
        .post("/api/music/upload")
        .set("Cookie", artistCookie)
        .attach("file", Buffer.from("fake-audio-data"), "song.mp3");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Title and file are required");
    });

    it("should return 400 when file is missing", async () => {
      const res = await request(app)
        .post("/api/music/upload")
        .set("Cookie", artistCookie)
        .field("title", "No File Song");

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Title and file are required");
    });
  });

  // ─── POST /api/music/create-album ──────────────────────────
  describe("POST /api/music/create-album", () => {
    it("should return 401 without authentication", async () => {
      const res = await request(app).post("/api/music/create-album");
      expect(res.status).toBe(401);
    });

    it("should return 403 when a regular user tries to create album", async () => {
      const res = await request(app)
        .post("/api/music/create-album")
        .set("Cookie", userCookie)
        .send({ title: "My Album", musics: [] });

      expect(res.status).toBe(403);
    });

    it("should create album successfully as an artist", async () => {
      // Create a music entry first
      const user = await createUser({
        username: "albumartist",
        email: "albumartist@example.com",
        role: "artist",
      });
      const music = await musicModel.create({
        title: "Album Song",
        uri: "https://example.com/song.mp3",
        artist: user._id,
      });

      const res = await request(app)
        .post("/api/music/create-album")
        .set("Cookie", artistCookie)
        .send({
          title: "My Album",
          musics: [music._id],
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("Album created successfully");
      expect(res.body.album).toHaveProperty("id");
      expect(res.body.album.title).toBe("My Album");
      expect(res.body.album.musics).toHaveLength(1);
    });

    it("should return 400 when title is missing", async () => {
      const res = await request(app)
        .post("/api/music/create-album")
        .set("Cookie", artistCookie)
        .send({ musics: [] });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Title and musics are required");
    });

    it("should return 400 when musics is missing", async () => {
      const res = await request(app)
        .post("/api/music/create-album")
        .set("Cookie", artistCookie)
        .send({ title: "No Music Album" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Title and musics are required");
    });
  });

  // ─── GET /api/music/album ──────────────────────────────────
  describe("GET /api/music/album", () => {
    it("should return 401 without authentication", async () => {
      const res = await request(app).get("/api/music/album");
      expect(res.status).toBe(401);
    });

    it("should return albums for authenticated user", async () => {
      const res = await request(app)
        .get("/api/music/album")
        .set("Cookie", userCookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Albums fetched successfully");
      expect(res.body.albums).toEqual([]);
    });
  });

  // ─── GET /api/music/album/:albumId ─────────────────────────
  describe("GET /api/music/album/:albumId", () => {
    it("should return 401 without authentication", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/music/album/${fakeId}`);
      expect(res.status).toBe(401);
    });

    it("should return album by ID for authenticated user", async () => {
      const user = await createUser({
        username: "albumfetcher",
        email: "albumfetcher@example.com",
        role: "artist",
      });
      const music = await musicModel.create({
        title: "Fetch Song",
        uri: "https://example.com/fetch.mp3",
        artist: user._id,
      });
      const albumModel = require("../src/models/album.model");
      const album = await albumModel.create({
        title: "Fetch Album",
        artist: user._id,
        musics: [music._id],
      });

      const res = await request(app)
        .get(`/api/music/album/${album._id}`)
        .set("Cookie", userCookie);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Album fetched successfully");
      expect(res.body.album.title).toBe("Fetch Album");
      expect(res.body.album.musics).toHaveLength(1);
      expect(res.body.album.musics[0].title).toBe("Fetch Song");
    });
  });
});
