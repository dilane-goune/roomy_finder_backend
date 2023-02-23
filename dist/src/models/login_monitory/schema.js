"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const schema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    succeeded: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    collection: "LoginMonitorys",
});
const LoginMonitoryModel = (0, mongoose_1.model)("LoginMonitory", schema);
exports.default = LoginMonitoryModel;
