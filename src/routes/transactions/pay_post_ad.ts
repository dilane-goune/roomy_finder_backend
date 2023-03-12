import { Router } from "express";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import UserModel from "../../models/user/schema";
import stripeAPI from "stripe";
import { STRIPE_SECRET_KEY } from "../../data/constants";

const STRIPE_POST_PROPERTY_AD_PRICE_ID = "prod_NTww1qvf7zA2eI";

const stripe = new stripeAPI(STRIPE_SECRET_KEY, { apiVersion: "2022-11-15" });

const payPostPropertyAdRouter = Router();

payPostPropertyAdRouter.use(authentication);

export default payPostPropertyAdRouter;

payPostPropertyAdRouter.post("pay-post-property-ad", async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;
    const user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ code: "user-not-found" });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: STRIPE_POST_PROPERTY_AD_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `example.com/success.html`,
      cancel_url: `example.com/cancel.html`,
    });

    res.json({ paymentURL: session.url + "" });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
