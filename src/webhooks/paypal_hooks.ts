import { Request, Response } from "express";
import TransactionModel from "../models/transaction/schema";
import UserModel from "../models/user/schema";
import {
  IOrderCapture,
  IPaypalPayout,
  IPaypalPayoutItem,
  IPaypalWebHook,
} from "../interfaces/paypal_interfaces";
import runInTransaction from "../functions/run_in_transaction";
import axios from "axios";
import FCMHelper from "../classes/fcm_helper";
import sendEmail from "../functions/emails";

export default function paypalHooksHandler(req: Request, res: Response) {
  const data = req.body as IPaypalWebHook;
  const event = data.event_type;

  switch (event) {
    case "PAYMENT.PAYOUTSBATCH.DENIED":
      handlePaypalPayoutFailed(req, res);
      break;

    case "PAYMENT.PAYOUTS-ITEM.BLOCKED":
    case "PAYMENT.PAYOUTS-ITEM.CANCELED":
    case "PAYMENT.PAYOUTS-ITEM.DENIED":
    case "PAYMENT.PAYOUTS-ITEM.FAILED":
    case "PAYMENT.PAYOUTS-ITEM.UNCLAIMED":
      handlePaypalPayoutItemFailed(req, res);
      break;
    case "PAYMENT.PAYOUTS-ITEM.SUCCEEDED": {
      handlePaypalPayoutItemSucceeded(req, res);
      break;
    }

    case "CHECKOUT.ORDER.APPROVED":
      handlePaypalOrderApproved(req, res);
      break;

    case "PAYMENT.AUTHORIZATION.VOIDED":
      handlePaypalOrderVoided(req, res);
      break;

    default:
      res.sendStatus(200);
  }
}

const handlePaypalPayoutItemSucceeded = async (req: Request, res: Response) => {
  try {
    await runInTransaction(async (session) => {
      const resource = req.body.resource as IPaypalPayoutItem;

      const transc = await TransactionModel.findOne({
        transactionId: resource.payout_batch_id,
        service: "PAYPAL",
      });

      if (!transc) return res.sendStatus(200);
      if (transc.status == "completed") return res.status(200);

      const user = await UserModel.findById(transc.userId);

      if (!user) return res.sendStatus(200);

      const fee = resource.payout_item_fee;

      await transc.updateOne(
        {
          $set: { fee: fee.value, originalFee: fee.value, status: "completed" },
        },
        { session }
      );

      const netAmount =
        parseInt(resource.payout_item.amount.value) +
        parseInt(resource.payout_item_fee.value);

      await UserModel.findByIdAndUpdate(
        transc.userId,
        { $inc: { accountBalance: -netAmount } },
        { session }
      );

      res.sendStatus(200);

      const message = `Your payout of ${transc.currency} ${transc.amount} have completed`;
      await FCMHelper.sendNofication("pay-out-completed", user.fcmToken, {
        message,
      });
      sendEmail({
        recieverEmail: user.email,
        message,
        subject: "Roomy Finder Payment",
      });
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const handlePaypalPayoutFailed = async (req: Request, res: Response) => {
  try {
    const resource = req.body.resource as IPaypalPayout;

    const transactionId = resource.batch_header.payout_batch_id;

    const transc = await TransactionModel.findOne({
      transactionId,
      service: "PAYPAL",
    });

    if (!transc) return res.sendStatus(200);
    if (transc.status == "completed") return res.status(200);

    const user = await UserModel.findById(transc.userId);

    if (!user) return res.sendStatus(200);

    await transc.updateOne({ $set: { status: "failed" } });

    res.sendStatus(200);

    // send notification
    const message = `Your payout of ${transc.currency} ${transc.amount} have failed`;
    await FCMHelper.sendNofication("pay-out-failed", user.fcmToken, {
      message,
    });
    sendEmail({
      recieverEmail: user.email,
      message,
      subject: "Roomy Finder Payment",
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const handlePaypalPayoutItemFailed = async (req: Request, res: Response) => {
  try {
    const resource = req.body.resource as IPaypalPayoutItem;

    const transactionId = resource.payout_batch_id;

    const transc = await TransactionModel.findOne({
      transactionId,
      service: "PAYPAL",
    });

    if (!transc) return res.sendStatus(200);
    if (transc.status == "completed") return res.status(200);

    const user = await UserModel.findById(transc.userId);

    if (!user) return res.sendStatus(200);

    await transc.updateOne({ $set: { status: "failed" } });

    res.sendStatus(200);

    // send notification
    const message = `Your rent payment of ${transc.currency} ${transc.amount} have failed`;
    await FCMHelper.sendNofication(
      "pay-property-rent-fee-failed-client",
      user.fcmToken,
      { message }
    );
    sendEmail({
      recieverEmail: user.email,
      message,
      subject: "Roomy Finder Payment",
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const handlePaypalOrderApproved = async (req: Request, res: Response) => {
  try {
    const { resource } = req.body;

    await runInTransaction(async (session) => {
      const transactionId = resource.id;

      const transc = await TransactionModel.findOne({
        transactionId,
        service: "PAYPAL",
      }).session(session);

      if (!transc) return res.sendStatus(404);
      if (transc.status == "completed") return res.status(200);

      const user = await UserModel.findById(transc.userId);

      if (!user) return res.sendStatus(404);

      const captureLink = transc.extra.captureLink as string;

      const response = await axios({
        headers: {
          "Prefer": "return=representation",
          "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
          "Content-Type": "application/JSON",
        },
        url: captureLink,
        method: "post",
      });

      const capturedData = response.data as IOrderCapture;
      const lastCapture = capturedData.purchase_units[0].payments.captures[0];

      if (
        capturedData.status == "COMPLETED" &&
        lastCapture.final_capture == true
      ) {
        await transc.updateOne(
          {
            $set: {
              status: "completed",
              fee: lastCapture.seller_receivable_breakdown.paypal_fee.value,
              originalFee:
                lastCapture.seller_receivable_breakdown.paypal_fee.value,
              currency: lastCapture.amount.currency_code,
            },
          },
          { session }
        );

        res.sendStatus(200);

        // send notification
        const message = `Your rent payment of ${transc.currency} ${transc.amount} have completed`;
        await FCMHelper.sendNofication(
          "pay-property-rent-fee-failed-client",
          user.fcmToken,
          { message }
        );
        sendEmail({
          recieverEmail: user.email,
          message,
          subject: "Roomy Finder Payment",
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

const handlePaypalOrderVoided = async (req: Request, res: Response) => {
  try {
    const resource = req.body.resource;

    const transc = await TransactionModel.findOne({
      transactionId: resource.id,
      service: "PAYPAL",
    });

    if (!transc) return res.sendStatus(200);
    if (transc.status == "completed") return res.status(200);

    const user = await UserModel.findById(transc.userId);

    if (!user) return res.sendStatus(200);

    await transc.updateOne({ $set: { status: "failed" } });

    res.sendStatus(200);

    // send notification
    const message = `Your rent payment of ${transc.currency} ${transc.amount} have failed`;
    await FCMHelper.sendNofication(
      "pay-property-rent-fee-failed-client",
      user.fcmToken,
      { message }
    );
    sendEmail({
      recieverEmail: user.email,
      message,
      subject: "Roomy Finder Payment",
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};
