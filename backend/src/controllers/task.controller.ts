import { Request, Response } from "express";
import { FilterQuery, Types } from "mongoose";
import { ROLES } from "../constants/roles";
import { Task, TaskDocument } from "../models/task.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/api-error";
import { escapeRegex } from "../utils/sanitize";

function parseDueDate(value?: string) {
  if (!value) {
    return undefined;
  }

  return new Date(value);
}

async function getTaskOrFail(taskId: string) {
  const task = await Task.findById(taskId)
    .populate("owner", "_id name email role")
    .populate("createdBy", "_id name email");

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  return task;
}

function ownerIdToString(owner: TaskDocument["owner"]) {
  if (owner instanceof Types.ObjectId) {
    return owner.toString();
  }

  return owner._id.toString();
}

function canAccessTask(task: TaskDocument, currentUserId: string, currentUserRole: string) {
  return currentUserRole === ROLES.ADMIN || ownerIdToString(task.owner) === currentUserId;
}

export async function listTasks(req: Request, res: Response) {
  const { status, priority, search } = req.query as Record<string, string | undefined>;
  const filter: FilterQuery<TaskDocument> = {};

  if (req.user?.role !== ROLES.ADMIN) {
    filter.owner = req.user?.id;
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { title: { $regex: safeSearch, $options: "i" } },
      { description: { $regex: safeSearch, $options: "i" } }
    ];
  }

  const tasks = await Task.find(filter)
    .populate("owner", "_id name email role")
    .populate("createdBy", "_id name email")
    .sort({ createdAt: -1 });

  return res.json({ tasks });
}

export async function createTask(req: Request, res: Response) {
  const { title, description, status, priority, dueDate, owner } = req.body;
  let ownerId = req.user!.id;

  if (req.user?.role === ROLES.ADMIN && owner) {
    const assignedUser = await User.findById(owner).select("_id");

    if (!assignedUser) {
      throw new ApiError(404, "Assigned user not found");
    }

    ownerId = assignedUser._id.toString();
  }

  const task = await Task.create({
    title,
    description,
    status,
    priority,
    dueDate: parseDueDate(dueDate) ?? null,
    owner: ownerId,
    createdBy: req.user!.id
  });

  const populatedTask = await getTaskOrFail(task._id.toString());

  return res.status(201).json({ task: populatedTask });
}

export async function getTask(req: Request, res: Response) {
  const taskId = String(req.params.id);
  const task = (await getTaskOrFail(taskId)) as unknown as TaskDocument;

  if (!canAccessTask(task, req.user!.id, req.user!.role)) {
    throw new ApiError(403, "You do not have permission to access this task");
  }

  return res.json({ task });
}

export async function updateTask(req: Request, res: Response) {
  const taskId = String(req.params.id);
  const task = (await getTaskOrFail(taskId)) as unknown as TaskDocument & {
    save: () => Promise<unknown>;
  };

  if (!canAccessTask(task, req.user!.id, req.user!.role)) {
    throw new ApiError(403, "You do not have permission to update this task");
  }

  const { title, description, status, priority, dueDate, owner } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;

  if (owner !== undefined) {
    if (req.user?.role !== ROLES.ADMIN) {
      throw new ApiError(403, "Only admins can reassign tasks");
    }

    const assignedUser = await User.findById(owner).select("_id");

    if (!assignedUser) {
      throw new ApiError(404, "Assigned user not found");
    }

    task.owner = assignedUser._id;
  }

  await task.save();

  const populatedTask = await getTaskOrFail(task._id.toString());

  return res.json({ task: populatedTask });
}

export async function deleteTask(req: Request, res: Response) {
  const taskId = String(req.params.id);
  const task = (await getTaskOrFail(taskId)) as unknown as TaskDocument & {
    deleteOne: () => Promise<unknown>;
  };

  if (!canAccessTask(task, req.user!.id, req.user!.role)) {
    throw new ApiError(403, "You do not have permission to delete this task");
  }

  await task.deleteOne();

  return res.status(204).send();
}
