import swaggerJsdoc from "swagger-jsdoc";
import { env } from "../config/env";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Scalable MERN RBAC API",
      version: "1.0.0",
      description: "Authentication, role-based access control, and task CRUD API"
    },
    servers: [
      {
        url: env.API_BASE_URL,
        description: env.NODE_ENV === "production" ? "Production server" : "Local development server"
      }
    ],
    tags: [
      { name: "Auth", description: "Authentication and user management" },
      { name: "Tasks", description: "Task CRUD operations" }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Validation failed" },
            details: { nullable: true }
          }
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "65f5d96d55d3028f1ab34ef1" },
            name: { type: "string", example: "Pritthish" },
            email: { type: "string", format: "email", example: "pritthish@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              example:
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example"
            },
            user: { $ref: "#/components/schemas/User" }
          }
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string", example: "Pritthish" },
            email: { type: "string", format: "email", example: "pritthish@example.com" },
            password: { type: "string", format: "password", example: "Admin@123" },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            adminInviteCode: { type: "string", example: "make-admin" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "pritthish@example.com" },
            password: { type: "string", format: "password", example: "Admin@123" }
          }
        },
        TaskPerson: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65f5d96d55d3028f1ab34ef1" },
            name: { type: "string", example: "Pritthish" },
            email: { type: "string", format: "email", example: "pritthish@example.com" },
            role: { type: "string", enum: ["user", "admin"], example: "user" }
          }
        },
        Task: {
          type: "object",
          properties: {
            _id: { type: "string", example: "65f5d96d55d3028f1ab34ef2" },
            title: { type: "string", example: "Finish assignment" },
            description: { type: "string", example: "Complete auth and RBAC implementation" },
            status: { type: "string", enum: ["todo", "in_progress", "done"], example: "todo" },
            priority: { type: "string", enum: ["low", "medium", "high"], example: "high" },
            dueDate: { type: "string", format: "date-time", nullable: true },
            owner: { $ref: "#/components/schemas/TaskPerson" },
            createdBy: { $ref: "#/components/schemas/TaskPerson" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        CreateTaskRequest: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Finish assignment" },
            description: { type: "string", example: "Complete auth and RBAC implementation" },
            status: { type: "string", enum: ["todo", "in_progress", "done"], example: "todo" },
            priority: { type: "string", enum: ["low", "medium", "high"], example: "medium" },
            dueDate: { type: "string", format: "date-time", example: "2026-03-25T10:00:00.000Z" },
            owner: { type: "string", example: "65f5d96d55d3028f1ab34ef1" }
          }
        },
        UpdateTaskRequest: {
          type: "object",
          properties: {
            title: { type: "string", example: "Finish assignment docs" },
            description: { type: "string", example: "Update Swagger and README" },
            status: { type: "string", enum: ["todo", "in_progress", "done"], example: "in_progress" },
            priority: { type: "string", enum: ["low", "medium", "high"], example: "high" },
            dueDate: { type: "string", format: "date-time", example: "2026-03-26T09:00:00.000Z" },
            owner: { type: "string", example: "65f5d96d55d3028f1ab34ef1" }
          }
        }
      }
    },
    paths: {
      "/api/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user or admin",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" }
                }
              }
            },
            "403": {
              description: "Invalid admin invite code",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "409": {
              description: "Email already registered",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/api/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" }
                }
              }
            },
            "401": {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/api/v1/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "Current authenticated user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" }
                    }
                  }
                }
              }
            },
            "401": {
              description: "Authentication required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/api/v1/auth/users": {
        get: {
          tags: ["Auth"],
          summary: "List all users",
          security: [{ bearerAuth: [] }],
          responses: {
            "200": {
              description: "All users",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      users: {
                        type: "array",
                        items: { $ref: "#/components/schemas/User" }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              description: "Authentication required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "403": {
              description: "Admin access required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/api/v1/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "List tasks for the current user or all tasks for admins",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "query",
              name: "status",
              schema: { type: "string", enum: ["todo", "in_progress", "done"] }
            },
            {
              in: "query",
              name: "priority",
              schema: { type: "string", enum: ["low", "medium", "high"] }
            },
            {
              in: "query",
              name: "search",
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": {
              description: "List of tasks",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      tasks: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Task" }
                      }
                    }
                  }
                }
              }
            },
            "401": {
              description: "Authentication required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        post: {
          tags: ["Tasks"],
          summary: "Create a task",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateTaskRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "Task created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      task: { $ref: "#/components/schemas/Task" }
                    }
                  }
                }
              }
            },
            "400": {
              description: "Validation failed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "401": {
              description: "Authentication required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      },
      "/api/v1/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task by id",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "200": {
              description: "Task found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      task: { $ref: "#/components/schemas/Task" }
                    }
                  }
                }
              }
            },
            "401": {
              description: "Authentication required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "403": {
              description: "Forbidden",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "404": {
              description: "Task not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        patch: {
          tags: ["Tasks"],
          summary: "Update a task",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UpdateTaskRequest" }
              }
            }
          },
          responses: {
            "200": {
              description: "Task updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      task: { $ref: "#/components/schemas/Task" }
                    }
                  }
                }
              }
            },
            "400": {
              description: "Validation failed",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "401": {
              description: "Authentication required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "403": {
              description: "Forbidden",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "404": {
              description: "Task not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete a task",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string" }
            }
          ],
          responses: {
            "204": {
              description: "Task deleted successfully"
            },
            "401": {
              description: "Authentication required",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "403": {
              description: "Forbidden",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            },
            "404": {
              description: "Task not found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: []
});
