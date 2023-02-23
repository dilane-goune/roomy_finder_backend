"use strict";
// import { WebUser } from "../interfaces/custom_interfaces";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIREBASE_PRIVATE_KEY = exports.FIREBASE_PROJECT_ID = exports.DATA_BASE_URL = exports.SECRET_KEY = exports.ADDRESS = exports.PORT = void 0;
exports.PORT = parseInt(process.env.PORT) || 39000;
exports.ADDRESS = process.env.ADDRESS || "localhost";
exports.SECRET_KEY = process.env.SECRET_KEY || "SECRET_KEY";
exports.DATA_BASE_URL = process.env.DATA_BASE_URL;
// Firebase
exports.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
exports.FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
