import { Request, Response } from "express";
import { env } from "../config/env";
import { ROLES } from "../constants/roles";
import { User } from "../models/user.model";
import { ApiError } from "../utils/api-error";
import { signAccessToken } from "../utils/jwt";

function createAuthResponse(user: { _id: string; name: string; email: string; role: string }) {
  const token = signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    role: user.role as "admin" | "user"
  });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}

export async function register(req: Request, res: Response) {
  const { name, email, password, role, adminInviteCode } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const requestedRole =
    role === ROLES.ADMIN
      ? adminInviteCode === env.ADMIN_INVITE_CODE
        ? ROLES.ADMIN
        : (() => {
            throw new ApiError(403, "Invalid admin invite code");
          })()
      : ROLES.USER;

  const user = await User.create({
    name,
    email,
    password,
    role: requestedRole
  });

  return res.status(201).json(
    createAuthResponse({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    })
  );
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  return res.json(
    createAuthResponse({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    })
  );
}

export async function getMe(req: Request, res: Response) {
  const user = await User.findById(req.user?.id).select("_id name email role createdAt updatedAt");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  });
}

export async function listUsers(_req: Request, res: Response) {
  const users = await User.find().select("_id name email role createdAt").sort({ createdAt: -1 });

  return res.json({
    users: users.map((user) => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }))
  });
}
