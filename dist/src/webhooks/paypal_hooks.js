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
const schema_1 = __importDefault(require("../models/transaction/schema"));
const schema_2 = __importDefault(require("../models/user/schema"));
const run_in_transaction_1 = __importDefault(require("../functions/run_in_transaction"));
const axios_1 = __importDefault(require("axios"));
const fcm_helper_1 = __importDefault(require("../classes/fcm_helper"));
const emails_1 = __importDefault(require("../functions/emails"));
function paypalHooksHandler(req, res) {
    const data = req.body;
    const event = data.event_type;
    switch (event) {
        case "PAYMENT.PAYOUTSBATCH.DENIED":
            handlePaypalPayoutFailed(req, res);
            break;
        case "PAYMENT.PAYOUTS-ITEM.BLOCKED":
        case "PAYMENT.PAYOUTS-ITEM.CANCELED":
        case "PAYMENT.PAYOUTS-ITEM.DENIED":
        case "PAYMENT.PAYOUTS-ITEM.FAILED":
        case "PAYMENT.PAYOUTS-ITEM.UNCLAIMED":
            handlePaypalPayoutItemFailed(req, res);
            break;
        case "PAYMENT.PAYOUTS-ITEM.SUCCEEDED": {
            handlePaypalPayoutItemSucceeded(req, res);
            break;
        }
        case "CHECKOUT.ORDER.APPROVED":
            handlePaypalOrderApproved(req, res);
            break;
        case "PAYMENT.AUTHORIZATION.VOIDED":
            handlePaypalOrderVoided(req, res);
            break;
        default:
            res.sendStatus(200);
    }
}
exports.default = paypalHooksHandler;
const handlePaypalPayoutItemSucceeded = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            const resource = req.body.resource;
            const transc = yield schema_1.default.findOne({
                transactionId: resource.payout_batch_id,
                service: "PAYPAL",
            });
            if (!transc)
                return res.sendStatus(200);
            if (transc.status == "completed")
                return res.status(200);
            const user = yield schema_2.default.findById(transc.userId);
            if (!user)
                return res.sendStatus(200);
            const fee = resource.payout_item_fee;
            yield transc.updateOne({
                $set: { fee: fee.value, originalFee: fee.value, status: "completed" },
            }, { session });
            const netAmount = parseInt(resource.payout_item.amount.value) +
                parseInt(resource.payout_item_fee.value);
            yield schema_2.default.findByIdAndUpdate(transc.userId, { $inc: { accountBalance: -netAmount } }, { session });
            res.sendStatus(200);
            const message = `Your payout of ${transc.currency} ${transc.amount} have completed`;
            yield fcm_helper_1.default.sendNofication("pay-out-completed", user.fcmToken, {
                message,
            });
            (0, emails_1.default)({
                recieverEmail: user.email,
                message,
                subject: "Roomy Finder Payment",
            });
        }));
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
const handlePaypalPayoutFailed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = req.body.resource;
        const transactionId = resource.batch_header.payout_batch_id;
        const transc = yield schema_1.default.findOne({
            transactionId,
            service: "PAYPAL",
        });
        if (!transc)
            return res.sendStatus(200);
        if (transc.status == "completed")
            return res.status(200);
        const user = yield schema_2.default.findById(transc.userId);
        if (!user)
            return res.sendStatus(200);
        yield transc.updateOne({ $set: { status: "failed" } });
        res.sendStatus(200);
        // send notification
        const message = `Your payout of ${transc.currency} ${transc.amount} have failed`;
        yield fcm_helper_1.default.sendNofication("pay-out-failed", user.fcmToken, {
            message,
        });
        (0, emails_1.default)({
            recieverEmail: user.email,
            message,
            subject: "Roomy Finder Payment",
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
const handlePaypalPayoutItemFailed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = req.body.resource;
        const transactionId = resource.payout_batch_id;
        const transc = yield schema_1.default.findOne({
            transactionId,
            service: "PAYPAL",
        });
        if (!transc)
            return res.sendStatus(200);
        if (transc.status == "completed")
            return res.status(200);
        const user = yield schema_2.default.findById(transc.userId);
        if (!user)
            return res.sendStatus(200);
        yield transc.updateOne({ $set: { status: "failed" } });
        res.sendStatus(200);
        // send notification
        const message = `Your rent payment of ${transc.currency} ${transc.amount} have failed`;
        yield fcm_helper_1.default.sendNofication("pay-property-rent-fee-failed-client", user.fcmToken, { message });
        (0, emails_1.default)({
            recieverEmail: user.email,
            message,
            subject: "Roomy Finder Payment",
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
const handlePaypalOrderApproved = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { resource } = req.body;
        yield (0, run_in_transaction_1.default)((session) => __awaiter(void 0, void 0, void 0, function* () {
            const transactionId = resource.id;
            const transc = yield schema_1.default.findOne({
                transactionId,
                service: "PAYPAL",
            }).session(session);
            if (!transc)
                return res.sendStatus(404);
            if (transc.status == "completed")
                return res.status(200);
            const user = yield schema_2.default.findById(transc.userId);
            if (!user)
                return res.sendStatus(404);
            const captureLink = transc.extra.captureLink;
            const response = yield (0, axios_1.default)({
                headers: {
                    "Prefer": "return=representation",
                    "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
                    "Content-Type": "application/JSON",
                },
                url: captureLink,
                method: "post",
            });
            const capturedData = response.data;
            const lastCapture = capturedData.purchase_units[0].payments.captures[0];
            if (capturedData.status == "COMPLETED" &&
                lastCapture.final_capture == true) {
                yield transc.updateOne({
                    $set: {
                        status: "completed",
                        fee: lastCapture.seller_receivable_breakdown.paypal_fee.value,
                        originalFee: lastCapture.seller_receivable_breakdown.paypal_fee.value,
                        currency: lastCapture.amount.currency_code,
                    },
                }, { session });
                res.sendStatus(200);
                // send notification
                const message = `Your rent payment of ${transc.currency} ${transc.amount} have completed`;
                yield fcm_helper_1.default.sendNofication("pay-property-rent-fee-failed-client", user.fcmToken, { message });
                (0, emails_1.default)({
                    recieverEmail: user.email,
                    message,
                    subject: "Roomy Finder Payment",
                });
            }
        }));
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
const handlePaypalOrderVoided = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = req.body.resource;
        const transc = yield schema_1.default.findOne({
            transactionId: resource.id,
            service: "PAYPAL",
        });
        if (!transc)
            return res.sendStatus(200);
        if (transc.status == "completed")
            return res.status(200);
        const user = yield schema_2.default.findById(transc.userId);
        if (!user)
            return res.sendStatus(200);
        yield transc.updateOne({ $set: { status: "failed" } });
        res.sendStatus(200);
        // send notification
        const message = `Your rent payment of ${transc.currency} ${transc.amount} have failed`;
        yield fcm_helper_1.default.sendNofication("pay-property-rent-fee-failed-client", user.fcmToken, { message });
        (0, emails_1.default)({
            recieverEmail: user.email,
            message,
            subject: "Roomy Finder Payment",
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});
