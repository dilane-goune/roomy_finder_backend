import { model, Model, Schema } from "mongoose";
import { Booking, BookingMethods } from "./interface";

const schema = new Schema<Booking, Model<Booking>, BookingMethods>(
  {
    adType: { type: String, required: true, enum: ["PROPERTY", "ROOMMATE"] },
    poster: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    client: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    ad: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: function (doc) {
        if (doc.type == "PROPERTY") return "PropertyAd";
        return "RoommateAd";
      },
    },

    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
  },
  {
    collection: "Bookings",
    timestamps: true,
  }
);

schema.index({ landlord: 1 });
schema.index({ client: 1 });
schema.index({ ad: 1 });
schema.index({ createdAt: 1 });

schema.set("toJSON", { virtuals: true, versionKey: false });
schema.set("toObject", { virtuals: true });

const BookingModel = model("Booking", schema);

export default BookingModel;
