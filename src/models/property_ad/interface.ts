import { HydratedDocument } from "mongoose";
import { User } from "../user/interface";

export interface PropertyAd {
  id: string;
  poster: HydratedDocument<User>;
  type: PropertyAdSubType;
  quantity: number;
  quantityTaken: number;
  preferedRentType: "Monthly" | "Weekly" | "Daily";
  monthlyPrice: number;
  weeklyPrice: number;
  dailyPrice: number;
  deposit: boolean;
  depositPrice?: number;
  description: string;

  posterType: "Landlord" | "Agent/Broker";
  address: {
    city: string;
    location: string;
    buildingName: string;
    floorNumber: string;
  };

  images: string[];
  videos: string[];
  amenties: string[];
  agentInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  socialPreferences: {
    numberOfPeople: string;
    gender: "Male" | "Female" | "Mix";
    nationality: string;
    smoking: boolean;
    drinking: boolean;
    visitors: boolean;
  };

  readonly createdAt: Date;
}

export interface PropertyAdMethods {}

export interface PropertyBooking {
  id: string;
  poster: HydratedDocument<User>;
  client: HydratedDocument<User>;
  ad: HydratedDocument<PropertyAd>;
  quantity: number;
  status: "pending" | "offered" | "declined" | "terminated";
  checkIn: Date;
  checkOut: Date;
  rentType: "Monthly" | "Weekly" | "Daily";
  isPayed: boolean;
  lastPaymentDate?: Date;
  lastTransactionId?: String;

  readonly createdAt: Date;
}
export interface PropertyBookingMethods {}

type PropertyAdSubType = "Bed" | "Partition" | "Room" | "Master Room" | "Mix";
