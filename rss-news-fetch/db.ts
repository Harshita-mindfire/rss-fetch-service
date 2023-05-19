import mongoose from "mongoose";

const dbConnect = async () => {
    const conn = await mongoose.connect("mongodb://mongo-db:27017/newsforyou");
    console.log(`Connected to mongo db ${conn.connection.host}`);
};

export default dbConnect;