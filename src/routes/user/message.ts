import { Router } from "express";
import FCMHelper from "../../classes/fcm_helper";

const messageRouter = Router();
export default messageRouter;

messageRouter.post("/", async (req, res) => {
  try {
    const reciever = JSON.parse(req.body.reciever);
    const message = JSON.parse(req.body.message);
    if (!reciever) return res.sendStatus(404);

    const result = await FCMHelper.sendNofication(
      "new-message",
      reciever.fcmToken,
      {
        message: req.body.message,
        reciever: req.body.reciever,
        sender: req.body.sender,
        body: message.text + "",
      }
    );

    if (result) res.sendStatus(200);
    else res.sendStatus(500);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
