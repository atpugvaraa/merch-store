import { Request, Response } from "express";
import { prisma } from "../../db/prisma";

export async function getAllProducts(req: Request, res: Response) {
    try {
        const user = req.user;
        const userPosition = user?.position || "user";

        const products = await prisma.product.findMany({
            where: {
                is_visible: true, // snake_case
                for_user_positions: { // snake_case
                    has: userPosition,
                },
            },
            orderBy: { id: 'asc' }
        });

        res.json(products);
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
}

export async function getProductsById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
        });

        if (!product) return res.status(404).json({ error: "Product not found" });

        const userPosition = req.user?.position || "user";
        if (!product.for_user_positions.includes(userPosition)) {
            return res.status(403).json({ error: "You are not authorized to view this product" });
        }

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
}

// Admin Only
export async function createProduct(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!["exbo", "core"].includes(user?.position || "")) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const {
            name, price, description, maxQuantity,
            forUserPositions, isNameRequired, isSizeRequired,
            isImageRequired
        } = req.body;

        const product = await prisma.product.create({
            data: {
                name,
                price: parseFloat(price),
                description,
                // MAP TO SNAKE CASE
                max_quantity: parseInt(maxQuantity),
                for_user_positions: forUserPositions || ["user"],
                is_name_required: !!isNameRequired,
                is_size_required: !!isSizeRequired,
                is_image_required: !!isImageRequired,
                accept_orders: true,
                is_visible: true
            },
        });

        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create product" });
    }
}

// Update Product
export async function updateProduct(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!["exbo", "core"].includes(user?.position || "")) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { id } = req.params;
        const {
            name, price, description, maxQuantity,
            isNameRequired, isSizeRequired, isImageRequired,
            acceptOrders, isVisible
        } = req.body;

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                name,
                price: price ? parseFloat(price) : undefined,
                description,
                // MAP TO SNAKE CASE
                max_quantity: maxQuantity ? parseInt(maxQuantity) : undefined,
                is_name_required: isNameRequired,
                is_size_required: isSizeRequired,
                is_image_required: isImageRequired,
                accept_orders: acceptOrders,
                is_visible: isVisible,
            },
        });

        res.json({ message: "Product updated successfully", product: updatedProduct });

    } catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ error: "Failed to update product" });
    }
}

export async function deleteProduct(req: Request, res: Response) {
    try {
        const user = req.user;
        if (!["exbo", "core"].includes(user?.position || "")) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const { id } = req.params;
        await prisma.product.delete({ where: { id: Number(id) } });

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
}