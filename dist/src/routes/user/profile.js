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
const bcrypt_1 = __importDefault(require("bcrypt"));
const constants_1 = require("../../data/constants");
const axios_1 = __importDefault(require("axios"));
const crypto_1 = require("crypto");
const generate_token_1 = require("../../functions/generate_token");
const stripe_1 = __importDefault(require("stripe"));
const constants_2 = require("../../data/constants");
const stripe = new stripe_1.default(constants_2.STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });
const successUrl = `${constants_1.SERVER_URL}/rent-payemt/success`;
const cancelUrl = `${constants_1.SERVER_URL}/rent-payemt/cancel`;
const axios = axios_1.default.create({
    baseURL: constants_1.PAYPAL_API_URL,
    headers: {
        "Content-Type": "application/json",
        "PayPal-Request-Id": "339987fb-ff64-435e-9def-6a728d33a865",
        "Authorization": `Bearer ${process.env.PAYPAL_TOKEN}`,
    },
});
axios.interceptors.response.use((res) => res, (error) => __awaiter(void 0, void 0, void 0, function* () {
    const originalConfig = error.config;
    if (!originalConfig)
        return Promise.reject(error);
    if (error.response) {
        if (error.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;
            const token = yield (0, generate_token_1.generatePaypalToken)();
            if (!token)
                return Promise.reject(error);
            return axios(Object.assign(Object.assign({}, originalConfig), { headers: Object.assign(Object.assign({}, originalConfig.headers), { "Authorization": "Bearer " + token }) }));
        }
    }
    return Promise.reject(error);
}));
const profileRouter = (0, express_1.Router)();
exports.default = profileRouter;
profileRouter.delete("/remove-profile-picture", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        schema_1.default.updateOne({ _id: userId }, { $set: { pp: null } });
        res.sendStatus(204);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
profileRouter.get("/profile-info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield schema_1.default.findOne({ _id: req.query.userId }, { profilePicture: 1, fcmToken: 1 });
        if (!user)
            return res.sendStatus(404);
        res.json({
            profilePicture: user.profilePicture,
            fcmToken: user.fcmToken,
        });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
// update password
profileRouter.put("/password", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const oldPassword = req.body.oldPassword;
        const newPassword = req.body.newPassword;
        const user = yield schema_1.default.findById(userId, { password: 1 });
        if (!user)
            return res.sendStatus(404);
        if (!bcrypt_1.default.compareSync(oldPassword, user.password))
            return res.sendStatus(403);
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        const result = yield schema_1.default.updateOne({ _id: userId }, { $set: { password: hashedPassword } });
        if (result.modifiedCount == 1)
            return res.sendStatus(200);
        res.sendStatus(404);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
// update profile
profileRouter.put("/credentials", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        delete req.body.balance;
        delete req.body.password;
        const result = yield schema_1.default.updateOne({ _id: userId }, { $set: req.body });
        if (result.modifiedCount == 1)
            return res.sendStatus(200);
        res.sendStatus(404);
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
profileRouter.post("/upgrade-plan/paypal", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield schema_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ code: "user-not-found" });
        if (user.isPremium)
            return res.status(409).json({ code: "already-premium" });
        //TODO : Remove *0.27 in production and change currency to AED
        const amount = Math.ceil(250 * 0.27);
        const currency = "USD";
        const paymentData = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "items": [
                        {
                            "name": "Roomy Finder Rent feee payment",
                            "description": `Roomy Finder Premium plan ugrade fee`,
                            "quantity": "1",
                            "unit_amount": {
                                "currency_code": currency,
                                "value": "" + amount,
                            },
                        },
                    ],
                    "amount": {
                        "currency_code": currency,
                        "value": "" + amount,
                        "breakdown": {
                            "item_total": {
                                "currency_code": currency,
                                "value": "" + amount,
                            },
                        },
                    },
                },
            ],
            // TODO : Add the return and cancel urls
            "application_context": {
                "return_url": successUrl + "?action=planUpgrade&userId=" + userId,
                "cancel_url": cancelUrl + "?action=planUpgrade&userId=" + userId,
            },
        };
        const response = yield axios.post("/v2/checkout/orders", paymentData, {
            headers: {
                "Prefer": "return=minimal",
                "PayPal-Request-Id": (0, crypto_1.randomUUID)(),
                "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
            },
        });
        if (response.status != 201)
            return res.sendStatus(406);
        const data = response.data;
        const links = data.links;
        // res.redirect(303, session.url);
        res.json({ paymentUrl: links[1].href });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
profileRouter.post("/upgrade-plan/stripe", authentication_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield schema_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ code: "user-not-found" });
        if (user.isPremium)
            return res.status(409).json({ code: "already-premium" });
        const session = yield stripe.checkout.sessions.create({
            line_items: [
                {
                    price: constants_2.STRIPE_UPGRADE_PLAN_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: successUrl + "?action=planUpgrade&userId=" + userId,
            cancel_url: cancelUrl + "?action=planUpgrade&userId=" + userId,
            metadata: { userId, object: "UPGRADE_TO_PREMIUM" },
            customer_email: user.email,
        });
        res.json({ paymentUrl: session.url + "" });
    }
    catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
}));
