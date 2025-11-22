import express from 'express';
import {applyDiscount, getAllOrders, getOrderById, placeOrder} from "../controllers/ordersController";
import { requireAuth } from "../middlewares/auth";

const router = express.Router();

router.use(requireAuth);

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.post("/", placeOrder);
router.post("/apply-discount", applyDiscount);

export default router;