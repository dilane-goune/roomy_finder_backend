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
const schema_1 = __importDefault(require("../../models/booking/schema"));
const schema_2 = __importDefault(require("../../models/deal/schema"));
const schema_3 = __importDefault(require("../../models/property_ad/schema"));
const schema_4 = __importDefault(require("../../models/roommate_ad/schema"));
const bookingRouter = (0, express_1.Router)();
exports.default = bookingRouter;
bookingRouter.use(authentication_1.default);
bookingRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const landlord = req.body.landlordId;
        const ad = req.body.adId;
        const recieverFcmToken = req.body.recieverFcmToken;
        const adType = req.body.adType;
        if (landlord == userId) {
            return res.sendStatus(403);
        }
        const readAd = adType == "PROPERTY"
            ? yield schema_3.default.findById(ad, {})
            : yield schema_4.default.findById(ad, {});
        if (!readAd) {
            return res.sendStatus(404);
        }
        const oldBooking = yield schema_1.default.findOne({
            client: userId,
            poster: landlord,
            ad,
        });
        if (oldBooking) {
            return res.sendStatus(409);
        }
        const booking = yield schema_1.default.create(Object.assign(Object.assign({}, req.body), { client: userId, poster: landlord, ad,
            adType }));
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
    const userId = req.userId;
    const filter = {};
    if (status)
        filter.status = status;
    try {
        const data = yield schema_1.default.find(Object.assign(Object.assign({}, filter), { $or: [{ client: userId }, { poster: userId }] }))
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
bookingRouter.post("/:id/offer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const booking = yield schema_1.default.findOne({
            _id: req.params.id,
            poster: userId,
        }).populate([
            { path: "poster" },
            { path: "client", select: "-password -bankInfo" },
            { path: "ad" },
        ]);
        if (!booking)
            return res.sendStatus(404);
        const ad = booking.ad;
        if (booking.adType == "PROPERTY") {
            if (ad.quantity == ad.quantityTaken) {
                return res.sendStatus(400);
            }
        }
        const now = new Date();
        switch (ad.rentType) {
            case "Monthly":
                now.setMonth(now.getMonth() + 1);
                break;
            case "Weekly":
                now.setDate(now.getDate() + 7);
                break;
            case "Daily":
                now.setDate(now.getDate() + 1);
                break;
        }
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            yield schema_2.default.create([
                {
                    adType: booking.adType,
                    client: booking.client,
                    poster: booking.poster,
                    ad: booking.ad,
                    period: ad.rentType,
                    endDate: now,
                },
            ], { session });
            yield schema_1.default.deleteOne({ _id: booking._id }, { session });
            if (booking.adType == "PROPERTY") {
                yield schema_3.default.updateOne({ _id: booking.ad }, { $inc: { quantityTaken: 1 } }, { session });
            }
        }));
        fcm_helper_1.default.sendNofication("booking-offered", booking.client.fcmToken, {
            bookingId: req.params.id,
            "ad": ad.type,
        });
        res.sendStatus(200);
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
bookingRouter.post("/:id/cancel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const booking = yield schema_1.default.findByIdAndRemove({
            _id: req.params.id,
            $or: [{ poster: userId }, { client: userId }],
        });
        if (!booking)
            return res.sendStatus(404);
        let message;
        if (booking.poster._id.equals(userId)) {
            message =
                "The ownner of a booking to which you recently subscribe declined the booking";
        }
        else {
            message = "A client cancelled a booking from your ad post";
        }
        res.sendStatus(200);
        const recieverFcmToken = req.body.recieverFcmToken;
        fcm_helper_1.default.sendNofication("booking-declined", recieverFcmToken, {
            bookingId: req.params.id,
            message,
        });
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
