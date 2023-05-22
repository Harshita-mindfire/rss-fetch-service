import express from "express";
import cron from "node-cron";
import mongooseDb from "./db";
import { fetchRSSFeedAndUpdateDB } from "./utils/rss-feed";
import dotenv from "dotenv";
import RabbitMQConnect, { QUEUE_NAME } from "./rabbitMQ";
import { Channel } from "amqplib";

dotenv.config({ path: ".env" });

// Connection to the database
mongooseDb();

// Connection to RabbitMQ
let channel: Channel;

RabbitMQConnect().then((data) => {
  if (data) {
    channel = data;
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Schedule the cron job to run every hour
try {
  cron.schedule("0 * * * *", async () => {
    const results = await fetchRSSFeedAndUpdateDB();
    const updatedEntries = results?.length;
    console.log(
      `Cron Job completed successfully at ${new Date().toISOString()} and added ${updatedEntries} items`
    );
    if (updatedEntries && updatedEntries > 0) {
      const data = {
        msg: `${updatedEntries} items are updated in DB`,
        updatedEntries,
      };
      console.log(`Sending message to ${QUEUE_NAME}`);
      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));
    }
  });
} catch (error) {
  console.error("Error while fetching and storing RSS feeds:", error);
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handler for unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.log(`Error: ${err.message}`);
  // Close server and exit process
  server.close(() => process.exit(1));
});
