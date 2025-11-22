import express from "express";
import { addCartItems, deleteProductFromCart, updateCart, viewCartItems } from "../controllers/cartController";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

router.get("/", viewCartItems);
router.post("/add", addCartItems);
router.post("/delete", deleteProductFromCart);
router.post("/update", updateCart);

export default router;