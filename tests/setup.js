// Set ALL test env vars BEFORE any app module (or config.js) is loaded.
// dotenv does NOT overwrite existing env vars, so these take precedence.
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.IMAGEKIT_PRIVATE_KEY = "test-private-key";
process.env.MONGODB_URI = "placeholder"; // overwritten in beforeAll with real memory server URI

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Override the placeholder with the actual in-memory URI
  process.env.MONGODB_URI = uri;

  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
