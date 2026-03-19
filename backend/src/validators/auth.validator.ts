import { z } from "zod";
import { ROLE_VALUES, ROLES } from "../constants/roles";
import { sanitizeText } from "../utils/sanitize";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).transform(sanitizeText),
    email: z.string().email().transform((value) => value.trim().toLowerCase()),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be at most 72 characters"),
    role: z.enum(ROLE_VALUES as [typeof ROLES.ADMIN, typeof ROLES.USER]).optional(),
    adminInviteCode: z.string().optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email().transform((value) => value.trim().toLowerCase()),
    password: z.string().min(8).max(72)
  })
});
