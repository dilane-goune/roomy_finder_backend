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
const express_1 = require("express");
const authentication_1 = __importDefault(require("../../middlewares/authentication"));
const schema_1 = require("../../models/property_ad/schema");
const schema_2 = require("../../models/roommate_ad/schema");
const property_booking_1 = __importDefault(require("./property_booking"));
const roommate_booking_1 = __importDefault(require("./roommate_booking"));
const bookingRouter = (0, express_1.Router)();
exports.default = bookingRouter;
bookingRouter.use("/property-ad", property_booking_1.default);
bookingRouter.use("/roommate-ad", roommate_booking_1.default);
bookingRouter.get("/my-bookings", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const propertyBookings = yield schema_1.PropertyBookingModel.find({
            $or: [{ client: userId }, { poster: userId }],
        }).populate([
            { path: "poster" },
            { path: "client", select: "-password -bankInfo" },
            { path: "ad", populate: "poster" },
        ]);
        const roommateBookings = yield schema_2.RoommateBookingModel.find({
            $or: [{ client: userId }, { poster: userId }],
        }).populate([
            { path: "poster" },
            { path: "client", select: "-password -bankInfo" },
            { path: "ad", populate: "poster" },
        ]);
        res.json({ propertyBookings, roommateBookings });
    }
    catch (error) {
        res.sendStatus(500);
        console.error(error);
    }
}));
