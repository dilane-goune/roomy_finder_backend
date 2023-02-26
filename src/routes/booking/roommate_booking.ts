import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";
import runInTransaction from "../../functions/run_in_transaction";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import RoommateAdModel, {
  RoommateBookingModel,
} from "../../models/roommate_ad/schema";
import UserModel from "../../models/user/schema";

const bookingRouter = Router();
export default bookingRouter;
bookingRouter.use(authentication);

bookingRouter.get("/", async (req, res) => {
  const skip = parseInt(req.query.skip as string) || 0;
  const status = req.query.status;

  const userId = (req as CustomRequest).userId;

  const filter: { [key: string]: any } = {};

  if (status) filter.status = status;

  try {
    const data = await RoommateBookingModel.find({
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

bookingRouter.post("/", async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;
    const adId = req.body.adId;

    const landlord = await UserModel.findById(req.body.landlordId);
    const client = await UserModel.findById(userId);
    const ad = await RoommateAdModel.findById(adId);

    if (!landlord)
      return res.status(400).json({ "code": "landlord-not-found" });
    if (!client) return res.status(400).json({ "code": "client-not-found" });
    if (!ad) return res.status(400).json({ "code": "ad-not-found" });

    if (landlord.id == userId) return res.sendStatus(403);

    const booking = await RoommateBookingModel.create({
      ...req.body,
      client: userId,
      poster: landlord,
      ad: adId,
    });

    res.sendStatus(200);

    const message =
      `Dear ${landlord.firstName} ${landlord.lastName},` +
      " We are happy to tell you that a the user" +
      `, '${client.firstName} ${client.lastName}'` +
      " have booked your roommate post, " +
      ` '${ad.type} in ${ad.address.country},${ad.address.location}' ` +
      `. Now, you can either accept or decline the booking.`;

    FCMHelper.sendNofication("new-booking", landlord.fcmToken, {
      bookingId: booking._id.toString(),
      "ad": ad.type,
      message,
    });

    const fiftheenMinutes = 1000 * 60 * 15;

    const reminderInterval = setInterval(
      async (booking, landlord, client) => {
        const message =
          `Reminder : Dear ${landlord.firstName} ${landlord.lastName},` +
          " We are happy to tell you that a " +
          client.type +
          `, '${client.firstName} ${client.lastName}'` +
          " have booked your property, " +
          ` '${ad.type} in ${ad.address.location}'. Now, you can either accept or decline the booking.`;

        FCMHelper.sendNofication("auto-reply", landlord.fcmToken, {
          bookingId: booking._id.toString(),
          "ad": ad.type,
          message,
        });
      },
      fiftheenMinutes,
      booking,
      landlord,
      client
    );

    setTimeout(
      async (booking, landlord, client) => {
        console.log(booking.client.firstName);
        const messageToPoster =
          `Auto Reject : \nDear ${landlord.firstName} ${landlord.lastName},` +
          " We are have autommatically rejected the booking of  '${ad.type} in ${ad.address.city}'" +
          `, sent by '${client.firstName} ${client.lastName}' due to no reply.`;

        FCMHelper.sendNofication("auto-reply", landlord.fcmToken, {
          message: messageToPoster,
        });

        const messageToClient =
          `Auto Reject : Dear ${booking.client.firstName} ${booking.client.lastName},` +
          ` We are soory to tell you that your booking of ${ad.type} in ${ad.address.location}` +
          ` ${booking.poster.firstName} ${booking.poster.lastName}` +
          " have been cancel due to unresponsive Landlord.";

        FCMHelper.sendNofication("auto-reply", client.fcmToken, {
          message: messageToClient,
        });

        clearInterval(reminderInterval);
        try {
          await booking.deleteOne();
        } catch (e) {
          console.error(e);
        }
      },
      fiftheenMinutes + 1000,
      booking,
      landlord,
      client
    );

    // TODO : Send email
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.post("/:id/offer", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const booking = await RoommateBookingModel.findOne({
      _id: req.params.id,
      poster: userId,
    }).populate([
      { path: "poster" },
      { path: "client", select: "-password -bankInfo" },
    ]);

    if (!booking) return res.sendStatus(404);

    const ad = await RoommateAdModel.findById(booking.ad._id);

    if (!ad) return res.sendStatus(404);

    await runInTransaction(async (session) => {
      await booking.updateOne({ $set: { status: "offered" } }, { session });
    });

    const message =
      `Dear ${booking.client.firstName} ${booking.client.lastName},` +
      " We are happy to tell you that the ownner," +
      ` ${booking.poster.firstName} ${booking.poster.lastName}` +
      " have accepted your booking of the" +
      ` ${ad.type} in ${ad.address.country} ${ad.address.country}.` +
      ` Now, you can have to pay the renting fee.`;

    FCMHelper.sendNofication("booking-offered", booking.client.fcmToken, {
      bookingId: req.params.id,
      "ad": ad.type,
      message,
    });

    // TODO : Send email
    // TODO : Save jod to database

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.post("/:id/cancel", async (req, res) => {
  try {
    const userId = (req as any).userId;

    runInTransaction(async (session) => {
      const booking = await RoommateBookingModel.findById({
        _id: req.params.id,
        $or: [{ poster: userId }, { client: userId }],
      }).populate([
        { path: "poster" },
        { path: "client", select: "-password -bankInfo" },
        { path: "ad", populate: "poster" },
      ]);

      if (!booking) return res.sendStatus(404);

      let message: string;
      if (booking.poster._id.equals(userId)) {
        message =
          `Dear ${booking.client.firstName} ${booking.client.lastName},` +
          " We appoligize that the Lanlord declined your booking of the property" +
          `${booking.ad.type} in ${booking.ad.address.country}. ` +
          "Check out simmillar properties for search.";
      } else {
        message =
          `Dear ${booking.poster.firstName} ${booking.poster.lastName},` +
          " a client just cancelled her booking of your property " +
          `${booking.ad.type} in ${booking.ad.address.country}.`;
      }

      const recieverFcmToken = req.body.recieverFcmToken;

      booking.deleteOne({ session });

      FCMHelper.sendNofication(
        booking.poster._id.equals(userId)
          ? "booking-declined"
          : "booking-cancelled",
        recieverFcmToken,
        {
          bookingId: req.params.id,
          message,
        }
      );
      res.sendStatus(200);
    });
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
