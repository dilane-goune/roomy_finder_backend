"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true },
    object: {
        type: String,
        required: true,
        enum: [
            "PAY_POST_PROPERTY_AD",
            "UPGRADE_TO_PREMIUM",
            "PAY_PROPERTY_RENT",
            "LANDLORD_WITHDRAW",
        ],
    },
    service: { type: String, required: true, enum: ["STRIPE", "PAYPAL"] },
    action: { type: String, required: true, enum: ["PAYMENT", "PAYOUT"] },
    status: {
        type: String,
        required: true,
        enum: ["completed", "pending", "failed"],
    },
    userId: { type: String, required: true },
    objectId: { type: String, required: true },
    extra: { type: mongoose_1.Schema.Types.Map },
    stripeData: {
        paymentIntentId: { type: String },
        checkoutSessionId: { type: String },
    },
    paypalData: {
        transactionId: { type: String },
    },
}, {
    collection: "Transactions",
    timestamps: true,
});
schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
});
schema.set("toObject", { virtuals: true });
const TransactionModel = (0, mongoose_1.model)("Transaction", schema);
exports.default = TransactionModel;
