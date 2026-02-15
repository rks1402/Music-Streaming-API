/**
 * @module server
 * @description Application entry point. Loads centralized config,
 * connects to MongoDB, and starts the Express HTTP server.
 */
const config = require("./src/config/config");
const app = require("./src/app");
const connectDB = require("./src/db/db");

connectDB();

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
