import { createClient } from "redis";

// Make Redis optional - only connect if credentials are provided
const isRedisConfigured = process.env.REDIS_HOST && process.env.REDIS_PORT;

let redisClient: ReturnType<typeof createClient> | null = null;

if (isRedisConfigured) {
  redisClient = createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  });

  redisClient.on("error", (err) => console.log("Redis Client Error", err));

  // Connect asynchronously
  redisClient
    .connect()
    .then(() => console.log("✓ Connected to Redis"))
    .catch((err) => console.error("Failed to connect to Redis:", err));
} else {
  console.warn("⚠ Redis not configured - some features may be unavailable");
}

export default redisClient;
