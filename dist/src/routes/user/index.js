"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const message_1 = __importDefault(require("./message"));
const profile_1 = __importDefault(require("./profile"));
const userRouter = (0, express_1.Router)();
exports.default = userRouter;
userRouter.use("/auth", auth_1.default);
userRouter.use("/profile", profile_1.default);
userRouter.use("/messages", message_1.default);
