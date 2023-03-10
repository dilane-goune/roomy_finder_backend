import axios from "axios";
import qs from "qs";
import {
  PAYPAL_API_URL,
  PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET,
} from "../data/constants";

export async function generatePaypalToken(): Promise<string | null> {
  try {
    const res = await axios.post(
      "/v1/oauth2/token",
      qs.stringify({ "grant_type": "client_credentials" }),
      {
        auth: {
          username: PAYPAL_CLIENT_ID,
          password: PAYPAL_CLIENT_SECRET,
        },
        baseURL: PAYPAL_API_URL,
      }
    );
    const token = res.data.access_token;

    process.env.PAYPAL_TOKEN = token;
    return token;
  } catch (error) {
    // console.log(error);
    return null;
  }
}
