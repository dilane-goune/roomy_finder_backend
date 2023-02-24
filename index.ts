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
import bookingRouter from "./src/routes/booking";
import FCMHelper from "./src/classes/fcm_helper";
import dealRouter from "./src/routes/deals";

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
app.use("/api/v1/deals", dealRouter);

const listenner = server.listen(PORT, ADDRESS, function () {
  return console.log(`Server running on port ${PORT}`);
});

process.on("exit", (_) => listenner.close());

app.get("/test-fcm", async (req, res) => {
  try {
    await FCMHelper.sendNofication(
      "new-booking",
      "cfrmARdETbmpzKMrVVfHuW:APA91bHqfd6veM_Dn0SrEF6_aP4Gp3QsGUF8YcpiPON1G2SNWF9mXdlcPsanoctzmSjidhQNcmKU4yya-Ap6aDGkfd3oWb3XqSMfW9d8tK-RLVlbUOIdIdBm5Ni1eUiD9xYNNPIuGCPB",
      { tpye: "property" }
    );
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
