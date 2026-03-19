import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { env } from "../config/env";
import { ApiError } from "../utils/api-error";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  error: Error & { statusCode?: number; details?: unknown; code?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.errors
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      message: "Invalid resource id"
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      details: error.flatten()
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "A record with that unique value already exists"
    });
  }

  const statusCode = error.statusCode ?? 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  return res.status(statusCode).json({
    message: error.message || "Internal server error",
    details: error.details,
    ...(env.NODE_ENV === "development" && statusCode >= 500 ? { stack: error.stack } : {})
  });
}
