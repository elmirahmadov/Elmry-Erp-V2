import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app.error";
import logger from "../logger/logger";

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  logger.error(
    `${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`,
  );

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
