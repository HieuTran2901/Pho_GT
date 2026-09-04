import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[SERVER_ERROR]", err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Đã xảy ra lỗi hệ thống máy chủ";
  return sendError(res, message, statusCode, process.env.NODE_ENV === "development" ? err.stack : undefined);
};
