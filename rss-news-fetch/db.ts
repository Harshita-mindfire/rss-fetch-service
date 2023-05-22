import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("Mongo Uri is not set.");
    }
    const conn = await mongoose.connect(uri);
    console.log(`Connected to mongo db ${conn.connection.host}`);
  } catch (err: unknown) {
    console.log("Error connection with DB.", err);
  }
};

export default dbConnect;
