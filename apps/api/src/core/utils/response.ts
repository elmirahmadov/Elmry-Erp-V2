import { Response } from "express";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string = "Error",
  statusCode: number = 500,
  errors?: any,
) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
