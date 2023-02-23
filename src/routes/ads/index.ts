import { Router } from "express";
import propertyAdRouter from "./property_ad";
import roommateAdRouter from "./roommates_ad";

const adsRouter = Router();
export default adsRouter;

adsRouter.use("/property-ad", propertyAdRouter);
adsRouter.use("/roommate-ad", roommateAdRouter);
