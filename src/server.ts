import { createServer } from "node:http";
import { createApp } from "./app.js";
import { environment } from "./config/Environment.js";
import { logger } from "./infrastructure/logging/Logger.js";
import { prisma } from "./infrastructure/database/prisma.js";

const app = createApp();
const server = createServer(app);

server.listen(environment.port, () => {
  logger.info("server_started", {
    port: environment.port,
    environment: environment.nodeEnv
  });
});

const shutdown = async (signal: string): Promise<void> => {
  logger.warn("server_shutdown_started", { signal });
  server.close(async () => {
    await prisma.$disconnect();
    logger.warn("server_shutdown_completed", { signal });
    process.exit(0);
  });
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
