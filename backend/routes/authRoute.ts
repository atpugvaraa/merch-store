import express from "express";
import passport from "passport";
import { googleCallback, user, logout } from "../controllers/authController";
import { requireAuth } from "../middlewares/auth"; // Assuming you have this

const router = express.Router();

// Google OAuth - Init
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Google OAuth - Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    googleCallback
);

// Get Current User
router.get("/me", requireAuth, user);

// Logout
router.post("/logout", logout);

export default router;