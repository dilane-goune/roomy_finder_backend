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
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const schema_1 = __importDefault(require("../../models/user/schema"));
const profileRouter = (0, express_1.Router)();
exports.default = profileRouter;
profileRouter.delete("/remove-pp", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        schema_1.default.updateOne({ _id: userId }, { $set: { pp: null } });
        res.sendStatus(204);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
// update password
profileRouter.put("/password", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const user = yield schema_1.default.findById(userId, { password: 1 });
        if (oldPassword != (user === null || user === void 0 ? void 0 : user.password))
            return res.sendStatus(403);
        const result = yield schema_1.default.updateOne({ _id: userId }, { $set: { password: newPassword } });
        if (result.modifiedCount == 1)
            return res.sendStatus(200);
        res.sendStatus(404);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
// update profile
profileRouter.put("/credentials", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        delete req.body.balance;
        delete req.body.password;
        const result = yield schema_1.default.updateOne({ _id: userId }, { $set: req.body });
        if (result.modifiedCount == 1)
            return res.sendStatus(200);
        res.sendStatus(404);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
