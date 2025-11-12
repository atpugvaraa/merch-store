// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import express from "express";
import {addCartItems, deleteProductFromCart, updateCart, viewCartItems} from "../controllers/cartController";

const router = express.Router();

router.get("/", addCartItems)
router.get("/", viewCartItems)
router.post("/", deleteProductFromCart)
router.post("/", updateCart)

export default router;