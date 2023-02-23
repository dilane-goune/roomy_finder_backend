import { NextFunction, Request, Response } from "express";
import { JsonWebTokenError, verify } from "jsonwebtoken";
import { SECRET_KEY } from "../data/constants";
import { CustomRequest } from "../interfaces/custom_interfaces";

export default async function authentication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) return res.sendStatus(401);

    const token = authorization.split(" ")[1];

    const user = verify(token, SECRET_KEY) as { userId: string };

    // req.userId = userId;
    (req as CustomRequest).userId = user.userId;

    next();
  } catch (error) {
    // console.log(error);
    if (error instanceof JsonWebTokenError) {
      if (error.message === "jwt expired")
        return res.status(401).json({ code: "jwt expired" });
      if (error.message === "jwt malformed")
        return res.status(401).json({ code: "jwt malformed" });

      return res.status(401).json({ code: "other-error" });
    }
    // console.log(error);
    return res.status(500).json({ code: "server-error" });
  }
}
