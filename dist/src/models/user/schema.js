"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    type: {
        type: String,
        required: true,
        enum: ["landlord", "tenant", "roommate", "freelancer"],
    },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    country: { type: String, required: true },
    gender: { type: String, required: true, default: "Male" },
    profilePicture: { type: String },
    fcmToken: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false },
    failedToLoginCount: { type: Number, default: 0 },
    accountBalance: { type: Number, default: 0 },
    stripeConnectId: { type: String },
}, {
    collection: "Users",
    timestamps: true,
});
schema.index({ email: 1 }, { unique: true });
schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
});
schema.set("toObject", { virtuals: true });
const UserModel = (0, mongoose_1.model)("User", schema);
exports.default = UserModel;
