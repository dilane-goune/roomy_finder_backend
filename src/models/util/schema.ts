import { model, Schema } from "mongoose";
import { IAppVersion, IFeedBack } from "./interface";

const appVersionSchema = new Schema<IAppVersion>(
  {
    version: { type: String, required: true },
    url: { type: String, required: true },
    platform: { type: String, required: true, enum: ["ANDROID", "IOS"] },
    releaseType: { type: String, required: true, enum: ["ALPHA", "BETA"] },
    releaseDate: { type: Date, required: true },
  },
  {
    collection: "AppVersions",
    timestamps: true,
  }
);

const feedBackSchema = new Schema<IFeedBack>(
  {
    message: { type: String, required: true },
    userName: { type: String, required: true },
  },
  {
    collection: "FeedBacks",
    timestamps: true,
  }
);

export const AppVersionModel = model("AppVersion", appVersionSchema);
export const FeedBackModel = model("FeedBack", feedBackSchema);
