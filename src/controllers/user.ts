import { Request, Response, NextFunction } from "express";

// Utils
import HttpResponse from "../services/response";
import User from "../models/user";

/**
 * @openapi
 * tags:
 *   - name: User
 *     description: User
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
 * /user/profile:
 *   get:
 *     description: Get profile API
 *     tags: [User]
 *     produces:
 *       - application/json
 *     security:
 *          - bearerAuth: []
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

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // @ts-ignore
    const { user } = req;

    return HttpResponse.returnSuccessResponse(res, user);
  } catch (err: any) {
    next(err);
  }
};

/**
 * @openapi
 * /user/profile}:
 *   put:
 *      description: Update profile API
 *      tags: [User]
 *      produces:
 *       - application/json
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: integer
 *            minimum: 1
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/UpdateUser'
 *              type: object
 *      security:
 *        - bearerAuth: []
 *      responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Invalid request params
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const user = req["user"];

    await User.query().update(req.body).where("id", user.id);

    return HttpResponse.returnSuccessResponse(res, req.body);
  } catch (err: any) {
    next(err);
  }
};
