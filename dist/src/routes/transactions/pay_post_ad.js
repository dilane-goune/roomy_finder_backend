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
const schema_1 = __importDefault(require("../../models/user/schema"));
const stripe_1 = __importDefault(require("stripe"));
const constants_1 = require("../../data/constants");
const STRIPE_POST_PROPERTY_AD_PRICE_ID = "prod_NTww1qvf7zA2eI";
const stripe = new stripe_1.default(constants_1.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const payPostPropertyAdRouter = (0, express_1.Router)();
payPostPropertyAdRouter.use(authentication_1.default);
exports.default = payPostPropertyAdRouter;
payPostPropertyAdRouter.post("pay-post-property-ad", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = schema_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ code: "user-not-found" });
        const session = yield stripe.checkout.sessions.create({
            line_items: [
                {
                    // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                    price: STRIPE_POST_PROPERTY_AD_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `example.com/success.html`,
            cancel_url: `example.com/cancel.html`,
        });
        res.json({ paymentURL: session.url + "" });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
