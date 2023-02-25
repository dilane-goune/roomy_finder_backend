"use strict";
// import { model, Model, Schema } from "mongoose";
// import { Booking, BookingMethods } from "./interface";
// const bookingSchema = new Schema<Booking, Model<Booking>, BookingMethods>(
//   {
//     adType: { type: String, required: true, enum: ["PROPERTY", "ROOMMATE"] },
//     poster: { type: Schema.Types.ObjectId, required: true, ref: "User" },
//     client: { type: Schema.Types.ObjectId, required: true, ref: "User" },
//     ad: {
//       type: Schema.Types.ObjectId,
//       required: true,
//       ref: function (doc) {
//         if (doc.type == "PROPERTY") return "PropertyAd";
//         return "RoommateAd";
//       },
//     },
//     checkIn: { type: Date, required: true },
//     checkOut: { type: Date, required: true },
//   },
//   {
//     collection: "Bookings",
//     timestamps: true,
//   }
// );
// bookingSchema.index({ landlord: 1 });
// bookingSchema.index({ client: 1 });
// bookingSchema.index({ ad: 1 });
// bookingSchema.index({ createdAt: 1 });
// bookingSchema.set("toJSON", { virtuals: true, versionKey: false });
// bookingSchema.set("toObject", { virtuals: true });
// const BookingModel = model("Booking", bookingSchema);
// export default BookingModel;
