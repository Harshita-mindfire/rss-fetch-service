import express from "express";
import cron from "node-cron";
import { Channel } from "amqplib";
import dotenv from "dotenv";
import mongooseDb from "./db";
import { fetchRSSFeedAndUpdateDB } from "./utils/rss-feed";
import RabbitMQConnect, { QUEUE_NAME } from "./rabbitMQ";
import logger from "./logger";
import { Types } from "mongoose";

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
const PORT = process.env.PORT || 5002;

// Schedule the cron job to run every hour
try {
  cron.schedule("0 * * * *", async () => {
    const results = await fetchRSSFeedAndUpdateDB();
    const count = results?.length;
    if (count && count > 0) {
      logger.info(
        `Cron Job completed successfully at ${new Date().toISOString()} and added ${count} items`
      );
      const updatedEntriesId = results.map(
        ({ _id }: { _id: Types.ObjectId }) => _id
      );

      const data = {
        msg: `${count} items are updated in DB`,
        updatedEntriesId,
        count,
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
