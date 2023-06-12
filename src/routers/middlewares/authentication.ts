import { NextFunction, Request, Response } from "express";

import { verify } from "../../utils/jwt";
import HttpResponse from "../../services/response";

import User from "../../models/user";

export const verifyToken = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (token) {
      try {
        const verifiedInfo: any = verify(token.split(" ")[1]);

        // Get user info
        req["user"] = await User.query().findOne({ id: verifiedInfo.id }).withGraphFetched("[role, provider]");
        await next();
      } catch (err: any) {
        console.log(err);
        return HttpResponse.returnUnAuthorizeResponse(res, "auth.token.invalid");
      }
    } else {
      return HttpResponse.returnUnAuthorizeResponse(res, "auth.token.invalid");
    }
  };
};

export const verifyAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const { user } = req;

      // Return error if this is user role
      if (user.roleId === 4) {
        return HttpResponse.returnUnAuthorizeResponse(res, "auth.token.invalid");
      }
      await next();
    } catch (err: any) {
      console.log(err);
      return HttpResponse.returnUnAuthorizeResponse(res, "auth.token.invalid");
    }
  };
};
