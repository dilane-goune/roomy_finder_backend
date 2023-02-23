import { HydratedDocument, model, Model, Schema } from "mongoose";
import { User } from "../user/interface";

export interface LoginMonitory {
  user: HydratedDocument<User>;
  succeeded: boolean;
  createdAt: Date;
}

export interface LoginMonitoryMethods {}

const schema = new Schema<
  LoginMonitory,
  Model<LoginMonitory>,
  LoginMonitoryMethods
>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    succeeded: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    collection: "LoginMonitorys",
  }
);

const LoginMonitoryModel = model("LoginMonitory", schema);

export default LoginMonitoryModel;
