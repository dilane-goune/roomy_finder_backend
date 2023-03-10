"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importStar(require("axios"));
const constants_1 = require("../data/constants");
function verifyPayPalHook(req) {
    return __awaiter(this, void 0, void 0, function* () {
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
                "PayPal-Request-Id": "66955aa5-2f23-458f-be20-cdc71ce714da",
                "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
            },
            data: JSON.stringify(data),
        };
        const status = yield (0, axios_1.default)(config)
            .then((response) => {
            console.log(response.data);
            if (response.data.verification_status == "SUCCESS")
                return "SUCCESS";
            return "FAILURE";
        })
            .catch((error) => {
            var _a, _b;
            if (error instanceof axios_1.AxiosError) {
                console.log((_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
                console.log(error.request.url);
                console.log((_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
            }
            console.log("Verification error");
            return "FAILURE";
        });
        return status;
    });
}
exports.default = verifyPayPalHook;
