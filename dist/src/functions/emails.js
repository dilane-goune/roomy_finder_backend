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
Object.defineProperty(exports, "__esModule", { value: true });
const mailtrap_1 = require("mailtrap");
const constants_1 = require("../data/constants");
function sendEmail({ subject, recieverEmail, message, }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const client = new mailtrap_1.MailtrapClient({
                endpoint: constants_1.MAIL_ENDPOINT,
                token: constants_1.MAIL_TOKEN,
            });
            const sender = {
                email: "mailtrap@gouneanlab.com",
                name: "Gounean Lab",
            };
            const recipients = [{ email: recieverEmail }];
            const response = yield client.send({
                from: sender,
                to: recipients,
                subject: subject,
                text: message,
                category: "Integration Test",
            });
            console.log("Message sent: %s", response.success);
        }
        catch (error) {
            console.log(error);
            console.log("Failed to send email");
        }
    });
}
exports.default = sendEmail;
