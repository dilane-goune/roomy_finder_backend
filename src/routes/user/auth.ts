import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../../models/user/schema";
import { SECRET_KEY } from "../../data/constants";
import LoginMonitoryModel from "../../models/login_monitory/schema";

const authRouter = Router();
export default authRouter;

// generate access token
authRouter.post("/token", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.sendStatus(400);
  try {
    const user = await UserModel.findOne({ email });

    if (!user) return res.sendStatus(404);
    if (user.isDisabled) return res.status(403).json({ code: "disabled" });

    if (!bcrypt.compareSync(password, user.password))
      return res.sendStatus(403);

    const expireAt = new Date();
    expireAt.setHours(expireAt.getHours() + 2);

    const token = jwt.sign({ userId: user._id.toString() }, SECRET_KEY, {
      expiresIn: "2h",
    });

    res.json({ token, expireAt: expireAt.toISOString() });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// register
authRouter.post("/credentials", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    req.body.password = hashedPassword;

    const user = await UserModel.create(req.body);

    res.status(201).json(user);
  } catch (error: any) {
    if (error.code === 11000)
      return res.status(409).json({ code: "user-exist" });
    console.error(error);
    res.sendStatus(500);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { password, email, fcmToken } = req.body;

    if (!fcmToken) return res.sendStatus(400);

    const user = await UserModel.findOneAndUpdate(
      { email },
      { $set: { fcmToken } },
      { new: true }
    );

    if (!user || user._id.equals("000000000000000000000000"))
      return res.sendStatus(404);
    if (user.isDisabled) return res.status(403).json({ code: "disabled" });

    if (!bcrypt.compareSync(password, user.password)) {
      if (user.failedToLoginCount + 1 == 20) {
        await user.updateOne({
          $inc: { failedToLoginCount: 1 },
          $set: { isDisabled: true },
        });
      } else {
        await user.updateOne({ $inc: { failedToLoginCount: 1 } });
      }

      await LoginMonitoryModel.create({ user: user._id, succeeded: false });

      return res.status(403).json({ code: "incorrect-password" });
    } else {
      await user.updateOne({ $set: { failedToLoginCount: 0 } });
      await LoginMonitoryModel.create({ user: user._id, succeeded: true });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const { password, phone, fcmToken } = req.body;

    if (!fcmToken) return res.sendStatus(400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.findOneAndUpdate(
      { phone },
      { $set: { fcmToken, password: hashedPassword } },
      { new: true }
    );

    if (!user) return res.sendStatus(404);

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

authRouter.get("/user-exist", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await UserModel.findOne({ email });
    if (user) res.json({ exist: true });
    else res.json({ exist: false });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});
