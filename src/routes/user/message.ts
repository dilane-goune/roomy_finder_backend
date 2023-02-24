import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";

const messageRouter = Router();
export default messageRouter;

messageRouter.post("/", async (req, res) => {
  try {
    const reciverFcmToken = req.body.reciverFcmToken;

    const result = await FCMHelper.sendNofication(
      "new-message",
      reciverFcmToken,
      {
        jsonMessage: JSON.stringify(req.body.message),
      }
    );

    if (result) res.sendStatus(200);
    else res.sendStatus(500);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
