import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";
import runInTransaction from "../../functions/run_in_transaction";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import PropertyAdModel, {
  PropertyBookingModel,
} from "../../models/property_ad/schema";
import UserModel from "../../models/user/schema";
import stripeAPI from "stripe";
import {
  PAYPAL_API_URL,
  SERVER_URL,
  STRIPE_SECRET_KEY,
} from "../../data/constants";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { randomUUID } from "crypto";
import Axios, { AxiosError } from "axios";
import { generatePaypalToken } from "../../functions/generate_token";

dayjs.extend(localizedFormat);

const stripe = new stripeAPI(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

const successUrl = `${SERVER_URL}/rent-payemt/success`;
const cancelUrl = `${SERVER_URL}/rent-payemt/cancel`;

const axios = Axios.create({
  baseURL: PAYPAL_API_URL,
  headers: {
    "Content-Type": "application/json",
    "PayPal-Request-Id": "339987fb-ff64-435e-9def-6a728d33a865",
    "Authorization": `Bearer ${process.env.PAYPAL_TOKEN}`,
  },
});

axios.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalConfig = error.config;
    if (!originalConfig) return Promise.reject(error);

    if (error.response) {
      if (error.response.status === 401 && !(originalConfig as any)._retry) {
        (originalConfig as any)._retry = true;

        const token = await generatePaypalToken();

        if (!token) return Promise.reject(error);

        return axios({
          ...originalConfig,
          headers: {
            ...originalConfig.headers,
            "Authorization": "Bearer " + token,
          },
        });
      }
    }

    return Promise.reject(error);
  }
);

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

    const ad = await PropertyAdModel.findById(adId);
    if (!ad) return res.status(400).json({ "code": "ad-not-found" });

    const pendingBooking = await PropertyBookingModel.findOne({
      poster: ad.poster._id,
      client: userId,
      ad: adId,
      status: "pending",
    });

    if (pendingBooking)
      return res.status(409).json({ "code": "have-pending-booking" });

    const landlord = await UserModel.findById(ad.poster._id);
    const client = await UserModel.findById(userId);

    if (!landlord)
      return res.status(400).json({ "code": "landlord-not-found" });
    if (!client) return res.status(400).json({ "code": "client-not-found" });

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

    res.json({ bookingId: booking.id });

    const message =
      `Congratulations. You got booked for ${ad.type} ${booking.rentType}.\n` +
      `Check in : ${dayjs(booking.checkIn).format("LL")}\n` +
      `Check out : ${dayjs(booking.checkOut).format("LL")}`;

    FCMHelper.sendNofication("new-booking", landlord.fcmToken, {
      "bookingId": booking.id.toString(),
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
              `Auto Reject : Dear ${client.firstName} ${client.lastName},` +
              ` We are soory to tell you that your booking of ${ad.type} in ${ad.address.city}` +
              ` ${landlord.firstName} ${landlord.lastName}` +
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
      fiftheenMinutes * 4 - 50,
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
    }).populate([{ path: "poster" }, { path: "client" }]);

    if (!booking) return res.sendStatus(404);
    if (booking.status == "offered") return res.sendStatus(409);

    const ad = await PropertyAdModel.findById(booking.ad._id);
    const client = await UserModel.findById(booking.client._id);

    if (!ad) return res.sendStatus(404);

    if (ad.quantity == ad.quantityTaken) {
      return res.status(400).json({ code: "unavailable" });
    }

    await runInTransaction(async (session) => {
      await booking.updateOne({ $set: { status: "offered" } }, { session });
      await ad.updateOne(
        { $inc: { quantityTaken: booking.quantity } },
        { session }
      );
    });

    res.sendStatus(200);

    const clientMessage =
      `Congratulations. Your rent request to ${ad.type} in ${ad.address.city} has been approved. ` +
      "Please pay the rent fee amount to get futher with the landlord " +
      "contact information details and check in your new place now !";
    FCMHelper.sendNofication(
      "booking-offered",
      client?.fcmToken || booking.client.fcmToken,
      {
        message: clientMessage,
        "bookingId": booking.id.toString(),
      }
    );
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.post("/lanlord/cancel", async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;

    await runInTransaction(async (session) => {
      const booking = await PropertyBookingModel.findById({
        _id: req.body.bookingId,
      }).populate([
        { path: "poster" },
        { path: "client", select: "-password -bankInfo" },
        { path: "ad", populate: "poster" },
      ]);

      if (!booking) return res.sendStatus(404);
      if (booking.poster.id != userId) return res.sendStatus(403);
      if (booking.status != "pending")
        return res.status(400).json({ code: "booking-accepted" });

      await booking.deleteOne({ session });

      const message =
        `Dear ${booking.client.firstName} ${booking.client.lastName},` +
        " sorry the property you choose is not more available. Please choose another option";

      FCMHelper.sendNofication("booking-declined", booking.client.fcmToken, {
        bookingId: booking.id,
        message,
      });
      res.sendStatus(200);
    });
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
bookingRouter.post("/tenant/cancel", async (req, res) => {
  try {
    const userId = (req as any).userId;

    await runInTransaction(async (session) => {
      const booking = await PropertyBookingModel.findById({
        _id: req.body.bookingId,
      }).populate([
        { path: "poster" },
        { path: "client", select: "-password -bankInfo" },
        { path: "ad", populate: "poster" },
      ]);

      if (!booking) return res.sendStatus(404);
      if (booking.client.id != userId) return res.sendStatus(403);
      if (booking.status != "pending")
        return res.status(400).json({ code: "booking-accepted" });

      await booking.deleteOne({ session });

      const message =
        `Dear ${booking.poster.firstName} ${booking.poster.lastName},` +
        " a client just cancelled her booking of your property " +
        `${booking.ad.type} in ${booking.ad.address.city}.`;

      FCMHelper.sendNofication("booking-cancelled", booking.poster.fcmToken, {
        bookingId: booking.id + "",
        message,
      });
      res.sendStatus(200);
    });
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

bookingRouter.post(
  "/stripe/create-pay-booking-checkout-session",
  async (req, res) => {
    try {
      const userId = (req as any).userId;
      const booking = await PropertyBookingModel.findOne({
        _id: req.body.bookingId,
        client: userId,
      }).populate([{ path: "poster" }, { path: "client" }, { path: "ad" }]);

      if (!booking) return res.status(404).json({ code: "booking-not-found" });
      if (booking.isPayed) return res.sendStatus(409);

      let rentFee: number;
      let commissionFee: number;

      // The difference in milliseconds between the checkout and the checkin date
      const checkOutCheckInMillisecondsDifference =
        booking.checkOut.getTime() - booking.checkIn.getTime();

      // The number of periods(days,weeks,monyhs) the rent will last
      let rentTypePeriod: number;

      switch (booking.rentType) {
        case "Monthly":
          const oneMothDuration = 1000 * 3600 * 24 * 30;
          rentTypePeriod = Math.ceil(
            checkOutCheckInMillisecondsDifference / oneMothDuration
          );
          break;
        case "Weekly":
          const oneWeekDuration = 1000 * 3600 * 24 * 7;
          rentTypePeriod = Math.ceil(
            checkOutCheckInMillisecondsDifference / oneWeekDuration
          );
          break;
        default:
          const oneDayDuration = 1000 * 3600 * 24;
          rentTypePeriod = Math.ceil(
            checkOutCheckInMillisecondsDifference / oneDayDuration
          );
          break;
      }
      // Calculating the rent fee  and commission bases on the rent type and duration
      switch (booking.rentType) {
        case "Monthly":
          rentFee = booking.ad.monthlyPrice * booking.quantity * rentTypePeriod;
          commissionFee = rentFee * 0.1;
          break;
        case "Weekly":
          rentFee = booking.ad.weeklyPrice * booking.quantity * rentTypePeriod;
          commissionFee = rentFee * 0.1;
          break;
        default:
          rentFee = booking.ad.dailyPrice * booking.quantity * rentTypePeriod;
          commissionFee = rentFee * 0.05;
          break;
      }

      // TAV
      const tavFee = commissionFee * 0.05;
      const servicFee = (rentFee + commissionFee + tavFee) * 0.03;

      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "aed",
              product_data: {
                name: "Property rent fee",
                description:
                  `Rent fee for  ${booking.quantity} ${booking.ad.type}` +
                  ` at  ${booking.ad.address.location}.`,
              },
              //multiple by 100 to remove since stripe consider it in cent
              unit_amount:
                Math.ceil(rentFee + commissionFee + tavFee + servicFee) * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: successUrl + "?bookingId=" + booking.id,
        cancel_url: cancelUrl + "?bookingId=" + booking.id,
        metadata: {
          object: "PAY_PROPERTY_RENT",
          bookingId: booking.id,
          userId,
        },
        customer_email: booking.client.email,
      });

      // res.redirect(303, session.url);
      res.json({ paymentUrl: session.url });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

bookingRouter.post("/paypal/create-payment-link", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const booking = await PropertyBookingModel.findOne({
      _id: req.body.bookingId,
      client: userId,
    }).populate([{ path: "poster" }, { path: "client" }, { path: "ad" }]);

    if (!booking) return res.status(404).json({ code: "booking-not-found" });
    if (booking.isPayed) return res.sendStatus(409);

    let rentFee: number;
    let commissionFee: number;

    // The difference in milliseconds between the checkout and the checkin date
    const checkOutCheckInMillisecondsDifference =
      booking.checkOut.getTime() - booking.checkIn.getTime();

    // The number of periods(days,weeks,monyhs) the rent will last
    let rentTypePeriod: number;

    switch (booking.rentType) {
      case "Monthly":
        const oneMothDuration = 1000 * 3600 * 24 * 30;
        rentTypePeriod = Math.ceil(
          checkOutCheckInMillisecondsDifference / oneMothDuration
        );
        break;
      case "Weekly":
        const oneWeekDuration = 1000 * 3600 * 24 * 7;
        rentTypePeriod = Math.ceil(
          checkOutCheckInMillisecondsDifference / oneWeekDuration
        );
        break;
      default:
        const oneDayDuration = 1000 * 3600 * 24;
        rentTypePeriod = Math.ceil(
          checkOutCheckInMillisecondsDifference / oneDayDuration
        );
        break;
    }
    // Calculating the rent fee  and commission bases on the rent type and duration
    switch (booking.rentType) {
      case "Monthly":
        rentFee = booking.ad.monthlyPrice * booking.quantity * rentTypePeriod;
        commissionFee = rentFee * 0.1;
        break;
      case "Weekly":
        rentFee = booking.ad.weeklyPrice * booking.quantity * rentTypePeriod;
        commissionFee = rentFee * 0.1;
        break;
      default:
        rentFee = booking.ad.dailyPrice * booking.quantity * rentTypePeriod;
        commissionFee = rentFee * 0.05;
        break;
    }

    // TAV
    const tavFee = commissionFee * 0.05;
    const servicFee = (rentFee + commissionFee + tavFee) * 0.03;

    //TODO : Remove *0.27 in production and change currency to AED
    const amount = Math.ceil(
      (rentFee + commissionFee + tavFee + servicFee) * 0.27
    );
    const currency = "USD";

    const paymentData = {
      "intent": "CAPTURE",
      "purchase_units": [
        {
          "items": [
            {
              "name": "Roomy Finder Rent feee payment",
              "description":
                `Rent fee for  ${booking.quantity} ${booking.ad.type}` +
                ` at  ${booking.ad.address.location}.`,
              "quantity": "1",
              "unit_amount": {
                "currency_code": currency,
                "value": "" + amount,
              },
            },
          ],
          "amount": {
            "currency_code": currency,
            "value": "" + amount,
            "breakdown": {
              "item_total": {
                "currency_code": currency,
                "value": "" + amount,
              },
            },
          },
        },
      ],
      // TODO : Add the return and cancel urls
      "application_context": {
        "return_url": successUrl + "?bookingId=" + booking.id,
        "cancel_url": cancelUrl + "?bookingId=" + booking.id,
      },
    };

    const response = await axios.post("/v2/checkout/orders", paymentData, {
      headers: {
        "Prefer": "return=minimal",
        "PayPal-Request-Id": randomUUID(),
        "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
      },
    });

    if (response.status != 201) return res.sendStatus(406);

    const data = response.data;

    const links = data.links as {
      href: string;
      rel: "self" | "approve" | "capture";
      method: "GET" | "POST" | "PATCH";
    }[];

    // res.redirect(303, session.url);
    res.json({ paymentUrl: links[1].href });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

bookingRouter.post("/pay-cash", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const booking = await PropertyBookingModel.findOne({
      _id: req.body.bookingId,
      client: userId,
    });

    if (!booking) return res.status(404).json({ code: "booking-not-found" });
    if (booking.isPayed) return res.sendStatus(409);
    await booking.updateOne({ $set: { isPayed: true } });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});
