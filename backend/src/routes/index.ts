import { Router } from "express";
import { authRouter } from "./v1/auth.routes";
import { taskRouter } from "./v1/task.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/tasks", taskRouter);

export { apiRouter };
