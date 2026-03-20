import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { NextFunction, Request, Response } from "express";
import { connectDatabase } from "./config/db";
import { env } from "./config/env";
import { serveSwaggerJson, serveSwaggerUi } from "./docs/swagger-ui";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { apiRouter } from "./routes";

export const app = express();
const allowedOrigins = env.CLIENT_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);

app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(async (_req, _res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    next(error);
  }
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "mern-rbac-ts-backend"
  });
});

app.get("/api-docs", serveSwaggerUi);
app.get("/api-docs/", (_req: Request, res: Response) => {
  res.redirect(302, "/api-docs");
});
app.get("/api-docs.json", serveSwaggerJson);
app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
