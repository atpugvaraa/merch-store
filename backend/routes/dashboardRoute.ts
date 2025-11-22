import express from "express";
import {getDashboardStats, scanQR, toggleShopStatus} from "../controllers/dashboardController";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = express.Router();

// Protect all dashboard routes with Admin check
router.use(requireAuth, requireAdmin);

router.get("/stats", getDashboardStats);
router.post("/scan-qr", scanQR);
router.post("/stop-orders", toggleShopStatus)
router.post("/start-orders", toggleShopStatus)

export default router;