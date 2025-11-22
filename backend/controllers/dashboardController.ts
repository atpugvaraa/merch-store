import { Request, Response } from "express";
import { prisma } from "../../db/prisma";

export async function getDashboardStats(req: Request, res: Response) {
    try {
        // 1. Total Revenue (Verified Orders)
        const revenueAgg = await prisma.order.aggregate({
            _sum: { updated_amount: true }, // snake_case
            where: { is_verified: true },   // snake_case
        });

        // 2. Total Items Ordered
        const verifiedOrders = await prisma.order.findMany({
            where: { is_verified: true },   // snake_case
            include: { order_items: true }  // snake_case
        });

        const itemsOrdered = verifiedOrders.reduce((acc, order) => {
            // order_items
            return acc + order.order_items.reduce((sum, item) => sum + item.quantity, 0);
        }, 0);

        // 3. Pending/Failed Counts
        const pendingOrders = await prisma.order.count({ where: { is_verified: false } }); // snake_case

        // 4. Product Breakdown
        const products = await prisma.product.findMany({
            include: {
                _count: {
                    select: { orderItems: true } // relation name in Product model is still camelCase? Checking schema...
                    // Schema says: `orderItems OrderItem[]` in Product model. So this stays camelCase.
                }
            }
        });

        res.json({
            amountReceived: revenueAgg._sum.updated_amount || 0,
            itemsOrdered,
            pendingOrders,
            products
        });

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ error: "Stats failed" });
    }
}

export async function scanQR(req: Request, res: Response) {
    try {
        const { scannedData } = req.body;

        if (!scannedData || !scannedData.includes("|")) {
            return res.status(400).json({ error: "Invalid QR Format" });
        }

        const [orderId, txnId] = scannedData.split("|");

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true, payment: true }
        });

        if (!order) return res.status(404).json({ error: "Order not found" });

        // Validations (snake_case)
        if (order.payment?.transaction_id !== txnId) return res.status(400).json({ error: "Transaction Mismatch" });
        if (!order.is_verified) return res.status(400).json({ error: "Order not paid" });
        if (order.is_completed) return res.status(400).json({ error: "Order already delivered" });

        // Mark Delivered
        await prisma.order.update({
            where: { id: orderId },
            data: { is_completed: true } // snake_case
        });

        res.json({
            success: true,
            message: "Order Delivered",
            user: order.user?.name,
            amount: order.updated_amount
        });

    } catch (error) {
        console.error("Scan QR Error:", error);
        res.status(500).json({ error: "Scan failed" });
    }
}

export async function toggleShopStatus(req: Request, res: Response) {
    try {
        if (req.user?.position !== "exbo") return res.status(403).json({error: "Forbidden"});
        const { status } = req.body;
        await prisma.product.updateMany({
            data: { accept_orders: status } // snake_case
        });
        res.json({ message: `Shop status updated to: ${status ? 'OPEN' : 'CLOSED'}` });
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle shop" });
    }
}