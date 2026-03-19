import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { Role } from "../constants/roles";

type TokenPayload = {
  sub: string;
  role: Role;
  email: string;
};

export function signAccessToken(payload: TokenPayload) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    ...options
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
