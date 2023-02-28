import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";
import runInTransaction from "../../functions/run_in_transaction";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import PropertyAdModel, {
  PropertyBookingModel,
} from "../../models/property_ad/schema";
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
    const data = await PropertyBookingModel.find({
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
    const quantity = parseInt(req.body.quantity + "");
    if (!quantity) return res.sendStatus(400);

    const landlord = await UserModel.findById(req.body.landlordId);
    const client = await UserModel.findById(userId);
    const ad = await PropertyAdModel.findById(adId);

    if (!landlord)
      return res.status(400).json({ "code": "landlord-not-found" });
    if (!client) return res.status(400).json({ "code": "client-not-found" });
    if (!ad) return res.status(400).json({ "code": "ad-not-found" });

    if (ad.quantity - ad.quantityTaken < quantity)
      return res.status(400).json({
        code: "quantity-not-enough",
        "possible": ad.quantity - ad.quantityTaken,
      });

    if (landlord.id == userId) return res.sendStatus(403);

    const booking = await PropertyBookingModel.create({
      ...req.body,
      client: userId,
      poster: landlord,
      ad: adId,
    });

    res.sendStatus(200);

    const message =
      `Dear ${landlord.firstName} ${landlord.lastName},` +
      " We are happy to tell you that a " +
      client.type +
      `, '${client.firstName} ${client.lastName}'` +
      " have book your property, " +
      ` '${ad.type} in ${ad.address.city}'. Now, you can either accept or decline the booking.`;

    FCMHelper.sendNofication("new-booking", landlord.fcmToken, {
      bookingId: booking._id.toString(),
      "ad": ad.type,
      message,
    });

    const fiftheenMinutes = 1000 * 60 * 15;

    const reminderInterval = setInterval(
      async (booking, landlord, client) => {
        try {
          const bc = await PropertyBookingModel.findById(booking._id, {
            status: 1,
          });

          if (bc?.status == "pending") {
            const message =
              `Reminder : Dear ${landlord.firstName} ${landlord.lastName},` +
              " We are happy to tell you that a " +
              client.type +
              `, '${client.firstName} ${client.lastName}'` +
              " have book your property, " +
              ` '${ad.type} in ${ad.address.city}'. Now, you can either accept or decline the booking.`;

            FCMHelper.sendNofication("auto-reply", landlord.fcmToken, {
              bookingId: booking._id.toString(),
              "ad": ad.type,
              message,
            });
          } else {
            clearInterval(reminderInterval);
          }
        } catch (e) {
          console.error(e);
        }
      },
      fiftheenMinutes,
      booking,
      landlord,
      client
    );

    setTimeout(
      async (booking, landlord, client, ad) => {
        try {
          const bc = await PropertyBookingModel.findById(booking._id, {
            status: 1,
          });
          if (bc?.status == "pending") {
            const messageToPoster =
              `Auto Reject : \nDear ${landlord.firstName} ${landlord.lastName},` +
              " We are have autommatically rejected the booking of  '${ad.type} in ${ad.address.city}'" +
              `, sent by '${client.firstName} ${client.lastName}' due to no reply.`;

            FCMHelper.sendNofication("auto-reply", landlord.fcmToken, {
              message: messageToPoster,
            });

            const messageToClient =
              `Auto Reject : Dear ${booking.client.firstName} ${booking.client.lastName},` +
              ` We are soory to tell you that your booking of ${ad.type} in ${ad.address.city}` +
              ` ${booking.poster.firstName} ${booking.poster.lastName}` +
              " have been cancel due to unresponsive Landlord.";

            FCMHelper.sendNofication("auto-reply", client.fcmToken, {
              message: messageToClient,
            });

            await bc?.deleteOne();
          }
        } catch (e) {
          console.error(e);
        } finally {
          clearInterval(reminderInterval);
        }
      },
      fiftheenMinutes,
      booking,
      landlord,
      client,
      ad
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
    const booking = await PropertyBookingModel.findOne({
      _id: req.params.id,
      poster: userId,
    }).populate([
      { path: "poster" },
      { path: "client", select: "-password -bankInfo" },
    ]);

    if (!booking) return res.sendStatus(404);

    const ad = await PropertyAdModel.findById(booking.ad._id);

    if (!ad) return res.sendStatus(404);

    if (ad.quantity == ad.quantityTaken) {
      return res.status(400).json({ code: "unavailable" });
    }

    await runInTransaction(async (session) => {
      await booking.updateOne({ $set: { status: "offered" } }, { session });
      await ad.updateOne(
        { $inc: { quantityTaken: -booking.quantity } },
        { session }
      );
    });

    const message =
      `Dear ${booking.client.firstName} ${booking.client.lastName},` +
      " We are happy to tell you that the landlord," +
      ` ${booking.poster.firstName} ${booking.poster.lastName}` +
      " have accepted your booking of the" +
      ` ${ad.type} in ${ad.address.city}. Now, you can have to pay the renting fee.`;

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

    await runInTransaction(async (session) => {
      const booking = await PropertyBookingModel.findById({
        _id: req.params.id,
      }).populate([
        { path: "poster" },
        { path: "client", select: "-password -bankInfo" },
        { path: "ad", populate: "poster" },
      ]);

      if (!booking) return res.sendStatus(404);

      if (booking.poster.id != userId && booking.client.id != userId)
        return res.sendStatus(403);
      if (booking.status == "offered")
        return res.status(400).json({ code: "offered" });

      let message: string;
      if (booking.poster._id.equals(userId)) {
        message =
          `Dear ${booking.client.firstName} ${booking.client.lastName},` +
          " We appoligize that the Lanlord declined your booking of the property" +
          `${booking.ad.type} in ${booking.ad.address.city}. ` +
          "Check out simmillar properties for search.";
      } else {
        message =
          `Dear ${booking.poster.firstName} ${booking.poster.lastName},` +
          " a client just cancelled her booking of your property " +
          `${booking.ad.type} in ${booking.ad.address.city}.`;
      }

      const recieverFcmToken = req.body.recieverFcmToken;

      await PropertyAdModel.updateOne(
        { _id: booking.ad._id },
        { $inc: { quantityTaken: booking.quantity } },
        { session }
      );
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
