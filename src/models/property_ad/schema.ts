import { model, Model, Schema } from "mongoose";
import { PropertyAd, PropertyAdMethods } from "./interface";

const schema = new Schema<PropertyAd, Model<PropertyAd>, PropertyAdMethods>(
  {
    poster: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    type: { type: String, required: true },
    quantity: { type: Number, required: true },
    quantityTaken: { type: Number, default: 0 },
    rentType: { type: String, required: true },
    price: { type: Number, required: true },
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
      nationality: { type: String, required: true },
      smoking: { type: Boolean, required: true },
      drinking: { type: Boolean, required: true },
      visitors: { type: Boolean, required: true },
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
