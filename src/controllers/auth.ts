import { Request, Response, NextFunction } from "express";
import dayjs from "dayjs";

// Models
import User from "../models/user";
import Code from "../models/code";

// Utils
import HttpResponse from "../services/response";
import { validateEmail, validatePassword } from "../utils/validation";
import encryption from "../utils/encryption";
import { randomString } from "../utils/code";
import { generate } from "../utils/jwt";
import { sendResetPasswordEmail, sendLoginByCodeEmail } from "../utils/email";
/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication APIs
 */

/**
 * @openapi
 * definitions:
 *   LoginResponse:
 *     properties:
 *       token:
 *         type: string
 *         description: 'Token'
 *       role:
 *         type: string
 *         description: 'Role'
 */

/**
 * @openapi
 * definitions:
 *   Login:
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: string
 *       password:
 *         type: string
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     description: Login API  (For non-user only)
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/Login'
 *              type: object
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#definitions/LoginResponse'
 *       400:
 *         description: Invalid request params
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */

export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { body } = req;

    const user = await User.query().findOne({ email: body.email, isActive: true }).withGraphFetched("[role]");

    //@ts-ignore
    if (!user || user.role?.name === "User") {
      return HttpResponse.returnBadRequestResponse(res, "auth.fail");
    }
    const passwordMatch = encryption.checkPassword(body.password, user.password);
    if (!passwordMatch) return HttpResponse.returnBadRequestResponse(res, "auth.fail");

    // @ts-ignore
    delete user["password"];

    const token = generate({
      ...user,
    });

    return HttpResponse.returnSuccessResponse(res, { token, user });
  } catch (err: any) {
    next(err);
  }
};

/**
 * @openapi
 * definitions:
 *   SetupPassword:
 *     required:
 *       - password
 *       - confirmPassword
 *       - hash
 *       - code
 *     properties:
 *       password:
 *         type: string
 *       confirmPassword:
 *         type: string
 *       hash:
 *         type: string
 *       code:
 *         type: string
 */

/**
 * @openapi
 * /auth/setup-password:
 *   post:
 *     description: Setup Password API  (For non-user only)
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/SetupPassword'
 *              type: object
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#definitions/LoginByCodResponse'
 *       400:
 *         description: Invalid request params
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */

export const setupPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { body } = req;
    const { password, confirmPassword, hash, code } = body;

    // Validate password
    if (password !== confirmPassword) {
      return HttpResponse.returnBadRequestResponse(res, "password.confirmPassword.notMatched");
    }

    // Check if code existed and expired
    const codeData = await Code.query()
      .findOne({
        hash,
        code,
      })
      .where("expiredAt", ">=", dayjs().format("YYYY-MM-DD HH:mm:ss"));

    if (!codeData) {
      // Return error
      return HttpResponse.returnBadRequestResponse(res, "code.invalid");
    }

    const user = await User.query().findOne({ email: codeData.email });

    if (!user) {
      return HttpResponse.returnBadRequestResponse(res, "auth.fail");
    }

    // Update password, and set this account is active
    await User.query()
      .update({ password: encryption.hashPassword(password), isActive: true })
      .where({ email: user.email });

    // Delete old code to make this no longer available
    await Code.query().deleteById(codeData.id);

    // Generate token and return user info
    const responseData = {
      token: generate(
        { id: user.id, email: codeData.email, createdAt: dayjs().add(1, "day").toString() },
        { expiresIn: 86400 },
      ),
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return HttpResponse.returnSuccessResponse(res, responseData);
  } catch (err: any) {
    next(err);
  }
};

/**
 * @openapi
 * definitions:
 *   RequestToLogin:
 *     required:
 *       - email
 *     properties:
 *       email:
 *         type: string
 */

/**
 * @openapi
 * definitions:
 *   RequestToLoginResponse:
 *     properties:
 *       code:
 *         type: string
 *         description: 'Code Request'
 */

/**
 * @openapi
 * /auth/request-to-login:
 *   post:
 *     description: Request Login API
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/RequestToLogin'
 *              type: object
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#definitions/RequestToLoginResponse'
 *       400:
 *         description: Invalid request params
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */

