import { Request, Response } from "express";
import { prisma } from "../../db/prisma";

export async function addCartItems(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const { productId, quantity, printingName, size, imageUrl } = req.body;

        const product = await prisma.product.findUnique({ where: { id: Number(productId) } });

        if (!product) return res.status(404).json({ error: "Product not found" });

        if (!product.for_user_positions.includes(req.user!.position)) {
            return res.status(403).json({ error: "Not eligible for this product" });
        }

        // snake_case access
        if (quantity > product.max_quantity) {
            return res.status(400).json({ error: `Max quantity allowed is ${product.max_quantity}` });
        }

        // Check existing item
        const existingItem = await prisma.cartItem.findFirst({
            where: {
                user_id: userId, // snake_case
                product_id: Number(productId), // snake_case
                size: size || null,
                printing_name: printingName || null, // snake_case
            }
        });

        if (existingItem) {
            const updated = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + Number(quantity) }
            });
            return res.json(updated);
        }

        const newItem = await prisma.cartItem.create({
            data: {
                user_id: userId, // snake_case
                product_id: Number(productId), // snake_case
                quantity: Number(quantity),
                printing_name: printingName, // snake_case
                size,
                image_url: imageUrl // snake_case
            }
        });

        res.status(201).json(newItem);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to add to cart" });
    }
}

export async function viewCartItems(req: Request, res: Response) {
    try {
        const userId = req.user!.id;
        const cartItems = await prisma.cartItem.findMany({
            where: { user_id: userId }, // snake_case
            include: { product: true }
        });

        const totalAmount = cartItems.reduce((sum, item) => {
            return sum + (Number(item.product.price) * item.quantity);
        }, 0);

        res.json({ items: cartItems, totalAmount });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch cart" });
    }
}

export async function deleteProductFromCart(req: Request, res: Response) {
    try {
        const { cartItemId } = req.body;
        const userId = req.user!.id;
        const item = await prisma.cartItem.findFirst({
            where: { id: Number(cartItemId), user_id: userId } // snake_case
        });
        if (!item) return res.status(404).json({ error: "Item not found" });

        await prisma.cartItem.delete({ where: { id: Number(cartItemId) } });
        res.json({ message: "Removed from cart" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete item" });
    }
}

export async function updateCart(req: Request, res: Response) {
    try {
        const { cartItemId, quantity } = req.body;
        await prisma.cartItem.update({
            where: { id: Number(cartItemId) },
            data: { quantity: Number(quantity) }
        });
        res.json({ message: "Cart updated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update cart" });
    }
}