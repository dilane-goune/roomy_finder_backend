"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fcm_helper_1 = __importDefault(require("../../classes/fcm_helper"));
const messageRouter = (0, express_1.Router)();
exports.default = messageRouter;
messageRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reciever = JSON.parse(req.body.reciever);
        const message = JSON.parse(req.body.message);
        if (!reciever)
            return res.sendStatus(404);
        const result = yield fcm_helper_1.default.sendNofication("new-message", reciever.fcmToken, {
            message: req.body.message,
            reciever: req.body.reciever,
            sender: req.body.sender,
            body: message.text + "",
        });
        if (result)
            res.sendStatus(200);
        else
            res.sendStatus(500);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
