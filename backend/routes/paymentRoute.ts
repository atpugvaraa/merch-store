import express from "express";
import { initiatePayment, paymentCallback } from "../controllers/paymentController";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.post("/initiate", requireAuth, initiatePayment);
router.post("/callback", paymentCallback); // PhonePe calls this, no auth middleware

export default router;