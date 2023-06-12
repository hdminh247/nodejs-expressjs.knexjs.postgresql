import { Router } from "express";

import { getProfile, updateProfile } from "../controllers/user";

import { verifyToken } from "./middlewares/authentication";

const router = Router();

router.all("/*", verifyToken());

router.route("/profile").get(getProfile);
router.route("/profile").put(updateProfile);

export default router;
