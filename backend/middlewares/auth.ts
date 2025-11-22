import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from '../../db/prisma';

interface JWTPayload {
    userId: string;
    email: string;
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            user?: AuthenticatedUser;
        }
    }
}

type AuthenticatedUser = {
    id: string;
    email: string;
    name?: string | null;
    position: "user" | "member" | "core" | "exbo" | string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    // 1. Check for Authorization Header
    let token = req.headers.authorization?.slice("Bearer ".length);

    // 2. If no header, check for Cookie (This is what your browser sends)
    if (!token && req.cookies) {
        token = req.cookies.token;
    }

    if (!token) {
        return res.status(401).json({ error: "aw hell nah twin you not recognized here" });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY || "dev_secret") as AuthenticatedUser;
        if (!payload.id) return res.status(401).json({error: "Invalid token"});
        req.user = payload;
        return next();
    } catch (_err) {
        return res.status(401).json({error: "Invalid or expired token"});
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    if (!user) return res.status(401).json({ error: "aw hell nah twin the politics goes crazy here" });
    if (user.position === "exbo") return next();
    return res.status(403).json({ error: "Forbidden" });
}