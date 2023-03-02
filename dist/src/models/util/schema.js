"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedBackModel = exports.AppVersionModel = void 0;
const mongoose_1 = require("mongoose");
const appVersionSchema = new mongoose_1.Schema({
    version: { type: String, required: true },
    url: { type: String, required: true },
    platform: { type: String, required: true, enum: ["ANDROID", "IOS"] },
    releaseType: { type: String, required: true, enum: ["ALPHA", "BETA"] },
    releaseDate: { type: Date, required: true },
}, {
    collection: "AppVersions",
    timestamps: true,
});
const feedBackSchema = new mongoose_1.Schema({
    message: { type: String, required: true },
    userName: { type: String, required: true },
}, {
    collection: "FeedBacks",
    timestamps: true,
});
exports.AppVersionModel = (0, mongoose_1.model)("AppVersion", appVersionSchema);
exports.FeedBackModel = (0, mongoose_1.model)("FeedBack", feedBackSchema);
