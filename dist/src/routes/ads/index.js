"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_ad_1 = __importDefault(require("./property_ad"));
const roommates_ad_1 = __importDefault(require("./roommates_ad"));
const adsRouter = (0, express_1.Router)();
exports.default = adsRouter;
adsRouter.use("/property-ad", property_ad_1.default);
adsRouter.use("/roommate-ad", roommates_ad_1.default);
