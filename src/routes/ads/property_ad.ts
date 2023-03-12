import { Router } from "express";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import { createQueryModifier } from "../../middlewares/ads";
import authentication from "../../middlewares/authentication";
import PropertyAdModel from "../../models/property_ad/schema";
import UserModel from "../../models/user/schema";

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
    const userId = (req as CustomRequest).userId;
    const skip = parseInt(req.query.skip as string) || 0;

    const data = await PropertyAdModel.find({
      poster: userId,
      isPostPaid: true,
    })
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

propertyAdRouter.post("/", async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;
    const user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ code: "user-not-found" });

    if (req.body.deposit) {
      if (!parseFloat(req.body.depositPrice + "")) {
        delete req.body;
        req.body.deposit = false;
      }
    } else {
      delete req.body.depositPrice;
    }

    const ad = await PropertyAdModel.create({
      ...req.body,
      poster: (req as CustomRequest).userId,
    });

    const ad2 = await PropertyAdModel.findOne({ _id: ad._id });

    console.log(ad2);

    res.json(ad);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

propertyAdRouter.put("/:id", async (req, res) => {
  try {
    if (req.body.deposit) {
      if (!parseFloat(req.body.depositPrice + "")) {
        delete req.body.depositPrice;
        req.body.deposit = false;
      }
    } else {
      delete req.body.depositPrice;
    }

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
    const userId = (req as any).userId;

    const ad = await PropertyAdModel.findOne({
      _id: req.params.id,
      poster: userId,
    });

    if (!ad) return res.sendStatus(404);
    if (ad.quantityTaken != 0) {
      return res.status(400).json({ code: "is-booked" });
    }

    if (!ad.poster.equals(userId)) return res.sendStatus(403);

    await ad.deleteOne();
    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});

propertyAdRouter.get("/available", createQueryModifier, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;

    const query = req.query;

    const data = await PropertyAdModel.find({
      "address.city": query.city,
      "address.location": query.location,
    })

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
