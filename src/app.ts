import express from "express";
import path from "node:path";
import { container } from "./container.js";
import { environment } from "./config/Environment.js";
import { ErrorFactory } from "./errors/ErrorFactory.js";
import { ErrorMiddleware } from "./middleware/ErrorMiddleware.js";
import { RequestContextMiddleware } from "./middleware/RequestContextMiddleware.js";
import { RequestLoggerMiddleware } from "./middleware/RequestLoggerMiddleware.js";

export const createApp = () => {
  const app = express();
  const requestContext = new RequestContextMiddleware();
  const requestLogger = new RequestLoggerMiddleware();
  const errorMiddleware = new ErrorMiddleware();

  app.use(express.json({ limit: "1mb" }));
  app.use(requestContext.handle);
  app.use(requestLogger.handle);
  app.use(express.static(environment.publicDir));

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString()
      }
    });
  });

  app.use("/api/auth", container.routes.auth);
  app.use("/api/products", container.routes.products);
  app.use("/api/cart", container.routes.cart);
  app.use("/api/favorites", container.routes.favorites);
  app.use("/api/orders", container.routes.orders);
  app.use("/api/contact", container.routes.contact);

  app.get("/", (_req, res) => {
    res.sendFile(path.join(environment.publicDir, "index.html"));
  });

  app.use((req, _res, next) => {
    next(ErrorFactory.notFound(`Route ${req.method} ${req.originalUrl} not found`));
  });

  app.use(errorMiddleware.handle);

  return app;
};
