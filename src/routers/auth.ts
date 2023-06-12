import { Router } from "express";

import {
  login,
  requestToLogin,
  loginByCode,
  magicLinkLogin,
  requestToResetPassword,
  resetPassword,
  resendCode,
  setupPassword,
} from "../controllers/auth";

const router = Router();

router.route("/login").post(login);
router.route("/setup-password").post(setupPassword);
router.route("/request-to-login").post(requestToLogin);
router.route("/resend-code").post(resendCode);
router.route("/login-by-code").post(loginByCode);
router.route("/magic-link-login").post(magicLinkLogin);
router.route("/request-reset-password").post(requestToResetPassword);
router.route("/reset-password").post(resetPassword);

export default router;
