import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";
import UserModel from "../../models/user/schema";

const messageRouter = Router();
export default messageRouter;

messageRouter.post("/", async (req, res) => {
  try {
    const reciverId = req.body.reciverId;
    if (!reciverId) return res.sendStatus(400);

    const reciever = await UserModel.findById(reciverId, {
      fcmToken: 1,
      firstName: 1,
    });

    if (!reciever) return res.sendStatus(404);

    const result = await FCMHelper.sendNofication(
      "new-message",
      reciever.fcmToken,
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
