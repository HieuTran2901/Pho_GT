import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/tokens";
import { sendError } from "../utils/response";

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return sendError(res, "Vui lòng đăng nhập để tiếp tục", 401);
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return sendError(res, "Phiên đăng nhập đã hết hạn hoặc không hợp lệ", 401);
  }

  req.user = payload;
  next();
};

export const optionalAuthenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.user = payload;
    }
  }

  next();
};
