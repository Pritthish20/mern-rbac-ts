import { Router } from "express";
import { ROLES } from "../../constants/roles";
import { getMe, listUsers, login, register } from "../../controllers/auth.controller";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { loginSchema, registerSchema } from "../../validators/auth.validator";

const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.get("/me", authenticate, asyncHandler(getMe));
authRouter.get("/users", authenticate, authorize(ROLES.ADMIN), asyncHandler(listUsers));

export { authRouter };
