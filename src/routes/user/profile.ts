import { Router } from "express";
import { CustomRequest } from "../../interfaces/custom_interfaces";
import authentication from "../../middlewares/authentication";
import UserModel from "../../models/user/schema";

const profileRouter = Router();
export default profileRouter;

profileRouter.delete("/remove-pp", authentication, async (req, res) => {
  try {
    const userId = (req as CustomRequest).userId;
    UserModel.updateOne({ _id: userId }, { $set: { pp: null } });

    res.sendStatus(204);
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
    if (oldPassword != user?.password) return res.sendStatus(403);

    const result = await UserModel.updateOne(
      { _id: userId },
      { $set: { password: newPassword } }
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
