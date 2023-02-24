import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";
import runInTransaction from "../../functions/run_in_transaction";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import DealModel from "../../models/deal/schema";
import PropertyAdModel from "../../models/property_ad/schema";

const dealRouter = Router();
export default dealRouter;
dealRouter.use(authentication);

dealRouter.get("/", async (req, res) => {
  const skip = parseInt(req.query.skip as string) || 0;

  const userId = (req as CustomRequest).userId;

  try {
    const data = await DealModel.find({ client: userId })
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

dealRouter.post("/:id/end", async (req, res) => {
  try {
    const userId = (req as any).userId;
    const deal = await DealModel.findOne({
      _id: req.params.id,
      poster: userId,
    }).populate([
      { path: "poster" },
      { path: "client", select: "-password -bankInfo" },
      { path: "ad" },
    ]);

    if (!deal) return res.sendStatus(404);

    await runInTransaction(async (session) => {
      await DealModel.deleteOne(
        { $or: [{ client: userId }, { poster: userId }] },
        { session }
      );

      if (deal.adType == "PROPERTY") {
        await PropertyAdModel.updateOne(
          { _id: deal.ad },
          { $inc: { quantityTaken: -1 } },
          { session }
        );
      }
    });
    FCMHelper.sendNofication(
      "deal-ended",
      userId == deal.poster.id ? deal.client.fcmToken : deal.poster.fcmToken,
      {
        deal: JSON.stringify(deal),
        endedBy: userId == deal.poster.id ? "poster" : "client",
      }
    );

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

dealRouter.post("/:id/pay", async (req, res) => {
  try {
    res.sendStatus(200);

    const recieverFcmToken = req.body.recieverFcmToken;

    FCMHelper.sendNofication("deal-paid", recieverFcmToken, {});
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
