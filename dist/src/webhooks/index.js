"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const stripe_1 = __importDefault(require("./stripe"));
const webHookHandler = (0, express_1.Router)();
exports.default = webHookHandler;
webHookHandler.use("/stripe", stripe_1.default);
