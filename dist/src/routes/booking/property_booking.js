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
const stripe_1 = __importDefault(require("stripe"));
const constants_1 = require("../../data/constants");
const dayjs_1 = __importDefault(require("dayjs"));
const localizedFormat_1 = __importDefault(require("dayjs/plugin/localizedFormat"));
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const generate_token_1 = require("../../functions/generate_token");
dayjs_1.default.extend(localizedFormat_1.default);
const stripe = new stripe_1.default(constants_1.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const successUrl = `${constants_1.SERVER_URL}/rent-payemt/success`;
const cancelUrl = `${constants_1.SERVER_URL}/rent-payemt/cancel`;
const axios = axios_1.default.create({
    baseURL: constants_1.PAYPAL_API_URL,
    headers: {
        "Content-Type": "application/json",
        "PayPal-Request-Id": "339987fb-ff64-435e-9def-6a728d33a865",
        "Authorization": `Bearer ${process.env.PAYPAL_TOKEN}`,
    },
});
axios.interceptors.response.use((res) => res, (error) => __awaiter(void 0, void 0, void 0, function* () {
    const originalConfig = error.config;
    if (!originalConfig)
        return Promise.reject(error);
    if (error.response) {
        if (error.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;
            const token = yield (0, generate_token_1.generatePaypalToken)();
            if (!token)
                return Promise.reject(error);
            return axios(Object.assign(Object.assign({}, originalConfig), { headers: Object.assign(Object.assign({}, originalConfig.headers), { "Authorization": "Bearer " + token }) }));
        }
    }
    return Promise.reject(error);
}));
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
        const ad = yield schema_1.default.findById(adId);
        if (!ad)
            return res.status(400).json({ "code": "ad-not-found" });
        const pendingBooking = yield schema_1.PropertyBookingModel.findOne({
            poster: ad.poster._id,
            client: userId,
            ad: adId,
            status: "pending",
        });
        if (pendingBooking)
            return res.status(409).json({ "code": "have-pending-booking" });
        const landlord = yield schema_2.default.findById(ad.poster._id);
        const client = yield schema_2.default.findById(userId);
        if (!landlord)
            return res.status(400).json({ "code": "landlord-not-found" });
        if (!client)
            return res.status(400).json({ "code": "client-not-found" });
        if (ad.quantity - ad.quantityTaken < quantity)
            return res.status(400).json({
                code: "quantity-not-enough",
                "possible": ad.quantity - ad.quantityTaken,
            });
        if (landlord.id == userId)
            return res.sendStatus(403);
        const booking = yield schema_1.PropertyBookingModel.create(Object.assign(Object.assign({}, req.body), { client: userId, poster: landlord, ad: adId }));
        res.json({ bookingId: booking.id });
        const message = `Congratulations. You got booked for ${ad.type} ${booking.rentType}.\n` +
            `Check in : ${(0, dayjs_1.default)(booking.checkIn).format("LL")}\n` +
            `Check out : ${(0, dayjs_1.default)(booking.checkOut).format("LL")}`;
        fcm_helper_1.default.sendNofication("new-booking", landlord.fcmToken, {
            "bookingId": booking.id.toString(),
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
                    const messageToClient = `Auto Reject : Dear ${client.firstName} ${client.lastName},` +
                        ` We are soory to tell you that your booking of ${ad.type} in ${ad.address.city}` +
                        ` ${landlord.firstName} ${landlord.lastName}` +
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
        if (booking.status == "offered")
            return res.sendStatus(409);
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
        res.sendStatus(200);
        const clientMessage = `Congratulations. Your rent request to ${ad.type} in ${ad.address.city} has been approved. ` +
            "Please pay the rent fee amount to get futher with the landlord " +
            "contact information details and check in your new place now !";
        fcm_helper_1.default.sendNofication("booking-offered", (client === null || client === void 0 ? void 0 : client.fcmToken) || booking.client.fcmToken, {
            message: clientMessage,
            "bookingId": booking.id.toString(),
        });
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
bookingRouter.post("/lanlord/cancel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            const booking = yield schema_1.PropertyBookingModel.findById({
                _id: req.body.bookingId,
            }).populate([
                { path: "poster" },
                { path: "client", select: "-password -bankInfo" },
                { path: "ad", populate: "poster" },
            ]);
            if (!booking)
                return res.sendStatus(404);
            if (booking.poster.id != userId)
                return res.sendStatus(403);
            if (booking.status != "pending")
                return res.status(400).json({ code: "booking-accepted" });
            yield booking.deleteOne({ session });
            const message = `Dear ${booking.client.firstName} ${booking.client.lastName},` +
                " sorry the property you choose is not more available. Please choose another option";
            fcm_helper_1.default.sendNofication("booking-declined", booking.client.fcmToken, {
                bookingId: booking.id,
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
bookingRouter.post("/tenant/cancel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            const booking = yield schema_1.PropertyBookingModel.findById({
                _id: req.body.bookingId,
            }).populate([
                { path: "poster" },
                { path: "client", select: "-password -bankInfo" },
                { path: "ad", populate: "poster" },
            ]);
            if (!booking)
                return res.sendStatus(404);
            if (booking.client.id != userId)
                return res.sendStatus(403);
            if (booking.status != "pending")
                return res.status(400).json({ code: "booking-accepted" });
            yield booking.deleteOne({ session });
            const message = `Dear ${booking.poster.firstName} ${booking.poster.lastName},` +
                " a client just cancelled her booking of your property " +
                `${booking.ad.type} in ${booking.ad.address.city}.`;
            fcm_helper_1.default.sendNofication("booking-cancelled", booking.poster.fcmToken, {
                bookingId: booking.id + "",
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
bookingRouter.post("/stripe/create-pay-booking-checkout-session", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const booking = yield schema_1.PropertyBookingModel.findOne({
            _id: req.body.bookingId,
            client: userId,
        }).populate([{ path: "poster" }, { path: "client" }, { path: "ad" }]);
        if (!booking)
            return res.status(404).json({ code: "booking-not-found" });
        if (booking.isPayed)
            return res.sendStatus(409);
        let rentFee;
        let commissionFee;
        // The difference in milliseconds between the checkout and the checkin date
        const checkOutCheckInMillisecondsDifference = booking.checkOut.getTime() - booking.checkIn.getTime();
        // The number of periods(days,weeks,monyhs) the rent will last
        let rentTypePeriod;
        switch (booking.rentType) {
            case "Monthly":
                const oneMothDuration = 1000 * 3600 * 24 * 30;
                rentTypePeriod = Math.ceil(checkOutCheckInMillisecondsDifference / oneMothDuration);
                break;
            case "Weekly":
                const oneWeekDuration = 1000 * 3600 * 24 * 7;
                rentTypePeriod = Math.ceil(checkOutCheckInMillisecondsDifference / oneWeekDuration);
                break;
            default:
                const oneDayDuration = 1000 * 3600 * 24;
                rentTypePeriod = Math.ceil(checkOutCheckInMillisecondsDifference / oneDayDuration);
                break;
        }
        // Calculating the rent fee  and commission bases on the rent type and duration
        switch (booking.rentType) {
            case "Monthly":
                rentFee = booking.ad.monthlyPrice * booking.quantity * rentTypePeriod;
                commissionFee = rentFee * 0.1;
                break;
            case "Weekly":
                rentFee = booking.ad.weeklyPrice * booking.quantity * rentTypePeriod;
                commissionFee = rentFee * 0.1;
                break;
            default:
                rentFee = booking.ad.dailyPrice * booking.quantity * rentTypePeriod;
                commissionFee = rentFee * 0.05;
                break;
        }
        // TAV
        const tavFee = commissionFee * 0.05;
        const servicFee = (rentFee + commissionFee + tavFee) * 0.03;
        const session = yield stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: "aed",
                        product_data: {
                            name: "Property rent fee",
                            description: `Rent fee for  ${booking.quantity} ${booking.ad.type}` +
                                ` at  ${booking.ad.address.location}.`,
                        },
                        //multiple by 100 to remove since stripe consider it in cent
                        unit_amount: Math.ceil(rentFee + commissionFee + tavFee + servicFee) * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: successUrl + "?bookingId=" + booking.id,
            cancel_url: cancelUrl + "?bookingId=" + booking.id,
            metadata: {
                object: "PAY_PROPERTY_RENT",
                bookingId: booking.id,
                userId,
            },
            customer_email: booking.client.email,
        });
        // res.redirect(303, session.url);
        res.json({ paymentUrl: session.url });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
bookingRouter.post("/paypal/create-payment-link", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const booking = yield schema_1.PropertyBookingModel.findOne({
            _id: req.body.bookingId,
            client: userId,
        }).populate([{ path: "poster" }, { path: "client" }, { path: "ad" }]);
        if (!booking)
            return res.status(404).json({ code: "booking-not-found" });
        if (booking.isPayed)
            return res.sendStatus(409);
        let rentFee;
        let commissionFee;
        // The difference in milliseconds between the checkout and the checkin date
        const checkOutCheckInMillisecondsDifference = booking.checkOut.getTime() - booking.checkIn.getTime();
        // The number of periods(days,weeks,monyhs) the rent will last
        let rentTypePeriod;
        switch (booking.rentType) {
            case "Monthly":
                const oneMothDuration = 1000 * 3600 * 24 * 30;
                rentTypePeriod = Math.ceil(checkOutCheckInMillisecondsDifference / oneMothDuration);
                break;
            case "Weekly":
                const oneWeekDuration = 1000 * 3600 * 24 * 7;
                rentTypePeriod = Math.ceil(checkOutCheckInMillisecondsDifference / oneWeekDuration);
                break;
            default:
                const oneDayDuration = 1000 * 3600 * 24;
                rentTypePeriod = Math.ceil(checkOutCheckInMillisecondsDifference / oneDayDuration);
                break;
        }
        // Calculating the rent fee  and commission bases on the rent type and duration
        switch (booking.rentType) {
            case "Monthly":
                rentFee = booking.ad.monthlyPrice * booking.quantity * rentTypePeriod;
                commissionFee = rentFee * 0.1;
                break;
            case "Weekly":
                rentFee = booking.ad.weeklyPrice * booking.quantity * rentTypePeriod;
                commissionFee = rentFee * 0.1;
                break;
            default:
                rentFee = booking.ad.dailyPrice * booking.quantity * rentTypePeriod;
                commissionFee = rentFee * 0.05;
                break;
        }
        // TAV
        const tavFee = commissionFee * 0.05;
        const servicFee = (rentFee + commissionFee + tavFee) * 0.03;
        //TODO : Remove *0.27 in production and change currency to AED
        const amount = Math.ceil((rentFee + commissionFee + tavFee + servicFee) * 0.27);
        const currency = "USD";
        const paymentData = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "items": [
                        {
                            "name": "Roomy Finder Rent feee payment",
                            "description": `Rent fee for  ${booking.quantity} ${booking.ad.type}` +
                                ` at  ${booking.ad.address.location}.`,
                            "quantity": "1",
                            "unit_amount": {
                                "currency_code": currency,
                                "value": "" + amount,
                            },
                        },
                    ],
                    "amount": {
                        "currency_code": currency,
                        "value": "" + amount,
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency,
                                "value": "" + amount,
                            },
                        },
                    },
                },
            ],
            // TODO : Add the return and cancel urls
            "application_context": {
                "return_url": successUrl + "?bookingId=" + booking.id,
                "cancel_url": cancelUrl + "?bookingId=" + booking.id,
            },
        };
        const response = yield axios.post("/v2/checkout/orders", paymentData, {
            headers: {
                "Prefer": "return=minimal",
                "PayPal-Request-Id": (0, crypto_1.randomUUID)(),
                "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
            },
        });
        if (response.status != 201)
            return res.sendStatus(406);
        const data = response.data;
        const links = data.links;
        // res.redirect(303, session.url);
        res.json({ paymentUrl: links[1].href });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
bookingRouter.post("/pay-cash", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const booking = yield schema_1.PropertyBookingModel.findOne({
            _id: req.body.bookingId,
            client: userId,
        });
        if (!booking)
            return res.status(404).json({ code: "booking-not-found" });
        if (booking.isPayed)
            return res.sendStatus(409);
        yield booking.updateOne({ $set: { isPayed: true } });
        return res.sendStatus(200);
    }
    catch (error) {
        console.log(error);
        return res.sendStatus(500);
    }
}));
