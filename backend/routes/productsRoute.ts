// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import express from "express"
import {createProduct, getAllProducts, getProductsById} from "../controllers/productsController"

const router = express.Router()

router.get("/", getAllProducts)
router.get("/:id", getProductsById)
router.post("/", createProduct)

export default router