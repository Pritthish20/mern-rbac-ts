import { Task, TaskPriority, TaskStatus } from "../types";
import { apiRequest } from "./client";

export type TaskPayload = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  owner?: string;
};

export function getTasks(token: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";

  return apiRequest<{ tasks: Task[] }>(`/tasks${query}`, {
    method: "GET",
    token
  });
}

export function createTask(token: string, payload: TaskPayload) {
  return apiRequest<{ task: Task }>("/tasks", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export function updateTask(token: string, taskId: string, payload: Partial<TaskPayload>) {
  return apiRequest<{ task: Task }>(`/tasks/${taskId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload)
  });
}

export function deleteTask(token: string, taskId: string) {
  return apiRequest<void>(`/tasks/${taskId}`, {
    method: "DELETE",
    token
  });
}
