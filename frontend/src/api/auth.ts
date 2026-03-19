import { AuthResponse, UserSummary } from "../types";
import { apiRequest } from "./client";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  adminInviteCode?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export function register(payload: RegisterInput) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function login(payload: LoginInput) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<{ user: AuthResponse["user"] }>("/auth/me", {
    method: "GET",
    token
  });
}

export function getUsers(token: string) {
  return apiRequest<{ users: UserSummary[] }>("/auth/users", {
    method: "GET",
    token
  });
}
