import { HydratedDocument } from "mongoose";
import { User } from "../user/interface";

export interface RoommateAd {
  id: string;
  poster: HydratedDocument<User>;
  type: "Studio" | "Appartment" | "House";
  rentType: "Monthly" | "Weekly" | "Daily";
  isPremium: boolean;
  budget: number;
  description: string;
  images: string[];
  videos: string[];
  readonly createdAt: Date;
  isAvailable: boolean;

  address: {
    country: string;
    // city: string;
    location: string;
    buildingName?: string;
  };

  aboutYou: {
    astrologicalSign: AstrologicalSign;
    age: number;
    occupation: "Student" | "Professional" | "Other";
    languages: string[];
    interests: Interest[];
  };

  socialPreferences: {
    numberOfPeople: string;
    grouping: "Single" | "Couple";
    gender: "Male" | "Female" | "Mix";
    smoking: boolean;
    cooking: boolean;
    drinking: boolean;
    swimming: boolean;
    friendParty: boolean;
    gym: boolean;
    wifi: boolean;
    tv: boolean;
  };
}

export interface RoommateAdMethods {}

type Interest =
  | "Music"
  | "Reading"
  | "Art"
  | "Dance"
  | "Yoga"
  | "Sports"
  | "Travel"
  | "Shopping"
  | "Learning"
  | "Podcasting"
  | "Blogging"
  | "Marketing"
  | "Writing"
  | "Focus"
  | "Chess"
  | "Design"
  | "Football"
  | "Basketball"
  | "Boardgames"
  | "sketching"
  | "Photography";

type AstrologicalSign =
  | "ARIES"
  | "TAURUS"
  | "GEMINI"
  | "CANCER"
  | "LEO"
  | "VIRGO"
  | "LIBRA"
  | "SCORPIO"
  | "SAGITTARIUS"
  | "CAPRICORN"
  | "AQUARIUS"
  | "PISCES";
