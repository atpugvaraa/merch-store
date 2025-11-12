// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import express from 'express';
import {applyDiscount, getAllOrders, getOrderById, placeOrder} from "../controllers/ordersController";

const router = express.Router();

router.get("/", getAllOrders)
router.get("/:id", getOrderById)
router.post("/", placeOrder)
router.post("/", applyDiscount)

export default router;