import express from "express";
import http from "http";
import dotenv from "dotenv";
import helmet from "helmet";

dotenv.config();
import "./src/functions/firebase";
import mongoose from "mongoose";
import { ADDRESS, DATA_BASE_URL, PORT } from "./src/data/constants";
import userRouter from "./src/routes/user";
import adsRouter from "./src/routes/ads";
import bookingRouter from "./src/routes/booking/index";
import utilRouter from "./src/routes/utils";

mongoose.set("strictQuery", true);

// database connection
mongoose
  .connect(DATA_BASE_URL)

  .catch(function (e) {
    console.log("SERVER :: ", e);
    process.exit();
  });

const app = express();
app.use(helmet());
app.use(express.json());
app.use("/public", express.static(process.cwd() + "/public"));
app.set("view engine", "ejs");

const server = http.createServer(app);

// Express routes
app.get("/", (req, res) => res.json({ message: "Room Finder" }));
app.use("/api/v1", userRouter);
app.use("/api/v1/ads", adsRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/utils", utilRouter);

const listenner = server.listen(PORT, ADDRESS, function () {
  return console.log(`Server running on port ${PORT}`);
});

process.on("exit", (_) => listenner.close());
