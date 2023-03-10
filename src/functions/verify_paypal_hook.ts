import axios, { AxiosError } from "axios";
import { Request } from "express";
import { PAYPAL_API_URL, PAYPAL_WEBHOOK_ID } from "../data/constants";

export default async function verifyPayPalHook(
  req: Request
): Promise<"FAILURE" | "SUCCESS"> {
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
      "PayPal-Request-Id": "66955aa5-2f23-458f-be20-cdc71ce714da",
      "Authorization": "Bearer " + process.env.PAYPAL_TOKEN,
    },
    data: JSON.stringify(data),
  };

  const status = await axios(config)
    .then((response): "FAILURE" | "SUCCESS" => {
      console.log(response.data);
      if (response.data.verification_status == "SUCCESS") return "SUCCESS";
      return "FAILURE";
    })
    .catch((error): "FAILURE" => {
      if (error instanceof AxiosError) {
        console.log(error.response?.status);
        console.log(error.request.url);
        console.log(error.response?.data);
      }
      console.log("Verification error");
      return "FAILURE";
    });
  return status;
}
