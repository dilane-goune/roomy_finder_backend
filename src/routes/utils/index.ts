import { Router } from "express";
import authentication from "../../middlewares/authentication";
import { AppVersionModel } from "../../models/util/schema";

const utilRouter = Router();

export default utilRouter;

utilRouter.use(authentication);

utilRouter.get("/app-update", async (req, res) => {
  try {
    const update = await AppVersionModel.findOne({});

    if (update) res.json(update);
    else res.sendStatus(404);
  } catch (error) {
    res.sendStatus(500);
    console.error(error);
  }
});
