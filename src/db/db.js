/**
 * @module db/db
 * @description MongoDB connection handler using Mongoose.
 */
const mongoose = require("mongoose");
const config = require("../config/config");

/**
 * @description Connect to MongoDB using the connection string from the centralized config.
 * Logs success or error to the console.
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
