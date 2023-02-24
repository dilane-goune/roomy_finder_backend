import { NextFunction, Response, Request } from "express";

export function createQueryModifier(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.query["address.city"] = req.query.city;
  delete req.query.city;
  next();
}
export function roommateQueryModifier(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next();
}
