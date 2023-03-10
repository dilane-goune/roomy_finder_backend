import { model, Model, Schema } from "mongoose";
import {
  RoommateAd,
  RoommateAdMethods,
  RoommateBooking,
  RoommateBookingMethods,
} from "./interface";

const schema = new Schema<RoommateAd, Model<RoommateAd>, RoommateAdMethods>(
  {
    poster: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    type: {
      type: String,
      required: true,
      enum: ["Studio", "Appartment", "House"],
    },
    rentType: {
      type: String,
      required: true,
      enum: ["Monthly", "Weekly", "Daily"],
    },
    isPremium: { type: Boolean, default: false },
    budget: { type: Number, required: true },
    description: { type: String, required: true },
    movingDate: { type: Date, required: true },
    images: [String],
    videos: [String],
    isAvailable: { type: Boolean, default: true },

    address: {
      country: { type: String, required: true },
      // city: { type: String, required: true },
      location: { type: String, required: true },
      buildingName: { type: String },
    },

    aboutYou: {
      astrologicalSign: { type: String, required: true },
      age: { type: Number, required: true },
      occupation: {
        type: String,
        required: true,
        enum: ["Student", "Professional", "Other"],
      },
      languages: [String],
      interests: [String],
    },

    socialPreferences: {
      numberOfPeople: { type: String, required: true },
      grouping: { type: String, required: true, enum: ["Single", "Couple"] },
      gender: { type: String, required: true, enum: ["Male", "Female", "Mix"] },
      nationality: { type: String, required: true },
      smoking: { type: Boolean, required: true },
      cooking: { type: Boolean, required: true },
      drinking: { type: Boolean, required: true },
      swimming: { type: Boolean, required: true },
      friendParty: { type: Boolean, required: true },
      gym: { type: Boolean, required: true },
      wifi: { type: Boolean, required: true },
      tv: { type: Boolean, required: true },
    },
    cameraPosition: {
      bearing: { type: Number },
      target: [{ type: Number }],
      tilt: { type: Number },
      zoom: { type: Number },
    },
    autoCompletePredicate: {
      placeId: { type: String },
      mainText: { type: String },
      secondaryText: { type: String },
      description: { type: String },
      types: [{ type: String }],
    },
  },
  {
    collection: "RoommateAds",
    timestamps: true,
  }
);

schema.index({ poster: 1 });
schema.index({ createdAt: 1 });

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});
schema.set("toObject", { virtuals: true });

const RoommateAdModel = model("RoommateAd", schema);

export default RoommateAdModel;

const bookingSchema = new Schema<
  RoommateBooking,
  Model<RoommateBooking>,
  RoommateBookingMethods
>(
  {
    poster: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    client: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    ad: { type: Schema.Types.ObjectId, required: true, ref: "RoommateAd" },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, default: "pending" },
    isPayed: { type: Boolean, default: false },
    lastPaymentDate: { type: Date },
    lastTransactionId: { type: String },
  },
  {
    collection: "Bookings",
    timestamps: true,
  }
);

bookingSchema.index({ landlord: 1 });
bookingSchema.index({ client: 1 });
bookingSchema.index({ ad: 1 });
bookingSchema.index({ checkIn: -1 });
bookingSchema.index({ checkOut: -1 });
bookingSchema.index({ createdAt: -1 });

bookingSchema.set("toJSON", { virtuals: true, versionKey: false });
bookingSchema.set("toObject", { virtuals: true });

export const RoommateBookingModel = model("RoommateBooking", bookingSchema);
