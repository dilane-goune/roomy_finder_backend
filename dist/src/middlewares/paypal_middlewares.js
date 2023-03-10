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
exports.verifyPaypalSignature = exports.paypalPayoutValidator = void 0;
const axios_1 = __importDefault(require("axios"));
const joi_1 = __importDefault(require("joi"));
const constants_1 = require("../data/constants");
function paypalPayoutValidator(req, res, next) {
    const payoutSchema = joi_1.default.object({
        amount: joi_1.default.number().min(0).required(),
        email: joi_1.default.string().email().required(),
        currency: joi_1.default.string().trim().required(),
        userPassword: joi_1.default.string().required(),
    });
    const { error, value } = payoutSchema.validate(req.body);
    if (error)
        return res.status(400).json({ error });
    req.body = value;
    next();
}
exports.paypalPayoutValidator = paypalPayoutValidator;
function verifyPaypalSignature(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return next();
        // TODO : fix paypal verifacition
        let headers = req.headers;
        let data = {
            "webhook_id": constants_1.PAYPAL_WEBHOOK_ID,
            "transmission_id": headers["paypal-transmission-id"],
            "transmission_time": headers["paypal-transmission-time"],
            "cert_url": headers["paypal-cert-url"],
            "auth_algo": headers["paypal-auth-algo"],
            "transmission_sig": headers["paypal-transmission-sig"],
            "webhook_event": req.body,
        };
        let config = {
            method: "post",
            url: constants_1.PAYPAL_API_URL + "/notifications/verify-webhook-signature",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
            },
            data: JSON.stringify(data),
        };
        const status = yield (0, axios_1.default)(config)
            .then((response) => {
            if (response.data.verification_status == "SUCCESS")
                return "SUCCESS";
            return "FAILURE";
        })
            .catch((error) => {
            return "FAILURE";
        });
        if (status == "SUCCESS")
            next();
        else
            return res.sendStatus(401);
    });
}
exports.verifyPaypalSignature = verifyPaypalSignature;
