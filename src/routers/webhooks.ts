import { Router } from "express";
import { recipientSignedWebhook } from "../controllers/webhooks";

const router = Router();

router.route("/zoho/recipient-signed").post(recipientSignedWebhook);

export default router;
