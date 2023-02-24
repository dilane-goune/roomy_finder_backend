import { Router } from "express";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import { createQueryModifier } from "../../middlewares/ads";
import authentication from "../../middlewares/authentication";
import PropertyAdModel from "../../models/property_ad/schema";

const propertyAdRouter = Router();
export default propertyAdRouter;

propertyAdRouter.use(authentication);

propertyAdRouter.get("/my-ads/:id", async (req, res) => {
  try {
    const data = await PropertyAdModel.findById(req.params.id).populate(
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

propertyAdRouter.get("/my-ads", async (req, res) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;

    const query = {};

    const data = await PropertyAdModel.find(query)
      .limit(100)
      .skip(skip)
      .populate("poster", "-password");
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

propertyAdRouter.post("/", async (req, res) => {
  try {
    const data = await PropertyAdModel.create({
      ...req.body,
      poster: (req as CustomRequest).userId,
    });
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

propertyAdRouter.put("/:id", async (req, res) => {
  try {
    const data = await PropertyAdModel.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

propertyAdRouter.delete("/:id", async (req, res) => {
  try {
    const result = await PropertyAdModel.deleteOne({ _id: req.params.id });
    if (result.deletedCount == 0) res.sendStatus(204);
    else res.sendStatus(404);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

propertyAdRouter.get("/available", createQueryModifier, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;

    const query = { isAvailable: true, ...req.query };

    const data = await PropertyAdModel.find(query)
      .limit(100)
      .skip(skip)
      .populate("poster", "-password -bankInfo");

    res.json(data);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
