import { model, Model, Schema } from "mongoose";
import { Deal, DealMethods } from "./interface";

const schema = new Schema<Deal, Model<Deal>, DealMethods>(
  {
    period: {
      type: String,
      required: true,
      enum: ["Monthly", "Weekly", "Daily"],
    },
    adType: { type: String, required: true, enum: ["PROPERTY", "ROOMMATE"] },
    ad: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: function (doc) {
        if (doc.adType == "PROPERTY") return "PropertyAd";
        return "RoommateAd";
      },
    },
    client: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    poster: { type: Schema.Types.ObjectId, required: true, ref: "User" },

    isPayed: { type: Boolean, required: true, default: false },
    endDate: { type: Date, required: true },
  },

  {
    collection: "Deals",
    timestamps: true,
  }
);

schema.index({ email: 1 }, { unique: true });

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});
schema.set("toObject", { virtuals: true });

const DealModel = model("Deal", schema);

export default DealModel;
