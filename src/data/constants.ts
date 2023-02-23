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
