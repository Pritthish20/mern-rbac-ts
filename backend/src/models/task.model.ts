import { Schema, Types, model } from "mongoose";

export const TASK_STATUS = ["todo", "in_progress", "done"] as const;
export const TASK_PRIORITY = ["low", "medium", "high"] as const;

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    status: {
      type: String,
      enum: TASK_STATUS,
      default: "todo"
    },
    priority: {
      type: String,
      enum: TASK_PRIORITY,
      default: "medium"
    },
    dueDate: {
      type: Date,
      default: null
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ owner: 1, status: 1, priority: 1 });
taskSchema.index({ title: "text", description: "text" });

export type TaskDocument = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  status: (typeof TASK_STATUS)[number];
  priority: (typeof TASK_PRIORITY)[number];
  dueDate: Date | null;
  owner: Types.ObjectId | { _id: Types.ObjectId };
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Task = model("Task", taskSchema);
