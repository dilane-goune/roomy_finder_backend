"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoommateBookingModel = void 0;
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    poster: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    type: {
        type: String,
        required: true,
        enum: ["Studio", "Appartment", "House"],
    },
    rentType: {
        type: String,
        required: true,
        enum: ["Monthly", "Weekly", "Daily"],
    },
    isPremium: { type: Boolean, default: false },
    budget: { type: Number, required: true },
    description: { type: String, required: true },
    images: [String],
    videos: [String],
    isAvailable: { type: Boolean, default: true },
    address: {
        country: { type: String, required: true },
        // city: { type: String, required: true },
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
const bookingSchema = new mongoose_1.Schema({
    poster: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    client: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    ad: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "RoommateAd" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, default: "pending" },
    isPayed: { type: Boolean, default: false },
    lastPaymentDate: { type: Date },
    lastTransactionId: { type: String },
}, {
    collection: "Bookings",
    timestamps: true,
});
bookingSchema.index({ landlord: 1 });
bookingSchema.index({ client: 1 });
bookingSchema.index({ ad: 1 });
bookingSchema.index({ createdAt: 1 });
bookingSchema.set("toJSON", { virtuals: true, versionKey: false });
bookingSchema.set("toObject", { virtuals: true });
exports.RoommateBookingModel = (0, mongoose_1.model)("RoommateBooking", bookingSchema);
