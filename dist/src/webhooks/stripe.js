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
const stripe_1 = __importDefault(require("stripe"));
const fcm_helper_1 = __importDefault(require("../classes/fcm_helper"));
const constants_1 = require("../data/constants");
const run_in_transaction_1 = __importDefault(require("../functions/run_in_transaction"));
const schema_1 = __importStar(require("../models/property_ad/schema"));
const schema_2 = __importDefault(require("../models/user/schema"));
const stripe = new stripe_1.default(constants_1.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const stripeWebHookHandler = (0, express_1.Router)();
exports.default = stripeWebHookHandler;
const createOrder = (session) => {
    // TODO: fill me in
    console.log("Creating order...");
};
const emailCustomerAboutFailedPayment = (session) => {
    // TODO: fill me in
    console.log("Emailing customer...");
};
stripeWebHookHandler.post("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = request.body;
        const sig = request.headers["stripe-signature"];
        let event;
        try {
            event = stripe.webhooks.constructEvent(payload, sig, constants_1.STRIPE_WEBHOOK_SIGNING_SECRET);
        }
        catch (err) {
            console.log(err);
            return response.status(400).send(`Webhook Error: ${err === null || err === void 0 ? void 0 : err.message}`);
        }
        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
                const session = event.data.object;
                // Save an order in your database, marked as 'awaiting payment'
                createOrder(session);
                // Check if the order is paid (for example, from a card payment)
                //
                // A delayed notification payment will have an `unpaid` status, as
                // you're still waiting for funds to be transferred from the customer's
                // account.
                if (session.payment_status === "paid") {
                    switch (session.metadata.object) {
                        case "PAY_PROPERTY_RENT":
                            const resp = yield handleStripeRentPaySucceded(session);
                            return response.status(resp).end();
                        default:
                            break;
                    }
                }
                break;
            }
            case "checkout.session.async_payment_failed": {
                const session = event.data.object;
                // Send an email to the customer asking them to retry their order
                emailCustomerAboutFailedPayment(session);
                break;
            }
        }
        response.status(200).end();
    }
    catch (error) {
        console.log(error);
        response.status(500).end();
    }
}));
function handleStripeRentPaySucceded(stripeEvent) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, run_in_transaction_1.default)((session) => __awaiter(this, void 0, void 0, function* () {
                const booking = yield schema_1.PropertyBookingModel.findByIdAndUpdate(stripeEvent.metadata.bookingId, {
                    $set: {
                        isPayed: true,
                        paymentService: "STRIPE",
                        extra: { checkOutId: stripeEvent.id },
                    },
                }, { session, new: true });
                if (!booking)
                    return 400;
                const ad = yield schema_1.default.findById(booking.ad._id);
                const client = yield schema_2.default.findById(booking.client._id);
                const poster = yield schema_2.default.findById(booking.poster._id);
                const clientMessage = `Dear ${client === null || client === void 0 ? void 0 : client.firstName} ${client === null || client === void 0 ? void 0 : client.lastName},` +
                    " your payment for the renting of " +
                    ` ${ad === null || ad === void 0 ? void 0 : ad.type} located ${ad === null || ad === void 0 ? void 0 : ad.address.city} has commpleted successfully.` +
                    ` You can now see the landlord information and chat with ${(poster === null || poster === void 0 ? void 0 : poster.gender) == "Male" ? "him" : "her"}.`;
                fcm_helper_1.default.sendNofication("pay-property-rent-fee-completed-client", (client === null || client === void 0 ? void 0 : client.fcmToken) || booking.client.fcmToken, {
                    message: clientMessage,
                    bookingId: booking.id + "",
                });
                const landlordMessage = `Dear ${poster === null || poster === void 0 ? void 0 : poster.firstName} ${poster === null || poster === void 0 ? void 0 : poster.lastName},` +
                    " we are happy to tell you that a tenant have completed the payment of your property, " +
                    ` ${ad === null || ad === void 0 ? void 0 : ad.type} located ${ad === null || ad === void 0 ? void 0 : ad.address.city}.` +
                    ` You can now see the tenant information and chat with ${(client === null || client === void 0 ? void 0 : client.gender) == "Male" ? "him" : "her"}.`;
                fcm_helper_1.default.sendNofication("pay-property-rent-fee-completed-landlord", (poster === null || poster === void 0 ? void 0 : poster.fcmToken) || booking.poster.fcmToken, {
                    message: landlordMessage,
                    bookingId: booking.id + "",
                });
            }));
            return 200;
        }
        catch (error) {
            console.log(error);
            return 500;
        }
    });
}
