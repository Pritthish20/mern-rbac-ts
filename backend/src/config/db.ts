import mongoose from "mongoose";
import { env } from "./env";
import { User } from "../models/user.model";
import { ROLES } from "../constants/roles";

export async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI);
  console.log("MongoDB connected");
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
