import { Router } from "express";
import stripeAPI from "stripe";
import FCMHelper from "../classes/fcm_helper";
import {
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SIGNING_SECRET,
} from "../data/constants";
import runInTransaction from "../functions/run_in_transaction";
import PropertyAdModel, {
  PropertyBookingModel,
} from "../models/property_ad/schema";
import UserModel from "../models/user/schema";

const stripe = new stripeAPI(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

const stripeWebHookHandler = Router();

export default stripeWebHookHandler;

const createOrder = (session: any) => {};

const emailCustomerAboutFailedPayment = (session: any) => {};

stripeWebHookHandler.post("/", async (request, response) => {
  try {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        sig as any,
        STRIPE_WEBHOOK_SIGNING_SECRET
      );
    } catch (err: any) {
      console.log(err);
      return response.status(400).send(`Webhook Error: ${err?.message}`);
    }

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        // Save an order in your database, marked as 'awaiting payment'
        createOrder(session);

        // Check if the order is paid (for example, from a card payment)
        //
        // A delayed notification payment will have an `unpaid` status, as
        // you're still waiting for funds to be transferred from the customer's
        // account.
        if ((session as any).payment_status === "paid") {
          switch ((session as any).metadata.object) {
            case "PAY_PROPERTY_RENT":
              const resp1 = await handleStripeRentPaySucceded(session);

              return response.status(resp1).end();
            case "UPGRADE_TO_PREMIUM":
              const resp2 = await handleStripePlanUpgrageSucceded(session);

              return response.status(resp2).end();

            default:
              break;
          }
        }

        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object;

        // Send an email to the customer asking them to retry their order
        emailCustomerAboutFailedPayment(session);

        break;
      }
    }

    response.status(200).end();
  } catch (error) {
    console.log(error);
    response.status(500).end();
  }
});

async function handleStripeRentPaySucceded(stripeEvent: any): Promise<number> {
  try {
    await runInTransaction(async (session) => {
      const booking = await PropertyBookingModel.findByIdAndUpdate(
        stripeEvent.metadata.bookingId,
        {
          $set: {
            isPayed: true,
            paymentService: "STRIPE",
            extra: { checkOutId: stripeEvent.id },
          },
        },
        { session, new: true }
      );

      if (!booking) return 400;

      const ad = await PropertyAdModel.findById(booking.ad._id);
      const client = await UserModel.findById(booking.client._id);
      const poster = await UserModel.findById(booking.poster._id);

      const clientMessage =
        `Dear ${client?.firstName} ${client?.lastName},` +
        " your payment for the renting of " +
        ` ${ad?.type} located ${ad?.address.city} has commpleted successfully.` +
        ` You can now see the landlord information and chat with ${
          poster?.gender == "Male" ? "him" : "her"
        }.`;

      FCMHelper.sendNofication(
        "pay-property-rent-fee-completed-client",
        client?.fcmToken || booking.client.fcmToken,
        {
          message: clientMessage,
          bookingId: booking.id + "",
        }
      );

      const landlordMessage =
        `Dear ${poster?.firstName} ${poster?.lastName},` +
        " we are happy to tell you that a tenant have completed the payment of your property, " +
        ` ${ad?.type} located ${ad?.address.city}.` +
        ` You can now see the tenant information and chat with ${
          client?.gender == "Male" ? "him" : "her"
        }.`;

      FCMHelper.sendNofication(
        "pay-property-rent-fee-completed-landlord",
        poster?.fcmToken || booking.poster.fcmToken,
        {
          message: landlordMessage,
          bookingId: booking.id + "",
        }
      );
    });

    return 200;
  } catch (error) {
    console.log(error);
    return 500;
  }
}
async function handleStripePlanUpgrageSucceded(
  stripeEvent: any
): Promise<number> {
  try {
    await runInTransaction(async (session) => {
      const user = await UserModel.findByIdAndUpdate(
        stripeEvent.metadata.userId,
        { $set: { isPremium: true } },
        { session, new: true }
      );

      if (!user) return 400;

      const message =
        `Dear ${user?.firstName} ${user?.lastName},` +
        ` You have successfully upgraded your plan to premiun.`;

      FCMHelper.sendNofication("plan-upgraded-successfully", user.fcmToken, {
        message: message,
      });
    });

    return 200;
  } catch (error) {
    console.log(error);
    return 500;
  }
}
