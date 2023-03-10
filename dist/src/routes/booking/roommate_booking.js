"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const schema_1 = __importStar(require("../../models/roommate_ad/schema"));
const schema_2 = __importDefault(require("../../models/user/schema"));
const bookingRouter = (0, express_1.Router)();
exports.default = bookingRouter;
bookingRouter.use(authentication_1.default);
bookingRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = parseInt(req.query.skip) || 0;
    const status = req.query.status;
    const userId = req.userId;
    const filter = {};
    if (status)
        filter.status = status;
    try {
        const data = yield schema_1.RoommateBookingModel.find(Object.assign(Object.assign({}, filter), { $or: [{ client: userId }, { poster: userId }] }))
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
bookingRouter.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const adId = req.body.adId;
        const landlord = yield schema_2.default.findById(req.body.landlordId);
        const client = yield schema_2.default.findById(userId);
        const ad = yield schema_1.default.findById(adId);
        if (!landlord)
            return res.status(400).json({ "code": "landlord-not-found" });
        if (!client)
            return res.status(400).json({ "code": "client-not-found" });
        if (!ad)
            return res.status(400).json({ "code": "ad-not-found" });
        if (landlord.id == userId)
            return res.sendStatus(403);
        const booking = yield schema_1.RoommateBookingModel.create(Object.assign(Object.assign({}, req.body), { client: userId, poster: landlord, ad: adId }));
        res.sendStatus(200);
        const message = `Dear ${landlord.firstName} ${landlord.lastName},` +
            " We are happy to tell you that a the user" +
            `, '${client.firstName} ${client.lastName}'` +
            " have booked your roommate post, " +
            ` '${ad.type} in ${ad.address.country},${ad.address.location}' ` +
            `. Now, you can either accept or decline the booking.`;
        fcm_helper_1.default.sendNofication("new-booking", landlord.fcmToken, {
            bookingId: booking._id.toString(),
            "ad": ad.type,
            message,
        });
        const fiftheenMinutes = 1000 * 60 * 15;
        const reminderInterval = setInterval((booking, landlord, client) => __awaiter(void 0, void 0, void 0, function* () {
            const message = `Reminder : Dear ${landlord.firstName} ${landlord.lastName},` +
                " We are happy to tell you that a " +
                client.type +
                `, '${client.firstName} ${client.lastName}'` +
                " have booked your property, " +
                ` '${ad.type} in ${ad.address.location}'. Now, you can either accept or decline the booking.`;
            fcm_helper_1.default.sendNofication("auto-reply", landlord.fcmToken, {
                bookingId: booking._id.toString(),
                "ad": ad.type,
                message,
            });
        }), fiftheenMinutes, booking, landlord, client);
        setTimeout((booking, landlord, client) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(booking.client.firstName);
            const messageToPoster = `Auto Reject : \nDear ${landlord.firstName} ${landlord.lastName},` +
                " We are have autommatically rejected the booking of  '${ad.type} in ${ad.address.city}'" +
                `, sent by '${client.firstName} ${client.lastName}' due to no reply.`;
            fcm_helper_1.default.sendNofication("auto-reply", landlord.fcmToken, {
                message: messageToPoster,
            });
            const messageToClient = `Auto Reject : Dear ${booking.client.firstName} ${booking.client.lastName},` +
                ` We are soory to tell you that your booking of ${ad.type} in ${ad.address.location}` +
                ` ${booking.poster.firstName} ${booking.poster.lastName}` +
                " have been cancel due to unresponsive Landlord.";
            fcm_helper_1.default.sendNofication("auto-reply", client.fcmToken, {
                message: messageToClient,
            });
            clearInterval(reminderInterval);
            try {
                yield booking.deleteOne();
            }
            catch (e) {
                console.error(e);
            }
        }), fiftheenMinutes + 1000, booking, landlord, client);
        // TODO : Send email
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
bookingRouter.post("/:id/offer", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const booking = yield schema_1.RoommateBookingModel.findOne({
            _id: req.params.id,
            poster: userId,
        }).populate([
            { path: "poster" },
            { path: "client", select: "-password -bankInfo" },
        ]);
        if (!booking)
            return res.sendStatus(404);
        const ad = yield schema_1.default.findById(booking.ad._id);
        if (!ad)
            return res.sendStatus(404);
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            yield booking.updateOne({ $set: { status: "offered" } }, { session });
        }));
        const message = `Dear ${booking.client.firstName} ${booking.client.lastName},` +
            " We are happy to tell you that the ownner," +
            ` ${booking.poster.firstName} ${booking.poster.lastName}` +
            " have accepted your booking of the" +
            ` ${ad.type} in ${ad.address.country} ${ad.address.country}.` +
            ` Now, you can have to pay the renting fee.`;
        fcm_helper_1.default.sendNofication("booking-offered", booking.client.fcmToken, {
            bookingId: req.params.id,
            "ad": ad.type,
            message,
        });
        // TODO : Send email
        // TODO : Save jod to database
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
        (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            const booking = yield schema_1.RoommateBookingModel.findById({
                _id: req.params.id,
                $or: [{ poster: userId }, { client: userId }],
            }).populate([
                { path: "poster" },
                { path: "client", select: "-password -bankInfo" },
                { path: "ad", populate: "poster" },
            ]);
            if (!booking)
                return res.sendStatus(404);
            let message;
            if (booking.poster._id.equals(userId)) {
                message =
                    `Dear ${booking.client.firstName} ${booking.client.lastName},` +
                        " We appoligize that the Lanlord declined your booking of the property" +
                        `${booking.ad.type} in ${booking.ad.address.country}. ` +
                        "Check out simmillar properties for search.";
            }
            else {
                message =
                    `Dear ${booking.poster.firstName} ${booking.poster.lastName},` +
                        " a client just cancelled her booking of your property " +
                        `${booking.ad.type} in ${booking.ad.address.country}.`;
            }
            const recieverFcmToken = req.body.recieverFcmToken;
            booking.deleteOne({ session });
            fcm_helper_1.default.sendNofication(booking.poster._id.equals(userId)
                ? "booking-declined"
                : "booking-cancelled", recieverFcmToken, {
                bookingId: req.params.id,
                message,
            });
            res.sendStatus(200);
        }));
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
