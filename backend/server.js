import express from "express"
import helmet from "helmet"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"

import products from "./routes/productsRoute.js"
import { log } from "console"

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
app.get("/api/products", products)

app.listen(PORT, () => {
    console.log("==============================================");
    console.log("Server is running on http://localhost:" + PORT);
    console.log("==============================================");
})