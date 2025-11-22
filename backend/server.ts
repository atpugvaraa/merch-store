import express from "express"
import morgan from "morgan"
import cors from "cors"
import dotenv from "dotenv"
import helmet from "helmet"
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { prisma } from "../db/prisma"

// config
dotenv.config()
import "./config/passport";

// Constants
const app = express()
const PORT = process.env.PORT || 8000

// Middlewares
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - Important for OAuth
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true, // Allow cookies to be sent
    })
);

// Session configuration - Must be before passport initialization
app.use(
    session({
        secret: process.env.JWT_SECRET_KEY || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === 'production', // true in production (HTTPS)
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        },
    })
);

// Initialize Passport and restore the authentication state from session
app.use(passport.initialize());
app.use(passport.session());

import productsRoute from "./routes/productsRoute"
import cartRoute from "./routes/cartRoute"
import ordersRoute from "./routes/ordersRoute"
import authRoute from "./routes/authRoute"
import paymentRoute from "./routes/paymentRoute";
import dashboardRoute from "./routes/dashboardRoute";
import discountsRoute from "./routes/discountsRoute";

// Endpoints
app.use("/api/auth", authRoute);
app.use("/api/products", productsRoute);
app.use("/api/cart", cartRoute);
app.use("/api/order", ordersRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/discounts", discountsRoute);

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
    console.log("Server is running on " + process.env.BACKEND_URL);
    console.log("==============================================");
})