"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    poster: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    type: {
        type: String,
        required: true,
        enum: ["Studio", "Appartment", "House"],
    },
    isPremium: { type: Boolean, default: false },
    budget: { type: Number, required: true },
    description: { type: String, required: true },
    images: [String],
    videos: [String],
    isAvailable: { type: Boolean, default: true },
    address: {
        country: { type: String, required: true },
        city: { type: String, required: true },
        location: { type: String, required: true },
        buildingName: { type: String },
    },
    aboutYou: {
        astrologicalSign: { type: String, required: true },
        age: { type: Number, required: true },
        occupation: {
            type: String,
            required: true,
            enum: ["Student", "Professional", "Other"],
        },
        languages: [String],
        interests: [String],
    },
    socialPreferences: {
        numberOfPeople: { type: String, required: true },
        grouping: { type: String, required: true, enum: ["Single", "Couple"] },
        gender: { type: String, required: true, enum: ["Male", "Female", "Mix"] },
        nationality: { type: String, required: true },
        smoking: { type: Boolean, required: true },
        cooking: { type: Boolean, required: true },
        drinking: { type: Boolean, required: true },
        swimming: { type: Boolean, required: true },
        friendParty: { type: Boolean, required: true },
        gym: { type: Boolean, required: true },
        wifi: { type: Boolean, required: true },
        tv: { type: Boolean, required: true },
    },
}, {
    collection: "RoommateAds",
    timestamps: true,
});
schema.index({ poster: 1 });
schema.index({ createdAt: 1 });
schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
});
schema.set("toObject", { virtuals: true });
const RoommateAdModel = (0, mongoose_1.model)("RoommateAd", schema);
exports.default = RoommateAdModel;
