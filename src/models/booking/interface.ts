import { HydratedDocument } from "mongoose";
import { PropertyAd } from "../property_ad/interface";
import { RoommateAd } from "../roommate_ad/interface";
import { User } from "../user/interface";

export interface Booking {
  id: string;
  type: "PROPERTY" | "ROOMMATE";
  landlord: HydratedDocument<User>;
  client: HydratedDocument<User>;
  ad: HydratedDocument<PropertyAd | RoommateAd>;
  checkIn: Date;
  checkOut: Date;
  status: "OFFERED" | "DECLINED";
  readonly createdAt: Date;
}
export interface BookingMethods {}
