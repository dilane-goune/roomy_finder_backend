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
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const constants_1 = require("../data/constants");
function authentication(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authorization = req.headers.authorization;
            if (!authorization)
                return res.sendStatus(401);
            const token = authorization.split(" ")[1];
            const user = (0, jsonwebtoken_1.verify)(token, constants_1.SECRET_KEY);
            // req.userId = userId;
            req.userId = user.userId;
            next();
        }
        catch (error) {
            // console.log(error);
            if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                if (error.message === "jwt expired")
                    return res.status(401).json({ code: "jwt expired" });
                if (error.message === "jwt malformed")
                    return res.status(401).json({ code: "jwt malformed" });
                return res.status(401).json({ code: "other-error" });
            }
            // console.log(error);
            return res.status(500).json({ code: "server-error" });
        }
    });
}
exports.default = authentication;
