import { model, Model, Schema } from "mongoose";
import {
  PropertyAd,
  PropertyAdMethods,
  PropertyBooking,
  PropertyBookingMethods,
} from "./interface";

const schema = new Schema<PropertyAd, Model<PropertyAd>, PropertyAdMethods>(
  {
    poster: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantityTaken: { type: Number, default: 0 },
    preferedRentType: { type: String, required: true },
    monthlyPrice: { type: Number, required: true },
    weeklyPrice: { type: Number, required: true },
    dailyPrice: { type: Number, required: true },
    deposit: { type: Boolean, default: false },
    depositPrice: { type: String },
    description: { type: String, required: true },
    posterType: {
      type: String,
      required: true,
      enum: ["Landlord", "Agent/Broker"],
    },
    address: {
      city: { type: String, required: true },
      location: { type: String, required: true },
      buildingName: { type: String, required: true },
      floorNumber: { type: Number, required: true },
    },
    images: [String],
    videos: [String],
    agentInfo: {},
    socialPreferences: {
      numberOfPeople: { type: String, required: true },
      gender: { type: String, required: true, enum: ["Male", "Female", "Mix"] },
      nationality: { type: String, default: false },
      smoking: { type: Boolean, default: false },
      drinking: { type: Boolean, default: false },
      visitors: { type: Boolean, default: false },
    },
    amenties: [String],
  },
  {
    collection: "PropertyAds",
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

const PropertyAdModel = model("PropertyAd", schema);

export default PropertyAdModel;

const bookingSchema = new Schema<
  PropertyBooking,
  Model<PropertyBooking>,
  PropertyBookingMethods
>(
  {
    poster: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    client: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    ad: { type: Schema.Types.ObjectId, required: true, ref: "PropertyAd" },
    quantity: { type: Number, required: true, min: 1 },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: { type: String, default: "pending" },
    rentType: { type: String, required: true },
    isPayed: { type: Boolean, default: false },
    lastPaymentDate: { type: Date },
    lastTransactionId: { type: String },
  },
  {
    collection: "PropertyBookings",
    timestamps: true,
  }
);

bookingSchema.index({ landlord: 1 });
bookingSchema.index({ client: 1 });
bookingSchema.index({ ad: 1 });
bookingSchema.index({ createdAt: 1 });

bookingSchema.set("toJSON", { virtuals: true, versionKey: false });
bookingSchema.set("toObject", { virtuals: true });

export const PropertyBookingModel = model("PropertyBooking", bookingSchema);
