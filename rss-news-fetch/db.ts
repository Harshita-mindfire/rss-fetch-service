import mongoose from "mongoose";
import logger from "./logger";

const dbConnect = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("Mongo Uri is not set.");
    }
    const conn = await mongoose.connect(uri);
    logger.info(`Connected to mongo db ${conn.connection.host}`);
  } catch (err: unknown) {
    logger.error("Error connection with DB.", err);
  }
};

export default dbConnect;
