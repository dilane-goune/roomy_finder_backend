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
const run_in_transaction_1 = __importDefault(require("../../functions/run_in_transaction"));
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const schema_1 = __importDefault(require("../../models/deal/schema"));
const schema_2 = __importDefault(require("../../models/property_ad/schema"));
const dealRouter = (0, express_1.Router)();
exports.default = dealRouter;
dealRouter.use(authentication_1.default);
dealRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = parseInt(req.query.skip) || 0;
    const userId = req.userId;
    try {
        const data = yield schema_1.default.find({ client: userId })
            .skip(skip)
            .limit(100)
            .populate([
            { path: "poster" },
            { path: "client", select: "-password -bankInfo" },
            { path: "ad", populate: "poster" },
        ]);
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
dealRouter.post("/:id/end", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const deal = yield schema_1.default.findOne({
            _id: req.params.id,
            poster: userId,
        }).populate([
            { path: "poster" },
            { path: "client", select: "-password -bankInfo" },
            { path: "ad" },
        ]);
        if (!deal)
            return res.sendStatus(404);
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            yield schema_1.default.deleteOne({ $or: [{ client: userId }, { poster: userId }] }, { session });
            if (deal.adType == "PROPERTY") {
                yield schema_2.default.updateOne({ _id: deal.ad }, { $inc: { quantityTaken: -1 } }, { session });
            }
        }));
        fcm_helper_1.default.sendNofication("deal-ended", userId == deal.poster.id ? deal.client.fcmToken : deal.poster.fcmToken, {
            deal: JSON.stringify(deal),
            endedBy: userId == deal.poster.id ? "poster" : "client",
        });
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
dealRouter.post("/:id/pay", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.sendStatus(200);
        const recieverFcmToken = req.body.recieverFcmToken;
        fcm_helper_1.default.sendNofication("deal-paid", recieverFcmToken, {});
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
