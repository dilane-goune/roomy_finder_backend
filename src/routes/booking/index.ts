import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import BookingModel from "../../models/booking/schema";
import PropertyAdModel from "../../models/property_ad/schema";
import RoommateAdModel from "../../models/roommate_ad/schema";

const bookingRouter = Router();
export default bookingRouter;
bookingRouter.use(authentication);

bookingRouter.post("/", async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;
    const landlord = req.body.landlordId;
    const ad = req.body.adId;
    const recieverFcmToken = req.body.recieverFcmToken;
    const type = req.body.type;

    if (landlord == userId) {
      return res.sendStatus(403);
    }

    const readAd =
      type == "PROPERTY"
        ? await PropertyAdModel.findById(ad, {})
        : await RoommateAdModel.findById(ad, {});

    if (!readAd) {
      return res.sendStatus(404);
    }

    const oldBooking = await BookingModel.findOne({
      client: userId,
      landlord,
      ad,
    });

    if (oldBooking) {
      return res.sendStatus(409);
    }

    const booking = await BookingModel.create({
      ...req.body,
      client: userId,
      landlord,
      ad,
      type,
    });

    res.sendStatus(200);

    FCMHelper.sendNofication("new-booking", recieverFcmToken, {
      bookingId: booking._id.toString(),
      type: "property",
    });
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.get("/", async (req, res) => {
  const skip = parseInt(req.query.skip as string) || 0;
  const status = req.query.status;

  const filter: { [key: string]: any } = {};

  if (status) filter.status = status;

  try {
    const data = await BookingModel.find(filter)
      .skip(skip)
      .limit(100)
      .populate(["landlord", "client", "ad"], "-password -bankInfo");

    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.post("/:id/offer", async (req, res) => {
  try {
    const booking = await BookingModel.findByIdAndUpdate(req.params.id, {
      $set: { status: "OFFERED" },
    });

    if (!booking) return res.sendStatus(404);
    res.sendStatus(200);

    const recieverFcmToken = req.body.recieverFcmToken;

    FCMHelper.sendNofication("booking-offered", recieverFcmToken, {
      bookingId: req.params.id,
    });
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.post("/:id/decline", async (req, res) => {
  try {
    const booking = await BookingModel.findByIdAndUpdate(req.params.id, {
      $set: { status: "DECLINED" },
    });

    if (!booking) return res.sendStatus(404);
    res.sendStatus(200);

    const recieverFcmToken = req.body.recieverFcmToken;

    FCMHelper.sendNofication("booking-declined", recieverFcmToken, {
      bookingId: req.params.id,
    });
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const booking = await BookingModel.findById(req.params.id);

    if (!booking) return res.sendStatus(404);
    if (userId != booking.id) res.sendStatus(403);

    await BookingModel.deleteOne({ _id: req.params.id });

    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
