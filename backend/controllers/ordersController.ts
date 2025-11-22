import { Request, Response } from "express";
import { prisma } from "../../db/prisma";

export async function placeOrder(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const { discountCode } = req.body;

        // 1. Fetch Cart
        const cartItems = await prisma.cartItem.findMany({
            where: { user_id: userId }, // snake_case
            include: { product: true }
        });

        if (cartItems.length === 0) return res.status(400).json({ error: "Cart is empty" });

        // 2. Calculate Totals
        let totalAmount = 0;
        cartItems.forEach(item => {
            totalAmount += (Number(item.product.price) * item.quantity);
        });

        let updatedAmount = totalAmount;
        let discountId = null;

        // 3. Apply Discount
        if (discountCode) {
            const discount = await prisma.discountCode.findUnique({ where: { code: discountCode } });
            if (discount) {
                const discountVal = (totalAmount * Number(discount.discount_percentage)) / 100;
                updatedAmount = totalAmount - discountVal;
                discountId = discount.id;
            }
        }

        // 4. Create Order Transactionally
        const order = await prisma.$transaction(async (tx) => {
            const randomId = Math.floor(100000 + Math.random() * 900000);
            const orderId = `ccs_order_${randomId}`;

            const newOrder = await tx.order.create({
                data: {
                    id: orderId,
                    user_id: userId, // snake_case
                    total_amount: totalAmount,
                    updated_amount: updatedAmount,
                    discount_code_id: discountId, // snake_case
                    is_verified: false,
                    // Create Order Items from Cart
                    order_items: { // snake_case
                        create: cartItems.map(item => ({
                            product_id: item.product_id, // snake_case
                            quantity: item.quantity,
                            size: item.size,
                            printing_name: item.printing_name, // snake_case
                            image_url: item.image_url // snake_case
                        }))
                    }
                }
            });

            // Clear Cart
            await tx.cartItem.deleteMany({ where: { user_id: userId } }); // snake_case

            return newOrder;
        });

        res.status(201).json({ order, message: "Order created, proceed to payment" });

    } catch (error) {
        console.error("Place Order Error:", error);
        res.status(500).json({ error: "Failed to place order" });
    }
}

export async function getAllOrders(req: Request, res: Response) {
    try {
        const orders = await prisma.order.findMany({
            where: { user_id: req.user!.id, is_verified: true }, // snake_case
            include: { order_items: { include: { product: true } } }, // snake_case
            orderBy: { created_at: 'desc' } // snake_case
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}

export async function getOrderById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const order = await prisma.order.findFirst({
            where: { id: id, user_id: req.user!.id }, // snake_case
            include: { order_items: true } // snake_case
        });
        if (!order) return res.status(404).json({ error: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Error fetching order" });
    }
}

export async function applyDiscount(req: Request, res: Response) {
    try {
        const { code } = req.body;
        const discount = await prisma.discountCode.findUnique({ where: { code } });

        if (!discount) return res.status(400).json({ error: "Invalid code" });

        if (discount.max_uses <= discount.uses) return res.status(400).json({ error: "Code exhausted" });
        if (new Date() > discount.expiry_date) return res.status(400).json({ error: "Code expired" });
        if (!discount.for_user_positions.includes(req.user!.position)) return res.status(400).json({ error: "Not applicable for your role" });

        res.json({
            code: discount.code,
            percentage: discount.discount_percentage // snake_case
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to apply discount" });
    }
}