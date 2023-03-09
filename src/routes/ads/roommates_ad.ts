import { Router } from "express";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import { roommateQueryModifier } from "../../middlewares/ads";
import authentication from "../../middlewares/authentication";
import RoommateAdModel, {
  RoommateBookingModel as BookingModel,
} from "../../models/roommate_ad/schema";

const roommateAdRouter = Router();
export default roommateAdRouter;

roommateAdRouter.use(authentication);

roommateAdRouter.get("/my-ads/:id", async (req, res) => {
  try {
    const data = await RoommateAdModel.findById(req.params.id).populate(
      "poster",
      "-password"
    );
    if (data) res.json(data);
    else res.sendStatus(404);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

roommateAdRouter.get("/my-ads", async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;

    const skip = parseInt(req.query.skip as string) || 0;

    const data = await RoommateAdModel.find({ poster: userId })
      .limit(100)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate("poster", "-password");
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

roommateAdRouter.post("/", async (req, res) => {
  try {
    const data = await RoommateAdModel.create({
      ...req.body,
      poster: (req as CustomRequest).userId,
    });
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

roommateAdRouter.put("/:id", async (req, res) => {
  try {
    delete req.body.poster;

    const data = await RoommateAdModel.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

roommateAdRouter.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).userId;

    const ad = await RoommateAdModel.findOne({
      _id: req.params.id,
    });

    if (!ad) return res.sendStatus(404);

    if (!ad.poster.equals(userId)) return res.sendStatus(403);

    const booking = await BookingModel.findOne({
      ad: ad._id,
      checkOut: { $gte: new Date() },
    });

    if (booking)
      return res
        .status(400)
        .json({ code: "is-booked", "free-date": booking.checkOut });

    await ad.deleteOne();
    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

roommateAdRouter.post("/available", roommateQueryModifier, async (req, res) => {
  try {
    const skip = parseInt(req.body.skip as string) || 0;
    const requestBody = req.body;

    const query = {
      "type": requestBody.type,
      "address.location": { $in: requestBody.locations },
      "budget": {
        $gte: parseFloat(requestBody.minBudget + ""),
        $lte: parseFloat(requestBody.maxBudget + ""),
      },
      "isPremium": false,
    };

    const data = await RoommateAdModel.find(query)
      .limit(100)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate("poster", "-password -bankInfo");
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

roommateAdRouter.post("/premium", roommateQueryModifier, async (req, res) => {
  try {
    const skip = parseInt(req.body.skip as string) || 0;
    console.log(req.body);
    console.log("premium");

    const query = { "isPremium": true };

    const data = await RoommateAdModel.find(query)
      .limit(100)
      .skip(skip)
      .sort({ createdAt: -1 })
      .populate("poster", "-password -bankInfo");
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
