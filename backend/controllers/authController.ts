import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import jwt from "jsonwebtoken";

const generateToken = (user: any) => {
    return jwt.sign(
        { id: user.id, email: user.email, position: user.position },
        process.env.JWT_SECRET_KEY || "dev_secret",
        { expiresIn: "24h" }
    );
};

export async function googleCallback(req: Request, res: Response) {
    try {
        const googleUser = req.user as any;

        if (!googleUser) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        const email = googleUser.emails?.[0]?.value;

        if (!email) {
            console.error("No email found in Google profile");
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`);
        }

        // Generate 9-digit random ID
        const randomId = Math.floor(100000000 + Math.random() * 900000000).toString();

        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                name: googleUser.displayName,
                // If you want to save the photo:
                // profile_pic: googleUser.photos?.[0]?.value
            },
            create: {
                id: randomId,
                email: email,
                name: googleUser.displayName,
                position: "user",
                // profile_pic: googleUser.photos?.[0]?.value
            },
        });

        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        console.log("Login Successful, Token set for:", user.email);
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

    } catch (error) {
        console.error("Auth Error:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
}

export async function user(req: Request, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const dbUser = await prisma.user.findUnique({
            where: { id: req.user.id },
        });

        res.json({ user: dbUser });
    } catch {
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function logout(req: Request, res: Response) {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
}