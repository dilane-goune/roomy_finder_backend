import { NextFunction, Response, Request } from "express";

export function createQueryModifier(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next();
}
export function roommateQueryModifier(
  req: Request,
  res: Response,
  next: NextFunction
) {
  next();
}