export const requestToLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      body: { email },
    } = req;

    if (!validateEmail(email)) {
      return HttpResponse.returnBadRequestResponse(res, "email.invalid");
    }

    const user = await User.query().findOne({ email, isActive: true });

    if (!user) {
      return HttpResponse.returnBadRequestResponse(res, "auth.fail");
    }

    const code = randomString(8);
    const hash = encryption.hashPassword(email);

    await Code.query().insert({
      hash,
      email,
      code,
      expiredAt: dayjs().add(1, "day").toString(),
    });

    // const mailContent = generateLoginByCodeContentContent(code, hash);
    // await send(null, { email, name: "User" }, "Login", mailContent.plainMessage, mailContent.htmlMessage);
    await sendLoginByCodeEmail(code, hash, { email, name: "User" }, "Your RefundAgents Login Code");

    return HttpResponse.returnSuccessResponse(res, { code });
  } catch (err: any) {
    next(err);
  }
};

/**
 * @openapi
 * definitions:
 *   ResendCode:
 *     required:
 *       - email
 *     properties:
 *       email:
 *         type: string
 */

/**
 * @openapi
 * /auth/resend-code:
 *   post:
 *     description: Resend code to email API
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/ResendCode'
 *              type: object
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

export const resendCode = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      body: { email },
    } = req;

    if (!validateEmail(email)) {
      return HttpResponse.returnBadRequestResponse(res, "email.invalid");
    }

    const user = await User.query().findOne({ email, isActive: true });

    if (!user) {
      return HttpResponse.returnBadRequestResponse(res, "auth.fail");
    }

    // Delete old codes
    await Code.query().delete().where({ email });

    //Generate a code
    const code = randomString(8);
    const hash = encryption.hashPassword(email);

    //Insert to DB
    await Code.query().insert({
      hash: encryption.hashPassword(email),
      email,
      code,
      type: "resendCode",
      expiredAt: dayjs().add(1, "day").toString(),
    });

    await sendLoginByCodeEmail(code, hash, { email, name: "User" }, "Your RefundAgents Login Code");

    return HttpResponse.returnSuccessResponse(res, { code });
  } catch (err: any) {
    next(err);
  }
};

/**
 * @openapi
 * definitions:
 *   LoginByCode:
 *     required:
 *       - email
 *       - code
 *     properties:
 *       email:
 *         type: string
 *         default: example@gmail.com
 *       code:
 *         type: string
 */

/**
 * @openapi
 * definitions:
 *   LoginByCodResponse:
 *     properties:
 *       token:
 *         type: string
 *       firstName:
 *         type: string
 *       lastName:
 *         type: string
 *       companyName:
 *         type: string
 */

/**
 * @openapi
 * /auth/login-by-code:
 *   post:
 *     description: Login By Code API
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/LoginByCode'
 *              type: object
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#definitions/LoginByCodResponse'
 *       400:
 *         description: Invalid request params
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */

export const loginByCode = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      body: { email, code },
    } = req;

    //Validate email
    if (!validateEmail(email)) {
      return HttpResponse.returnBadRequestResponse(res, "email.invalid");
    }

    if (!code || code.length > 8) {
      return HttpResponse.returnBadRequestResponse(res, "code.invalid");
    }

    const user = await User.query().findOne({ email, isActive: true });

    if (!user) {
      return HttpResponse.returnBadRequestResponse(res, "auth.fail");
    }

    // Check if code existed and expired
    const codeData = await Code.query()
      .findOne({
        email,
        code,
      })
      .where("expiredAt", ">=", dayjs().format("YYYY-MM-DD HH:mm:ss"));

    if (!codeData) {
      // Return error
      return HttpResponse.returnBadRequestResponse(res, "code.invalid");
    }

    // Delete old code to make this no longer available
    await Code.query().deleteById(codeData.id);

    // Generate token and return user info
    const responseData = {
      token: generate({ id: user.id, email, createdAt: dayjs().add(1, "day").toString() }, { expiresIn: 86400 }),
      ...user,
    };

    return HttpResponse.returnSuccessResponse(res, responseData);
  } catch (err: any) {
    next(err);
  }
};

/**
 * @openapi
 * definitions:
 *   MagicLinkLogin:
 *     required:
 *       - hash
 *       - code
 *     properties:
 *       hash:
 *         type: string
 *       code:
 *         type: string
 */

/**
 * @openapi
 * /auth/magic-link-login:
 *   post:
 *     description: Login By Code API
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/MagicLinkLogin'
 *              type: object
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                $ref: '#definitions/LoginByCodResponse'
 *       400:
 *         description: Invalid request params
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */

