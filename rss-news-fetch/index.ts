import express from "express";
import cron from "node-cron";
import { Channel } from "amqplib";
import dotenv from "dotenv";
import mongooseDb from "./db";
import { fetchRSSFeedAndUpdateDB } from "./utils/rss-feed";
import RabbitMQConnect, { QUEUE_NAME } from "./rabbitMQ";
import logger from "./logger";

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
    logger.info(
      `Cron Job completed successfully at ${new Date().toISOString()} and added ${updatedEntries} items`
    );
    if (updatedEntries && updatedEntries > 0) {
      const data = {
        msg: `${updatedEntries} items are updated in DB`,
        updatedEntries,
      };
      logger.info(`Sending message to ${QUEUE_NAME}`);
      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)));
    }
  });
} catch (error) {
  logger.error("Error while fetching and storing RSS feeds:", error);
}

const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// Handler for unhandled promise rejections
process.on("unhandledRejection", (err: unknown) => {
  logger.error(`Error: ${err}`);
  // Close server and exit process
  server.close(() => process.exit(1));
});
