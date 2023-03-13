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
const firebase_1 = require("../functions/firebase");
const null_filter_helper_1 = __importDefault(require("../functions/null_filter_helper"));
class FCMHelper {
    static send(fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.defaultMessaging.send({ token: fcmToken, data: data });
                // console.log("Successfully sent message:", response);
            }
            catch (error) {
                console.log("Error sending message:", error);
            }
        });
    }
    static sendTopic(topic, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.defaultMessaging.send({ topic: topic, data: data });
                // console.log("Successfully sent message:", response);
            }
            catch (error) {
                console.log("Error sending topic message:", error);
            }
        });
    }
    static sendMulticast(fcmTokens, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokens = fcmTokens.filter(null_filter_helper_1.default);
            try {
                const response = yield firebase_1.defaultMessaging.sendMulticast({
                    tokens,
                    data: data,
                });
                console.log(response.successCount + " messages were sent successfully");
            }
            catch (error) {
                console.log("Error sending message:", error);
            }
        });
    }
    static sendNofication(event, fcmToken, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield firebase_1.defaultMessaging.send({
                    token: fcmToken,
                    data: Object.assign(Object.assign({}, data), { event }),
                    notification: {
                        body: data["body"] || data["message"],
                    },
                });
                // console.log("Successfully sent message for event : " + event, response);
                return true;
            }
            catch (error) {
                console.log("Error sending message:", error);
                return false;
            }
        });
    }
}
exports.default = FCMHelper;
