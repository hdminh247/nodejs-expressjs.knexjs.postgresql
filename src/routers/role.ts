import { Router } from "express";

import { getRoleList } from "../controllers/role";

const router = Router();

router.route("/list").get(getRoleList);

export default router;
