"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultMessaging = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// import { FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID } from "../data/constants";
const config = {
    "type": "service_account",
    "project_id": "roomy-finder",
    "private_key_id": "864945124f6afd1c29239a0b0f9bb3f4ab7d483f",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCiQbyrX8R+743n\nsgsQRFvfTo1ucIh/y8JJ6o6DmLUfXmz3imAlGgDma9JEGdbD5K5oKP/isXvMwQ3M\nIUqnTW6q5lpT30BU86Z3beMEXsLWgD1xyqsV8kcAbGcwEmjuyHebIAWTipDB1gRH\nqBGY8vQhkn2kucNncKtJWz6lkQ9GxwyNTwp9hsIDFNCUQzZV14J68UzzMguI0QrR\nsw2ksBQmfqGlh/ws2TS8a42GDiptfpPTa7E4DFir6baHVTOYF1lHANidJuFx+d5Y\nLPNF5kpU5a8DuqS54hYohliuMQ+z8j2iUpiSTmGNBTdVXcn5twmOOFKI/NZh+WDX\nGvdtPtQ/AgMBAAECggEAMQ464n0zxUTb3F8B5Uslk6AGNoujWS/bb8mQiMzUhcVg\noH6fjtgLyZ5zlc9SFSvAZxFuO7V5PnBnoX23Olm4ycaXLKBkrMp1W8pHRnz33y4q\nZYrmqt3zBXfAwtHuE7NcJfRKe077cP8pkBiKKXnawYOupOzc3Rs9ThJeIGR4/+aW\nlUeKwD9QkZqb3L84bAW1AhIXIyJM8aYehB5RZEWvTLvS9aIGW/UtGekw5aUdZr0b\nCQV0Igsf5vNc+GevFv0uytDBpdSiKKlY3LDxbJo8rw/Z4I7LXvt4Y8N6I5qwQ2hN\nER1aEdhPPYeRidsmSMZkvAfYBFqQ8WEMgfb+G0LZgQKBgQDcDK2Cz+1ZQsCiCru8\nztH3FKfMNuvgPZtKUgwHSDhj4Sw3peAhYXKBClSg401fpBPxCZgosCSKv3P/vzgu\nWszC6BSY5q7n2iOpidmNdTjse2e3eSfdiIogFLBeV2oN4nY0Kcx7iBsAkJA0VsCa\nG6LWCfkJ3Cu/5eCxrKJOyP72HwKBgQC8w/GBYDTn2RGShY/HuuGqND7/AFGkJkvX\n4Yz1UyavSJAzxFBILUOzUeHdHupoSQ+nskeKmsdMSCaXizMEYMQ/FQ0cnTF09sEt\nrG0BBJhDqBQWSTbqrKSIwctpE5uSPROIWrLhIGSDWxmF71Vf+67jQEealhh3xjTg\noxMUXdkd4QKBgAFUYkgEEZ8UdC2GexPs+//ONCVbv5kfRizwyfnRSeXwml/LtMr+\n175H3bMLLJCDYUt3j1/PkKj19zF4alJ9Yfdbh6RU4IGuI8EGgDYGm01ygXHuXXtN\nM+h1t4saZB2pXKV8CyxD6kXamcR3Mbq8qAM7FDInDmyeavkn3eMz+7ZpAoGBALXy\noJy14QkBQGDdAIPibJYkmfwtkIQKrdw+eiIVrhoSdXyQY1nO14zHBlCe9g7jLYXU\n4ASHwEaU3S4BbIFxzHeJkQPduMgm+HlP1BnBFgtQvVvl4ls9YbK4KZr03WWOHX+2\n/Ojm0juS2f0xfjdwX1iIovwsZRU+JcXJKiDdfOPBAoGBANZxfqIdyd60QcRXMBHo\niShhMHhatY0YVYReHSuvYL9JtrLfDexbzi49ovGULXTqsK1JbnzfC7B+ZVpQ1mN4\n6e7bWGNJhqxKyONgHSiT9Xi8joxkZyKj7Nc2BEjPQufTo2vr1MHm+wf31xCvDTWn\n8b2uwGYCs4HtdCeeZRAG0Lqs\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-kvmw2@roomy-finder.iam.gserviceaccount.com",
    "client_id": "104564563619684685597",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-kvmw2%40roomy-finder.iam.gserviceaccount.com",
};
const app = firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(config),
});
exports.defaultMessaging = firebase_admin_1.default.messaging(app);
// const config: any = {
//   "type": "service_account",
//   "project_id": FIREBASE_PROJECT_ID,
//   "private_key_id": "864945124f6afd1c29239a0b0f9bb3f4ab7d483f",
//   "private_key": FIREBASE_PRIVATE_KEY,
//   "client_email": `firebase-adminsdk-kvmw2@${FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
//   "client_id": "104564563619684685597",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": `https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-kvmw2%40${FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
// };
