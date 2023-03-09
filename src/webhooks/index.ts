import { Router } from "express";
import stripeWebHookHandler from "./stripe";

const webHookHandler = Router();

export default webHookHandler;

webHookHandler.use("/stripe", stripeWebHookHandler);
