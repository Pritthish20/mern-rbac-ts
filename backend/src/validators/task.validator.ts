import { z } from "zod";
import { TASK_PRIORITY, TASK_STATUS } from "../models/task.model";
import { sanitizeText } from "../utils/sanitize";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid resource id");
const optionalDateSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().datetime())
  .optional()
  .or(z.literal(""));

export const taskIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema
  })
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(120).transform(sanitizeText),
    description: z.string().max(1000).optional().default("").transform(sanitizeText),
    status: z.enum(TASK_STATUS).optional(),
    priority: z.enum(TASK_PRIORITY).optional(),
    dueDate: optionalDateSchema,
    owner: objectIdSchema.optional()
  })
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: objectIdSchema
  }),
  body: z
    .object({
      title: z.string().min(3).max(120).transform(sanitizeText).optional(),
      description: z.string().max(1000).transform(sanitizeText).optional(),
      status: z.enum(TASK_STATUS).optional(),
      priority: z.enum(TASK_PRIORITY).optional(),
      dueDate: optionalDateSchema,
      owner: objectIdSchema.optional()
    })
    .refine((data) => Object.keys(data).length > 0, "At least one field is required")
});

export const listTaskSchema = z.object({
  query: z.object({
    status: z.enum(TASK_STATUS).optional(),
    priority: z.enum(TASK_PRIORITY).optional(),
    search: z.string().max(120).optional().transform((value) => value?.trim())
  })
});
