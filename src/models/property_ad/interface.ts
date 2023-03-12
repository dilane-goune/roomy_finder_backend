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
    grouping: "Single" | "Couple";
    nationality: string;
    smoking: boolean;
    drinking: boolean;
    visitors: boolean;
    cooking: boolean;
  };

  readonly createdAt: Date;
  ratings: {
    raterId: string;
    score: number;
    comment?: string;
    rateName: string;
  }[];
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
  paymentService?: "STRIPE" | "PAYPAL";
  transactionId?: string;

  readonly createdAt: Date;
  extra?: { [key: string]: any };
  cameraPosition?: {
    bearing: number;
    target: number[];
    tilt: number;
    zoom: number;
  };
  autoCompletePredicate?: {
    placeId?: string;
    mainText: string[];
    secondaryText?: string;
    description: string;
    types: string[];
  };
}
export interface PropertyBookingMethods {}

type PropertyAdSubType = "Bed" | "Partition" | "Room" | "Master Room" | "Mix";
