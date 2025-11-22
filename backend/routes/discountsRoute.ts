import express from "express";
import {
    getAllDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount
} from "../controllers/discountsController";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = express.Router();

// Protect ALL discount routes with Admin check
router.use(requireAuth, requireAdmin);

router.get("/", getAllDiscounts);
router.post("/", createDiscount);
router.put("/:id", updateDiscount);
router.delete("/:id", deleteDiscount);

export default router;