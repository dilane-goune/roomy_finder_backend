import { HydratedDocument } from "mongoose";
import { PropertyAd } from "../property_ad/interface";
import { RoommateAd } from "../roommate_ad/interface";
import { User } from "../user/interface";

export interface Deal {
  id: string;
  adType: "PROPERTY" | "ROOMMATE";
  period: "Monthly" | "Weekly" | "Daily";
  ad: HydratedDocument<PropertyAd | RoommateAd>;
  client: HydratedDocument<User>;
  poster: HydratedDocument<User>;
  readonly createdAt: Date;

  isPayed: boolean;
  endDate: Date;
}

export interface DealMethods {}
