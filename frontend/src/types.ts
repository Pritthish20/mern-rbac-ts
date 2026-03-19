export type Role = "admin" | "user";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface TaskPerson {
  _id: string;
  name: string;
  email: string;
  role?: Role;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  owner: TaskPerson;
  createdBy: TaskPerson;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Session {
  token: string;
  user: User;
}
