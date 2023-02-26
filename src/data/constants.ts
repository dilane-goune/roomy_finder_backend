// import { WebUser } from "../interfaces/custom_interfaces";

export const PORT = parseInt(process.env.PORT as string) || 39000;
export const ADDRESS = (process.env.ADDRESS as string) || "localhost";
export const SECRET_KEY = process.env.SECRET_KEY || "SECRET_KEY";

export const DATA_BASE_URL = process.env.DATA_BASE_URL as string;

// Firebase
export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID as string;
export const FIREBASE_PRIVATE_KEY = (
  process.env.FIREBASE_PRIVATE_KEY as string
).replace(/\\n/g, "\n");

// Mailing
export const MAIL_TOKEN = process.env.MAIL_TOKEN || "MAIL_TOKEN";
export const MAIL_ENDPOINT = process.env.MAIL_ENDPOINT || "ENDPOINT";
export const MAIL_SMTP_PORT =
  parseInt(process.env.MAIL_SMTP_PORT as string) || 587;
export const MAIL_SMTP_USERNAME = process.env.MAIL_SMTP_USERNAME || "";
export const MAIL_SMTP_PASSWORD = process.env.MAIL_SMTP_PASSWORD || "";
