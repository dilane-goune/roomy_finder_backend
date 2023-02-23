import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";

const messageRouter = Router();
export default messageRouter;

messageRouter.post("/", async (req, res) => {
  try {
    const message = req.body.message;
    const reciverFcmToken = req.body.reciverFcmToken;

    FCMHelper.send(reciverFcmToken, { message });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
