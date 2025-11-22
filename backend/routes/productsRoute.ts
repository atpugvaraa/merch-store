import express from "express";
import {
    createProduct,
    deleteProduct,
    getAllProducts,
    getProductsById,
    updateProduct
} from "../controllers/productsController";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = express.Router();

// Public / User
router.get("/", requireAuth, getAllProducts); // requireAuth handles the position check logic inside controller
router.get("/:id", requireAuth, getProductsById);

// Admin Only
router.post("/", requireAuth, requireAdmin, createProduct);
// We use PUT for updates and DELETE for deletions
router.put("/:id", requireAuth, requireAdmin, updateProduct);
router.delete("/:id", requireAuth, requireAdmin, deleteProduct);

export default router;