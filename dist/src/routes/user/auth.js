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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const schema_1 = __importDefault(require("../../models/user/schema"));
const constants_1 = require("../../data/constants");
const schema_2 = __importDefault(require("../../models/login_monitory/schema"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const authRouter = (0, express_1.Router)();
exports.default = authRouter;
// generate access token
authRouter.post("/token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.sendStatus(400);
    try {
        const user = yield schema_1.default.findOne({ email });
        if (!user)
            return res.sendStatus(404);
        if (user.isDisabled)
            return res.status(403).json({ code: "disabled" });
        if (!bcrypt_1.default.compareSync(password, user.password))
            return res.sendStatus(403);
        const expireAt = new Date();
        expireAt.setHours(expireAt.getHours() + 2);
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, constants_1.SECRET_KEY, {
            expiresIn: "2h",
        });
        res.json({ token, expireAt: expireAt.toISOString() });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
// register
authRouter.post("/credentials", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hashedPassword = yield bcrypt_1.default.hash(req.body.password, 10);
        req.body.password = hashedPassword;
        const user = yield schema_1.default.create(req.body);
        res.status(201).json(user);
    }
    catch (error) {
        if (error.code === 11000)
            return res.status(409).json({ code: "user-exist" });
        console.error(error);
        res.sendStatus(500);
    }
}));
authRouter.put("/credentials", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findByIdAndUpdate(req.userId, {
            $set: {
                gender: req.body.gender,
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                country: req.body.country,
            },
        });
        if (!user)
            return res.sendStatus(404);
        res.sendStatus(200);
    }
    catch (error) {
        if (error.code === 11000)
            return res.status(409).json({ code: "user-exist" });
        console.error(error);
        res.sendStatus(500);
    }
}));
authRouter.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, email, fcmToken } = req.body;
        if (!fcmToken)
            return res.sendStatus(400);
        const user = yield schema_1.default.findOneAndUpdate({ email }, { $set: { fcmToken } }, { new: true });
        if (!user || user._id.equals("000000000000000000000000"))
            return res.sendStatus(404);
        if (user.isDisabled)
            return res.status(403).json({ code: "disabled" });
        if (!bcrypt_1.default.compareSync(password, user.password)) {
            if (user.failedToLoginCount + 1 == 20) {
                yield user.updateOne({
                    $inc: { failedToLoginCount: 1 },
                    $set: { isDisabled: true },
                });
            }
            else {
                yield user.updateOne({ $inc: { failedToLoginCount: 1 } });
            }
            yield schema_2.default.create({ user: user._id, succeeded: false });
            return res.status(403).json({ code: "incorrect-password" });
        }
        else {
            yield user.updateOne({ $set: { failedToLoginCount: 0 } });
            yield schema_2.default.create({ user: user._id, succeeded: true });
        }
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
authRouter.post("/reset-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { password, phone, fcmToken } = req.body;
        if (!fcmToken)
            return res.sendStatus(400);
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const user = yield schema_1.default.findOneAndUpdate({ phone }, { $set: { fcmToken, password: hashedPassword } }, { new: true });
        if (!user)
            return res.sendStatus(404);
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
    }
}));
authRouter.get("/user-exist", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.query;
        const user = yield schema_1.default.findOne({ email });
        if (user)
            res.json({ exist: true });
        else
            res.json({ exist: false });
    }
    catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
}));
