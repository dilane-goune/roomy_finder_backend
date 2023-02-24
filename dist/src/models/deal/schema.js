"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    period: {
        type: String,
        required: true,
        enum: ["Monthly", "Weekly", "Daily"],
    },
    adType: { type: String, required: true, enum: ["PROPERTY", "ROOMMATE"] },
    ad: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: function (doc) {
            if (doc.adType == "PROPERTY")
                return "PropertyAd";
            return "RoommateAd";
        },
    },
    client: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    poster: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    isPayed: { type: Boolean, required: true, default: false },
    endDate: { type: Date, required: true },
}, {
    collection: "Deals",
    timestamps: true,
});
schema.index({ email: 1 }, { unique: true });
schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
});
schema.set("toObject", { virtuals: true });
const DealModel = (0, mongoose_1.model)("Deal", schema);
exports.default = DealModel;
