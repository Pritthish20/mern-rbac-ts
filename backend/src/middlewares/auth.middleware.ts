import { NextFunction, Request, Response } from "express";
import { Role } from "../constants/roles";
import { User } from "../models/user.model";
import { ApiError } from "../utils/api-error";
import { verifyAccessToken } from "../utils/jwt";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return next(new ApiError(401, "Authentication required"));
    }

    const token = authorization.slice(7);
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("_id email role");

    if (!user) {
      return next(new ApiError(401, "Invalid or expired token"));
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role
    };

    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired token"));
  }
}

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to perform this action"));
    }

    return next();
  };
}
