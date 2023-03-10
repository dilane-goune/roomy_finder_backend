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
exports.generatePaypalToken = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const constants_1 = require("../data/constants");
function generatePaypalToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield axios_1.default.post("/v1/oauth2/token", qs_1.default.stringify({ "grant_type": "client_credentials" }), {
                auth: {
                    username: constants_1.PAYPAL_CLIENT_ID,
                    password: constants_1.PAYPAL_CLIENT_SECRET,
                },
                baseURL: constants_1.PAYPAL_API_URL,
            });
            const token = res.data.access_token;
            process.env.PAYPAL_TOKEN = token;
            return token;
        }
        catch (error) {
            // console.log(error);
            return null;
        }
    });
}
exports.generatePaypalToken = generatePaypalToken;
