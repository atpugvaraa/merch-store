// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import express from "express"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import morgan from "morgan"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import cors from "cors"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import dotenv from "dotenv"

import helmet from "helmet"
import { prisma } from "../db/prisma"

import products from "./routes/productsRoute"
import cart from "./routes/cartRoute"
import orders from "./routes/ordersRoute"

// Constants
dotenv.config()
const app = express()
const PORT = process.env.PORT

// Middlewares
app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))

// Endpoints
app.get("/products", products)
app.get("/cart", cart)
app.get("/order", orders)

app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ok" });
    } catch {
        res.status(500).json({ status: "db_error" });
    }
});

app.listen(PORT, () => {
    console.log("==============================================");
    console.log("Server is running on http://localhost:" + PORT);
    console.log("==============================================");
})