import express from "express";
import cron from "node-cron";
import mongooseDb from "./db";
import { fetchRSSFeedAndUpdateDB } from "./utils/rss-feed";

//Connection to db
mongooseDb();

const app = express();

const PORT = 5000;

// Schedule the cron job to run every hour
try {
    cron.schedule("0 * * * *", () => {
        fetchRSSFeedAndUpdateDB().then((results) =>
            console.log(
                `Cron Job completed successfully and added ${results?.length} items`
            )
        );
    });
} catch (error) {
    console.error("Error fetching and storing RSS feeds:", error);
}

const server = app.listen(PORT, () =>
    console.log(`Hi server is running in port ${PORT}`)
);
// Handler for unhandled proise rejection
process.on("unhandledRejection", (err: any) => {
    console.log(`Err: ${err.message}`);
    //close server and exit process
    server.close(() => process.exit(1));
});
