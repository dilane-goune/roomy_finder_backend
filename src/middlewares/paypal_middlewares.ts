import axios from "axios";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { PAYPAL_API_URL, PAYPAL_WEBHOOK_ID } from "../data/constants";

export function paypalPayoutValidator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const payoutSchema = Joi.object({
    amount: Joi.number().min(0).required(),
    email: Joi.string().email().required(),
    currency: Joi.string().trim().required(),
    userPassword: Joi.string().required(),
  });

  const { error, value } = payoutSchema.validate(req.body);

  if (error) return res.status(400).json({ error });

  req.body = value;

  next();
}

export async function verifyPaypalSignature(
  req: Request,
  res: Response,
  next: NextFunction
) {
  return next();
  // TODO : fix paypal verifacition
  let headers = req.headers;
  let data = {
    "webhook_id": PAYPAL_WEBHOOK_ID,
    "transmission_id": headers["paypal-transmission-id"],
    "transmission_time": headers["paypal-transmission-time"],
    "cert_url": headers["paypal-cert-url"],
    "auth_algo": headers["paypal-auth-algo"],
    "transmission_sig": headers["paypal-transmission-sig"],
    "webhook_event": req.body,
  };

  let config = {
    method: "post",
    url: PAYPAL_API_URL + "/notifications/verify-webhook-signature",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
    },
    data: JSON.stringify(data),
  };

  const status = await axios(config)
    .then((response): "FAILURE" | "SUCCESS" => {
      if (response.data.verification_status == "SUCCESS") return "SUCCESS";
      return "FAILURE";
    })
    .catch((error): "FAILURE" => {
      return "FAILURE";
    });
  if (status == "SUCCESS") next();
  else return res.sendStatus(401);
}
