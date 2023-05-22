import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      format: winston.format.json(),
      filename: "logs/rss-news-fetch-service.log",
    }),
  ],
});

export default logger;
