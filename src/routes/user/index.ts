import { Router } from "express";
import authRouter from "./auth";
import messageRouter from "./message";
import profileRouter from "./profile";

const userRouter = Router();
export default userRouter;

userRouter.use("/auth", authRouter);
userRouter.use("/profile", profileRouter);
userRouter.use("/messages", messageRouter);
