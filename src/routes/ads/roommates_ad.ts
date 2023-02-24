import { Router } from "express";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import { roommateQueryModifier } from "../../middlewares/ads";
import authentication from "../../middlewares/authentication";
import RoommateAdModel from "../../models/roommate_ad/schema";

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
    const skip = parseInt(req.query.skip as string) || 0;

    const query = {};

    const data = await RoommateAdModel.find(query)
      .limit(100)
      .skip(skip)
      .populate("poster", "-password");
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

roommateAdRouter.post("/", async (req, res) => {
  try {
    console.log(req.body);
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
    const result = await RoommateAdModel.deleteOne({ _id: req.params.id });
    if (result.deletedCount == 0) res.sendStatus(204);
    else res.sendStatus(404);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

roommateAdRouter.post("/available", roommateQueryModifier, async (req, res) => {
  try {
    const skip = parseInt(req.body.skip as string) || 0;

    const requestBody = req.body;

    const data = await RoommateAdModel.find({
      "socialPreferences.gender": requestBody.gender,
      "address.location": { $in: requestBody.locations },
      "budget": {
        $gte: parseFloat(requestBody.minBudget + ""),
        $lte: parseFloat(requestBody.maxBudget + ""),
      },
    })
      .limit(100)
      .skip(skip)
      .populate("poster", "-password -bankInfo");
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
