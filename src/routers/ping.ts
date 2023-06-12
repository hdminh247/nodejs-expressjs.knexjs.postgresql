import { Router } from "express";
import encryptionUtils from "../utils/encryption";

const router = Router();

// Simple endpoint intented for healthchecks
router.get("/", (req, res) => {
  res.send({ status: "online", hash: encryptionUtils.hashPassword("123456") });
});

export default router;
