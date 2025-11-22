import { Request, Response } from "express";
import { prisma } from "../../db/prisma";

function generateRandomCode(length = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function getAllDiscounts(req: Request, res: Response) {
    try {
        const discounts = await prisma.discountCode.findMany({
            orderBy: { created_at: 'desc' } // snake_case
        });
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch discounts" });
    }
}

export async function createDiscount(req: Request, res: Response) {
    try {
        const { code, discountPercentage, maxUses, expiryDate, forUserPositions, custom } = req.body;

        let finalCode = code;
        if (!custom || !finalCode) {
            finalCode = generateRandomCode();
        }

        const newDiscount = await prisma.discountCode.create({
            data: {
                code: finalCode.toUpperCase(),
                discount_percentage: parseFloat(discountPercentage), // snake_case
                max_uses: parseInt(maxUses), // snake_case
                expiry_date: new Date(expiryDate), // snake_case
                for_user_positions: forUserPositions || [], // snake_case
                custom: !!custom,
                uses: 0
            }
        });

        res.status(201).json(newDiscount);
    } catch (error) {
        res.status(500).json({ error: "Failed to create discount" });
    }
}

export async function updateDiscount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { code, discountPercentage, maxUses, expiryDate, forUserPositions } = req.body;

        const updated = await prisma.discountCode.update({
            where: { id: Number(id) },
            data: {
                code: code ? code.toUpperCase() : undefined,
                discount_percentage: discountPercentage ? parseFloat(discountPercentage) : undefined,
                max_uses: maxUses ? parseInt(maxUses) : undefined,
                expiry_date: expiryDate ? new Date(expiryDate) : undefined,
                for_user_positions: forUserPositions
            }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Failed to update discount" });
    }
}

export async function deleteDiscount(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await prisma.discountCode.delete({ where: { id: Number(id) } });
        res.json({ message: "Discount deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete discount" });
    }
}