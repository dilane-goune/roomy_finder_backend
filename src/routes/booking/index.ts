import { Router } from "express";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import { PropertyBookingModel } from "../../models/property_ad/schema";
import propertyBookingRouter from "./property_booking";
import roommateBookingRouter from "./roommate_booking";

const bookingRouter = Router();
export default bookingRouter;

bookingRouter.use("/property-ad", propertyBookingRouter);
bookingRouter.use("/roommate-ad", roommateBookingRouter);

bookingRouter.get("/my-bookings", authentication, async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;

    const propertyBookings = await PropertyBookingModel.find({
      $or: [{ client: userId }, { poster: userId }],
    })
      .populate([
        { path: "poster" },
        { path: "client", select: "-password -bankInfo" },
        { path: "ad", populate: "poster" },
      ])
      .sort({ createdAt: -1 });

    // const roommateBookings = await RoommateBookingModel.find({
    //   $or: [{ client: userId }, { poster: userId }],
    // })
    //   .populate([
    //     { path: "poster" },
    //     { path: "client", select: "-password -bankInfo" },
    //     { path: "ad", populate: "poster" },
    //   ])
    //   .sort({ createdAt: -1 });

    res.json(propertyBookings);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
