import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask
} from "../../controllers/task.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import {
  createTaskSchema,
  listTaskSchema,
  taskIdParamSchema,
  updateTaskSchema
} from "../../validators/task.validator";

const taskRouter = Router();

taskRouter.use(authenticate);

taskRouter.get("/", validate(listTaskSchema), asyncHandler(listTasks));
taskRouter.post("/", validate(createTaskSchema), asyncHandler(createTask));
taskRouter.get("/:id", validate(taskIdParamSchema), asyncHandler(getTask));
taskRouter.patch("/:id", validate(updateTaskSchema), asyncHandler(updateTask));
taskRouter.delete("/:id", validate(taskIdParamSchema), asyncHandler(deleteTask));

export { taskRouter };
