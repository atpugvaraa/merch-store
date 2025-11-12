import { Request, Response, NextFunction } from "express";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import jwt from "jsonwebtoken";

type AuthenticatedUser = {
    id: string;
    email: string;
    name?: string | null;
    position: "user" | "member" | "core" | "exbo" | string;
};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth  || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ error: "aw hell nah twin you not recognized here" });
    }
    const token = auth.slice("Bearer ".length);

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY || "dev_secret") as AuthenticatedUser;

        if (!payload.id) return res.status(401).json({error: "Invalid token"});
        req.user = payload
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