import amqp from "amqplib";

export const QUEUE_NAME = "NEWS";

const maxRetries = 10;
const retryInterval = 6000; // milliseconds
let connectionAttempts = 0;

async function connect() {
  try {
    const amqpServer = process.env.AMQP_SERVER;
    if (!amqpServer) {
      throw new Error("AMQP_SERVER URL is not defined");
    }
    const connection = await amqp.connect(amqpServer);
    const channel = await connection.createChannel();
    const { queue } = await channel.assertQueue(QUEUE_NAME);
    console.log(`Connected to RabbitMQ and created ${queue} queue.`);
    return channel;
  } catch (error) {
    console.log("Error while connecting to RabbitMQ:", error);
    if (connectionAttempts < maxRetries) {
      console.log(
        `Retrying connection to RabbitMQ in ${retryInterval / 1000} seconds...`
      );
      connectionAttempts++;
      setTimeout(connect, retryInterval);
    } else {
      console.error(
        "Error: Maximum connection retries reached to connect to RabbitMQ"
      );
    }
  }
}

export default connect;
