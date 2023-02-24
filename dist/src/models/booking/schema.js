"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    adType: { type: String, required: true, enum: ["PROPERTY", "ROOMMATE"] },
    poster: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    client: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    ad: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: function (doc) {
            if (doc.type == "PROPERTY")
                return "PropertyAd";
            return "RoommateAd";
        },
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
}, {
    collection: "Bookings",
    timestamps: true,
});
schema.index({ landlord: 1 });
schema.index({ client: 1 });
schema.index({ ad: 1 });
schema.index({ createdAt: 1 });
schema.set("toJSON", { virtuals: true, versionKey: false });
schema.set("toObject", { virtuals: true });
const BookingModel = (0, mongoose_1.model)("Booking", schema);
exports.default = BookingModel;
