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
const schema_1 = __importStar(require("../../models/property_ad/schema"));
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
        const data = yield schema_1.PropertyBookingModel.find(Object.assign(Object.assign({}, filter), { $or: [{ client: userId }, { poster: userId }] }))
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
        const quantity = parseInt(req.body.quantity + "");
        if (!quantity)
            return res.sendStatus(400);
        const landlord = yield schema_2.default.findById(req.body.landlordId);
        const client = yield schema_2.default.findById(userId);
        const ad = yield schema_1.default.findById(adId);
        if (!landlord)
            return res.status(400).json({ "code": "landlord-not-found" });
        if (!client)
            return res.status(400).json({ "code": "client-not-found" });
        if (!ad)
            return res.status(400).json({ "code": "ad-not-found" });
        if (ad.quantity - ad.quantityTaken < quantity)
            return res.status(400).json({
                code: "quantity-not-enough",
                "possible": ad.quantity - ad.quantityTaken,
            });
        if (landlord.id == userId)
            return res.sendStatus(403);
        const booking = yield schema_1.PropertyBookingModel.create(Object.assign(Object.assign({}, req.body), { client: userId, poster: landlord, ad: adId }));
        res.sendStatus(200);
        const message = `Dear ${landlord.firstName} ${landlord.lastName},` +
            " We are happy to tell you that a " +
            client.type +
            `, '${client.firstName} ${client.lastName}'` +
            " have book your property, " +
            ` '${ad.type} in ${ad.address.city}'. Now, you can either accept or decline the booking.`;
        fcm_helper_1.default.sendNofication("new-booking", landlord.fcmToken, {
            bookingId: booking._id.toString(),
            "ad": ad.type,
            message,
        });
        const fiftheenMinutes = 1000 * 60 * 15;
        const reminderInterval = setInterval((booking, landlord, client) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const bc = yield schema_1.PropertyBookingModel.findById(booking._id, {
                    status: 1,
                });
                if ((bc === null || bc === void 0 ? void 0 : bc.status) == "pending") {
                    const message = `Reminder : Dear ${landlord.firstName} ${landlord.lastName},` +
                        " We are happy to tell you that a " +
                        client.type +
                        `, '${client.firstName} ${client.lastName}'` +
                        " have book your property, " +
                        ` '${ad.type} in ${ad.address.city}'. Now, you can either accept or decline the booking.`;
                    fcm_helper_1.default.sendNofication("auto-reply", landlord.fcmToken, {
                        bookingId: booking._id.toString(),
                        "ad": ad.type,
                        message,
                    });
                }
                else {
                    clearInterval(reminderInterval);
                }
            }
            catch (e) {
                console.error(e);
            }
        }), fiftheenMinutes, booking, landlord, client);
        setTimeout((booking, landlord, client, ad) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const bc = yield schema_1.PropertyBookingModel.findById(booking._id, {
                    status: 1,
                });
                if ((bc === null || bc === void 0 ? void 0 : bc.status) == "pending") {
                    const messageToPoster = `Auto Reject : \nDear ${landlord.firstName} ${landlord.lastName},` +
                        " We are have autommatically rejected the booking of  '${ad.type} in ${ad.address.city}'" +
                        `, sent by '${client.firstName} ${client.lastName}' due to no reply.`;
                    fcm_helper_1.default.sendNofication("auto-reply", landlord.fcmToken, {
                        message: messageToPoster,
                    });
                    const messageToClient = `Auto Reject : Dear ${booking.client.firstName} ${booking.client.lastName},` +
                        ` We are soory to tell you that your booking of ${ad.type} in ${ad.address.city}` +
                        ` ${booking.poster.firstName} ${booking.poster.lastName}` +
                        " have been cancel due to unresponsive Landlord.";
                    fcm_helper_1.default.sendNofication("auto-reply", client.fcmToken, {
                        message: messageToClient,
                    });
                    yield (bc === null || bc === void 0 ? void 0 : bc.deleteOne());
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                clearInterval(reminderInterval);
            }
        }), fiftheenMinutes * 4 - 50, booking, landlord, client, ad);
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
        const booking = yield schema_1.PropertyBookingModel.findOne({
            _id: req.params.id,
            poster: userId,
        }).populate([{ path: "poster" }, { path: "client" }]);
        if (!booking)
            return res.sendStatus(404);
        const ad = yield schema_1.default.findById(booking.ad._id);
        const client = yield schema_2.default.findById(booking.client._id);
        if (!ad)
            return res.sendStatus(404);
        if (ad.quantity == ad.quantityTaken) {
            return res.status(400).json({ code: "unavailable" });
        }
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            yield booking.updateOne({ $set: { status: "offered" } }, { session });
            yield ad.updateOne({ $inc: { quantityTaken: booking.quantity } }, { session });
        }));
        const message = `Dear ${booking.client.firstName} ${booking.client.lastName},` +
            " We are happy to tell you that the landlord," +
            ` ${booking.poster.firstName} ${booking.poster.lastName}` +
            " have accepted your booking of the" +
            ` ${ad.type} in ${ad.address.city}. Now, you can have to pay the renting fee.`;
        const fcmResponse = yield fcm_helper_1.default.sendNofication("booking-offered", (client === null || client === void 0 ? void 0 : client.fcmToken) || booking.client.fcmToken, {
            message,
        });
        console.log(fcmResponse);
        console.log(client);
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
        console.log(req.params.id);
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            const booking = yield schema_1.PropertyBookingModel.findById({
                _id: req.params.id,
            }).populate([
                { path: "poster" },
                { path: "client", select: "-password -bankInfo" },
                { path: "ad", populate: "poster" },
            ]);
            if (!booking)
                return res.sendStatus(404);
            if (booking.poster.id != userId && booking.client.id != userId)
                return res.sendStatus(403);
            if (booking.status == "offered")
                return res.status(400).json({ code: "offered" });
            let message;
            if (booking.poster._id.equals(userId)) {
                message =
                    `Dear ${booking.client.firstName} ${booking.client.lastName},` +
                        " We appoligize that the Lanlord declined your booking of the property" +
                        `${booking.ad.type} in ${booking.ad.address.city}. ` +
                        "Check out simmillar properties for search.";
            }
            else {
                message =
                    `Dear ${booking.poster.firstName} ${booking.poster.lastName},` +
                        " a client just cancelled her booking of your property " +
                        `${booking.ad.type} in ${booking.ad.address.city}.`;
            }
            yield schema_1.default.updateOne({ _id: booking.ad._id }, { $inc: { quantityTaken: booking.quantity } }, { session });
            booking.deleteOne({ session });
            fcm_helper_1.default.sendNofication(booking.poster._id.equals(userId)
                ? "booking-declined"
                : "booking-cancelled", booking.poster._id.equals(userId)
                ? booking.client.fcmToken
                : booking.poster.fcmToken, {
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
