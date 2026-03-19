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
        url: `http://localhost:${env.PORT}`
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    },
    paths: {
      "/api/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user or admin"
        }
      },
      "/api/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login user"
        }
      },
      "/api/v1/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }]
        }
      },
      "/api/v1/auth/users": {
        get: {
          tags: ["Auth"],
          summary: "List all users",
          security: [{ bearerAuth: [] }]
        }
      },
      "/api/v1/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "List tasks",
          security: [{ bearerAuth: [] }]
        },
        post: {
          tags: ["Tasks"],
          summary: "Create a task",
          security: [{ bearerAuth: [] }]
        }
      },
      "/api/v1/tasks/{id}": {
        get: {
          tags: ["Tasks"],
          summary: "Get task by id",
          security: [{ bearerAuth: [] }]
        },
        patch: {
          tags: ["Tasks"],
          summary: "Update a task",
          security: [{ bearerAuth: [] }]
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete a task",
          security: [{ bearerAuth: [] }]
        }
      }
    }
  },
  apis: []
});
