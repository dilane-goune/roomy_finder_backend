import { HydratedDocument } from "mongoose";
import { User } from "../user/interface";

export interface PropertyAd {
  id: string;
  poster: HydratedDocument<User>;
  type: PropertyAdSubType;
  quantity: number;
  quantityTaken: number;
  rentType: "Monthly" | "Weekly" | "Daily";
  price: number;
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

type PropertyAdSubType = "Bed" | "Partition" | "Room" | "Master Room" | "Mix";
