import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";
import runInTransaction from "../../functions/run_in_transaction";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import BookingModel from "../../models/booking/schema";
import DealModel from "../../models/deal/schema";
import { PropertyAd } from "../../models/property_ad/interface";
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
    const adType = req.body.adType;

    if (landlord == userId) {
      return res.sendStatus(403);
    }

    const readAd =
      adType == "PROPERTY"
        ? await PropertyAdModel.findById(ad, {})
        : await RoommateAdModel.findById(ad, {});

    if (!readAd) {
      return res.sendStatus(404);
    }

    const oldBooking = await BookingModel.findOne({
      client: userId,
      poster: landlord,
      ad,
    });

    if (oldBooking) {
      return res.sendStatus(409);
    }

    const booking = await BookingModel.create({
      ...req.body,
      client: userId,
      poster: landlord,
      ad,
      adType,
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

  const userId = (req as CustomRequest).userId;

  const filter: { [key: string]: any } = {};

  if (status) filter.status = status;

  try {
    const data = await BookingModel.find({
      ...filter,
      $or: [{ client: userId }, { poster: userId }],
    })
      .skip(skip)
      .limit(100)
      .populate([
        { path: "poster" },
        { path: "client", select: "-password -bankInfo" },
        { path: "ad", populate: "poster" },
      ]);
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.post("/:id/offer", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const booking = await BookingModel.findOne({
      _id: req.params.id,
      poster: userId,
    }).populate([
      { path: "poster" },
      { path: "client", select: "-password -bankInfo" },
      { path: "ad" },
    ]);

    if (!booking) return res.sendStatus(404);

    const ad = booking.ad;
    if (booking.adType == "PROPERTY") {
      if ((ad as PropertyAd).quantity == (ad as PropertyAd).quantityTaken) {
        return res.sendStatus(400);
      }
    }
    const now = new Date();

    switch (ad.rentType) {
      case "Monthly":
        now.setMonth(now.getMonth() + 1);
        break;
      case "Weekly":
        now.setDate(now.getDate() + 7);
        break;
      case "Daily":
        now.setDate(now.getDate() + 1);
        break;
    }

    await runInTransaction(async (session) => {
      await DealModel.create(
        [
          {
            adType: booking.adType,
            client: booking.client,
            poster: booking.poster,
            ad: booking.ad,
            period: ad.rentType,
            endDate: now,
          },
        ],
        { session }
      );

      await BookingModel.deleteOne({ _id: booking._id }, { session });

      if (booking.adType == "PROPERTY") {
        await PropertyAdModel.updateOne(
          { _id: booking.ad },
          { $inc: { quantityTaken: 1 } },
          { session }
        );
      }
    });

    FCMHelper.sendNofication("booking-offered", booking.client.fcmToken, {
      bookingId: req.params.id,
      "ad": ad.type,
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.post("/:id/cancel", async (req, res) => {
  try {
    const userId = (req as any).userId;

    const booking = await BookingModel.findByIdAndRemove({
      _id: req.params.id,
      $or: [{ poster: userId }, { client: userId }],
    });

    if (!booking) return res.sendStatus(404);

    let message: string;
    if (booking.poster._id.equals(userId)) {
      message =
        "The ownner of a booking to which you recently subscribe declined the booking";
    } else {
      message = "A client cancelled a booking from your ad post";
    }

    res.sendStatus(200);

    const recieverFcmToken = req.body.recieverFcmToken;

    FCMHelper.sendNofication("booking-declined", recieverFcmToken, {
      bookingId: req.params.id,
      message,
    });
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
