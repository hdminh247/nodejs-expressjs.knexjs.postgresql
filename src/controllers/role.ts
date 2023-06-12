import { Request, Response, NextFunction } from "express";

import Role from "../models/role";

// Utils
import HttpResponse from "../services/response";

/**
 * @openapi
 * tags:
 *   - name: Role
 *     description: Role APIs
 */

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @openapi
 * /admin/roles:
 *   get:
 *     description: Get role list
 *     tags: [Role]
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid request params
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */

export const getRoleList = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const rs = await Role.query();
    return HttpResponse.returnSuccessResponse(res, rs);
  } catch (err: any) {
    next(err);
  }
};
