import express from "express";
import cron from "node-cron";
import mongooseDb from "./db";
import { fetchRSSFeed } from "./utils/rss-feed";

//Connection to db
mongooseDb();

const app = express();

const PORT = 5000;

// Schedule the cron job to run every hour
cron.schedule("0 * * * *", fetchRSSFeed);

const server = app.listen(
    PORT,
    () => console.log(`Hi server is running in port ${PORT}`)
);
// Handler for unhandled proise rejection
process.on("unhandledRejection", (err: any) => {
    console.log(`Err: ${err.message}`);
    //close server and exit process
    server.close(() => process.exit(1));
});