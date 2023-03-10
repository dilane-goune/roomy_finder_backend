"use strict";
// import { WebUser } from "../interfaces/custom_interfaces";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYPAL_API_URL = exports.PAYPAL_WEBHOOK_ID = exports.PAYPAL_CLIENT_SECRET = exports.PAYPAL_CLIENT_ID = exports.STRIPE_UPGRADE_PLAN_PRICE_ID = exports.STRIPE_WEBHOOK_SIGNING_SECRET = exports.STRIPE_SECRET_KEY = exports.MAIL_SMTP_PASSWORD = exports.MAIL_SMTP_USERNAME = exports.MAIL_SMTP_PORT = exports.MAIL_ENDPOINT = exports.MAIL_TOKEN = exports.SEND_GRID_API_KEY = exports.FIREBASE_PRIVATE_KEY = exports.FIREBASE_PROJECT_ID = exports.DATA_BASE_URL = exports.SECRET_KEY = exports.SERVER_URL = exports.ADDRESS = exports.PORT = void 0;
exports.PORT = parseInt(process.env.PORT) || 39000;
exports.ADDRESS = process.env.ADDRESS || "localhost";
exports.SERVER_URL = process.env.SERVER_URL || "";
exports.SECRET_KEY = process.env.SECRET_KEY || "SECRET_KEY";
exports.DATA_BASE_URL = process.env.DATA_BASE_URL;
// Firebase
exports.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
exports.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
// Mailing SendGrid
exports.SEND_GRID_API_KEY = process.env.SEND_GRID_API_KEY || "SEND_GRID_API_KEY";
// Mailing
exports.MAIL_TOKEN = process.env.MAIL_TOKEN || "MAIL_TOKEN";
exports.MAIL_ENDPOINT = process.env.MAIL_ENDPOINT || "ENDPOINT";
exports.MAIL_SMTP_PORT = parseInt(process.env.MAIL_SMTP_PORT) || 587;
exports.MAIL_SMTP_USERNAME = process.env.MAIL_SMTP_USERNAME || "";
exports.MAIL_SMTP_PASSWORD = process.env.MAIL_SMTP_PASSWORD || "";
// Stripe API
exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";
exports.STRIPE_WEBHOOK_SIGNING_SECRET = process.env.STRIPE_WEBHOOK_SIGNING_SECRET || "";
exports.STRIPE_UPGRADE_PLAN_PRICE_ID = process.env.STRIPE_UPGRADE_PLAN_PRICE_ID || "";
// Paypal
exports.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
exports.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
exports.PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;
exports.PAYPAL_API_URL = "https://api-m.sandbox.paypal.com";
