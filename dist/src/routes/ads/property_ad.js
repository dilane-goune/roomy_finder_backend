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
const ads_1 = require("../../middlewares/ads");
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const schema_1 = __importDefault(require("../../models/property_ad/schema"));
const propertyAdRouter = (0, express_1.Router)();
exports.default = propertyAdRouter;
propertyAdRouter.use(authentication_1.default);
propertyAdRouter.get("/my-ads/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield schema_1.default.findById(req.params.id).populate("poster", "-password");
        if (data)
            res.json(data);
        else
            res.sendStatus(404);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
propertyAdRouter.get("/my-ads", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const skip = parseInt(req.query.skip) || 0;
        const data = yield schema_1.default.find({ poster: userId })
            .limit(100)
            .skip(skip)
            .populate("poster", "-password");
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
propertyAdRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield schema_1.default.create(Object.assign(Object.assign({}, req.body), { poster: req.userId }));
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
propertyAdRouter.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield schema_1.default.findByIdAndUpdate(req.params.id, req.body);
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
propertyAdRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const ad = yield schema_1.default.findOne({
            _id: req.params.id,
            poster: userId,
        });
        if (!ad)
            return res.sendStatus(404);
        if (ad.quantityTaken != 0) {
            return res.status(400).json({ code: "is-booked" });
        }
        if (!ad.poster.equals(userId))
            return res.sendStatus(403);
        yield ad.deleteOne();
        res.sendStatus(204);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
propertyAdRouter.get("/available", ads_1.createQueryModifier, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const query = req.query;
        const data = yield schema_1.default.find({
            "address.city": query.city,
            "address.location": query.location,
        })
            .limit(100)
            .skip(skip)
            .sort({ createdAt: -1 })
            .populate("poster", "-password -bankInfo");
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
