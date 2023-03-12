import { Router } from "express";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import UserModel from "../../models/user/schema";
import bcrypt from "bcrypt";
import { PAYPAL_API_URL, SERVER_URL } from "../../data/constants";
import Axios, { AxiosError } from "axios";
import { randomUUID } from "crypto";
import { generatePaypalToken } from "../../functions/generate_token";
import stripeAPI from "stripe";
import {
  STRIPE_SECRET_KEY,
  STRIPE_UPGRADE_PLAN_PRICE_ID,
} from "../../data/constants";

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

const profileRouter = Router();
export default profileRouter;

profileRouter.delete(
  "/remove-profile-picture",
  authentication,
  async (req, res) => {
    try {
      const userId = (req as CustomRequest).userId;
      UserModel.updateOne({ _id: userId }, { $set: { pp: null } });

      res.sendStatus(204);
    } catch (error: any) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);
profileRouter.get("/profile-info", async (req, res) => {
  try {
    const user = await UserModel.findOne(
      { _id: req.query.userId },
      { profilePicture: 1, fcmToken: 1 }
    );

    if (!user) return res.sendStatus(404);
    res.json({
      profilePicture: user.profilePicture,
      fcmToken: user.fcmToken,
    });
  } catch (error: any) {
    console.log(error);
    res.sendStatus(500);
  }
});

// update password
profileRouter.put("/password", authentication, async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const user = await UserModel.findById(userId, { password: 1 });

    if (!user) return res.sendStatus(404);
    if (!bcrypt.compareSync(oldPassword, user.password))
      return res.sendStatus(403);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount == 1) return res.sendStatus(200);

    res.sendStatus(404);
  } catch (error: any) {
    console.log(error);
    res.sendStatus(500);
  }
});

// update profile
profileRouter.put("/credentials", authentication, async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;

    delete req.body.balance;
    delete req.body.password;

    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: req.body }
    );

    if (result.modifiedCount == 1) return res.sendStatus(200);

    res.sendStatus(404);
  } catch (error: any) {
    console.log(error);
    res.sendStatus(500);
  }
});

profileRouter.post("/upgrade-plan/paypal", authentication, async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;
    const user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ code: "user-not-found" });
    if (user.isPremium)
      return res.status(409).json({ code: "already-premium" });

    //TODO : Remove *0.27 in production and change currency to AED
    const amount = Math.ceil(250 * 0.27);
    const currency = "USD";

    const paymentData = {
      "intent": "CAPTURE",
      "purchase_units": [
        {
          "items": [
            {
              "name": "Roomy Finder Rent feee payment",
              "description": `Roomy Finder Premium plan ugrade fee`,
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
        "return_url": successUrl + "?action=planUpgrade&userId=" + userId,
        "cancel_url": cancelUrl + "?action=planUpgrade&userId=" + userId,
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

profileRouter.post("/upgrade-plan/stripe", authentication, async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;

    const user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ code: "user-not-found" });
    if (user.isPremium)
      return res.status(409).json({ code: "already-premium" });

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: STRIPE_UPGRADE_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl + "?action=planUpgrade&userId=" + userId,
      cancel_url: cancelUrl + "?action=planUpgrade&userId=" + userId,
      metadata: { userId, object: "UPGRADE_TO_PREMIUM" },
      customer_email: user.email,
    });

    res.json({ paymentUrl: session.url + "" });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