export const magicLinkLogin = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      body: { hash, code },
    } = req;

    // Validate, verify hash and code
    if (!hash || !code || code.length > 8) {
      return HttpResponse.returnBadRequestResponse(res, "code.invalid");
    }

    // Check if hash, code existed and expired
    const codeData = await Code.query()
      .findOne({
        hash,
        code,
      })
      .where("expiredAt", ">=", dayjs().format("YYYY-MM-DD HH:mm:ss"));
    if (!codeData) {
      // Return error
      return HttpResponse.returnBadRequestResponse(res, "code.invalid");
    }

    // Find user by email
    const user = await User.query().findOne({ email: codeData.email, isActive: true });

    if (!user) {
      return HttpResponse.returnBadRequestResponse(res, "auth.fail");
    }

    // Generate token and return to user
    const responseData = {
      token: generate(
        { id: user.id, email: user.email, createdAt: dayjs().add(1, "day").toString() },
        { expiresIn: 86400 },
      ),
      ...user,
    };

    // Delete old code to make this no longer available
    await Code.query().deleteById(codeData.id);

    return HttpResponse.returnSuccessResponse(res, responseData);
  } catch (err: any) {
    next(err);
  }
};

/**
 * @openapi
 * definitions:
 *   RequestResetPassword:
 *     required:
 *       - email
 *     properties:
 *       email:
 *         type: string
 *         default: example@gmail.com
 */

/**
 * @openapi
 * /auth/request-reset-password:
 *   post:
 *     description: Request To Reset Password API
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/RequestResetPassword'
 *              type: object
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

export const requestToResetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      body: { email },
    } = req;

    // Validate email
    if (!validateEmail(email)) {
      return HttpResponse.returnBadRequestResponse(res, "email.invalid");
    }

    // Find user by email
    const user = await User.query().findOne({ email, isActive: true }).whereNot({ roleId: 4 });

    if (!user) {
      return HttpResponse.returnBadRequestResponse(res, "auth.fail");
    }

    // Delete old codes
    await Code.query().delete().where({ email, type: "requestToResetPassword" });

    //Generate a code
    const code = randomString(8);
    const hash = encryption.hashPassword(email);

    // Insert to DB
    await Code.query().insert({
      hash,
      email: email,
      code,
      type: "requestToResetPassword",
      expiredAt: dayjs().add(1, "day").toString(),
    });

    sendResetPasswordEmail(code, hash, { email, name: "User" }, "Reset Password For Your RefundAgents Account");

    // Send code through email
    // const mailContent = generateRequestResetPasswordContent(hash, code);
    // await send(
    //   null,
    //   { email: email, name: `${user.firstName} ${user.lastName}` },
    //   "Request To Reset Password",
    //   mailContent.plainMessage,
    //   mailContent.htmlMessage,
    // );

    return HttpResponse.returnSuccessResponse(res, {});
  } catch (err: any) {
    next(err);
  }
};

/**
 * @openapi
 * definitions:
 *   ResetPassword:
 *     required:
 *       - hash
 *       - code
 *       - password
 *       - confirmPassword
 *     properties:
 *       hash:
 *         type: string
 *       code:
 *         type: string
 *       password:
 *         type: string
 *       confirmPassword:
 *         type: string
 */

/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     description: Reset Password API
 *     tags: [Auth]
 *     produces:
 *       - application/json
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#definitions/ResetPassword'
 *              type: object
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

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      body: { code, hash, password, confirmPassword },
    } = req;

    // Validate email
    if (!validatePassword(password)) {
      return HttpResponse.returnBadRequestResponse(res, "password.invalid");
    }

    // Validate email
    if (!validatePassword(confirmPassword) || confirmPassword !== password) {
      return HttpResponse.returnBadRequestResponse(res, "confirmPassword.invalid");
    }

    // Validate password and code then reset the password
    if (!code || !hash) {
      return HttpResponse.returnBadRequestResponse(res, "code.invalid");
    }

    // Check if code existed and expired
    const codeData = await Code.query()
      .findOne({
        code,
        hash,
      })
      .where("expiredAt", ">=", dayjs().format("YYYY-MM-DD HH:mm:ss"));
    if (!codeData) {
      // Return error
      return HttpResponse.returnBadRequestResponse(res, "code.invalid");
    }

    // Find user by email
    const user = await User.query().findOne({ email: codeData.email, isActive: true });

    if (!user) {
      return HttpResponse.returnBadRequestResponse(res, "auth.fail");
    }

    const hashPassword = encryption.hashPassword(password);

    await User.query()
      .findById(user.id)
      .patch({ password: hashPassword, updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss") });

    // Delete old code to make this no longer available
    await Code.query().deleteById(codeData.id);

    return HttpResponse.returnSuccessResponse(res, {});
  } catch (err: any) {
    next(err);
  }
};
