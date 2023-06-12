import * as core from "express-serve-static-core";
import { NextFunction, Request, Response } from "express";

import HttpResponse from "../../services/response";
import CustomResponse from "../../services/response/customResponse";

export default function errorMiddlewares(app: core.Express) {
  // Catch 404 and forward to error handler
  app.use(function (req, res, next) {
    // Normalize error format
    const error = HttpResponse.returnErrorWithMessage(`Not found: ${req.method} ${req.originalUrl}`);

    console.log(error);
    // TODO: Implement any log service here
    // Set error status code
    res.status(404);
    // Pass to the next middleware
    next(error);
  });

  // Return meaningful error, so there is no stack traces leaked to user
  // HAVE TO HAVE 4 params: err, req, res, and next (even does not use) so that express udnerstand this is error middleware
  /* eslint-disable @typescript-eslint/no-unused-vars */
  app.use(function (err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof CustomResponse && res.statusCode !== null) {
      console.log(err);
      // TODO: Implement any log service here
      return res.json(err);
    } else {
      console.log(err);
      // TODO: Implement any log service here
      // Set error status code
      res.status(500);
      return HttpResponse.returnInternalServerResponseWithMessage(res, err.message);
    }
  });
}
