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
const schema_1 = __importDefault(require("../../models/roommate_ad/schema"));
const roommateAdRouter = (0, express_1.Router)();
exports.default = roommateAdRouter;
roommateAdRouter.use(authentication_1.default);
roommateAdRouter.get("/my-ads/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
roommateAdRouter.get("/my-ads", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
roommateAdRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield schema_1.default.create(Object.assign(Object.assign({}, req.body), { poster: req.userId }));
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
roommateAdRouter.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield schema_1.default.findByIdAndUpdate(req.params.id, req.body);
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
roommateAdRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const userId = (req as any).userId;
        // const booking = await BookingModel.findOne({ _id: req.params.id });
        // if (booking) return res.status(400).json({ code: "is-booked" });
        // const deal = await DealModel.findOne({ ad: req.params.id });
        // if (deal) return res.status(400).json({ code: "is-dealed" });
        // const ad = await RoommateAdModel.findOne({
        //   _id: req.params.id,
        //   poster: userId,
        // });
        // if (!ad) return res.sendStatus(404);
        // if (!ad.poster.equals(userId)) return res.sendStatus(403);
        // await ad.deleteOne();
        res.sendStatus(204);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
roommateAdRouter.post("/available", ads_1.roommateQueryModifier, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skip = parseInt(req.body.skip) || 0;
        const requestBody = req.body;
        const data = yield schema_1.default.find({
            "socialPreferences.gender": requestBody.gender,
            "address.location": { $in: requestBody.locations },
            "budget": {
                $gte: parseFloat(requestBody.minBudget + ""),
                $lte: parseFloat(requestBody.maxBudget + ""),
            },
        })
            .limit(100)
            .skip(skip)
            .populate("poster", "-password -bankInfo");
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
