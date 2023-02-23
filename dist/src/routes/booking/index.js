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
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const schema_1 = __importDefault(require("../../models/booking/schema"));
const schema_2 = __importDefault(require("../../models/property_ad/schema"));
const schema_3 = __importDefault(require("../../models/roommate_ad/schema"));
const bookingRouter = (0, express_1.Router)();
exports.default = bookingRouter;
bookingRouter.use(authentication_1.default);
bookingRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const landlord = req.body.landlordId;
        const ad = req.body.adId;
        const recieverFcmToken = req.body.recieverFcmToken;
        const type = req.body.type;
        if (landlord == userId) {
            return res.sendStatus(403);
        }
        const readAd = type == "PROPERTY"
            ? yield schema_2.default.findById(ad, {})
            : yield schema_3.default.findById(ad, {});
        if (!readAd) {
            return res.sendStatus(404);
        }
        const oldBooking = yield schema_1.default.findOne({
            client: userId,
            landlord,
            ad,
        });
        if (oldBooking) {
            return res.sendStatus(409);
        }
        const booking = yield schema_1.default.create(Object.assign(Object.assign({}, req.body), { client: userId, landlord,
            ad,
            type }));
        res.sendStatus(200);
        fcm_helper_1.default.sendNofication("new-booking", recieverFcmToken, {
            bookingId: booking._id.toString(),
            type: "property",
        });
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
bookingRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = parseInt(req.query.skip) || 0;
    const status = req.query.status;
    const filter = {};
    if (status)
        filter.status = status;
    try {
        const data = yield schema_1.default.find(filter)
            .skip(skip)
            .limit(100)
            .populate(["landlord", "client", "ad"], "-password -bankInfo");
        res.json(data);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
bookingRouter.post("/:id/offer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield schema_1.default.findByIdAndUpdate(req.params.id, {
            $set: { status: "OFFERED" },
        });
        if (!booking)
            return res.sendStatus(404);
        res.sendStatus(200);
        const recieverFcmToken = req.body.recieverFcmToken;
        fcm_helper_1.default.sendNofication("booking-offered", recieverFcmToken, {
            bookingId: req.params.id,
        });
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
bookingRouter.post("/:id/decline", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield schema_1.default.findByIdAndUpdate(req.params.id, {
            $set: { status: "DECLINED" },
        });
        if (!booking)
            return res.sendStatus(404);
        res.sendStatus(200);
        const recieverFcmToken = req.body.recieverFcmToken;
        fcm_helper_1.default.sendNofication("booking-declined", recieverFcmToken, {
            bookingId: req.params.id,
        });
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
bookingRouter.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const booking = yield schema_1.default.findById(req.params.id);
        if (!booking)
            return res.sendStatus(404);
        if (userId != booking.id)
            res.sendStatus(403);
        yield schema_1.default.deleteOne({ _id: req.params.id });
        res.sendStatus(204);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
