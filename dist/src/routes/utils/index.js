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
const schema_1 = require("../../models/util/schema");
const utilRouter = (0, express_1.Router)();
exports.default = utilRouter;
utilRouter.use(authentication_1.default);
utilRouter.get("/app-update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update = yield schema_1.AppVersionModel.findOne({});
        if (update)
            res.json(update);
        else
            res.sendStatus(404);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
