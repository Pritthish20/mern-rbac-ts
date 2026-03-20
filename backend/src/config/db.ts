import mongoose from "mongoose";
import { env } from "./env";
import { User } from "../models/user.model";
import { ROLES } from "../constants/roles";

declare global {
  // Cache the connection promise between serverless invocations.
  // eslint-disable-next-line no-var
  var mongoosePromise: Promise<typeof mongoose> | undefined;
}

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!global.mongoosePromise) {
    global.mongoosePromise = mongoose.connect(env.MONGODB_URI);
  }

  try {
    await global.mongoosePromise;
  } catch (error) {
    global.mongoosePromise = undefined;
    throw error;
  }

  console.log("MongoDB connected");
  return mongoose;
}

export async function seedDefaultAdmin() {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD || !env.SEED_ADMIN_NAME) {
    return;
  }

  const existingAdmin = await User.findOne({ email: env.SEED_ADMIN_EMAIL.toLowerCase() });

  if (existingAdmin) {
    return;
  }

  await User.create({
    name: env.SEED_ADMIN_NAME,
    email: env.SEED_ADMIN_EMAIL.toLowerCase(),
    password: env.SEED_ADMIN_PASSWORD,
    role: ROLES.ADMIN
  });

  console.log("Default admin user seeded");
}
