import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import crypto from "crypto";
import axios from "axios";
import { sendSuccessEmail } from "../utils/mailer";

// Force Use of Stable Credentials
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT86";
const SALT_KEY = process.env.PHONEPE_SALT_KEY || "96434309-7796-489d-8924-ab56988a6076";
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || "1";
const BASE_URL = process.env.PHONEPE_BASE_URL || "https://api-preprod.phonepe.com/apis/pg-sandbox";

const generateQRData = (orderId: string, txnId: string) => {
    return `${orderId}|${txnId}`;
};

export async function initiatePayment(req: Request, res: Response) {
    try {
        const { orderId } = req.body;
        const userId = req.user!.id;

        const order = await prisma.order.findFirst({
            where: { id: orderId, user_id: userId }, // snake_case
        });

        if (!order) return res.status(404).json({ error: "Order not found" });

        const merchantTransactionId = `MT${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const amountInPaise = Math.round(Number(order.updated_amount) * 100);

        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId,
            merchantUserId: userId,
            amount: amountInPaise,
            redirectUrl: `${process.env.BACKEND_URL}/api/payment/callback`,
            redirectMode: "POST",
            callbackUrl: `${process.env.BACKEND_URL}/api/payment/callback`,
            paymentInstrument: { type: "PAY_PAGE" },
        };

        const bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
        const base64Payload = bufferObj.toString("base64");

        const endpoint = "/pg/v1/pay";
        const stringToHash = base64Payload + endpoint + SALT_KEY;
        const sha256 = crypto.createHash("sha256").update(stringToHash).digest("hex");
        const xVerify = `${sha256}###${SALT_INDEX}`;

        const options = {
            method: "post",
            url: `${BASE_URL}${endpoint}`,
            headers: {
                accept: "application/json",
                "Content-Type": "application/json",
                "X-VERIFY": xVerify,
            },
            data: { request: base64Payload },
        };

        const response = await axios(options);
        const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;

        // Upsert Payment Record (snake_case)
        await prisma.payment.upsert({
            where: { order_id: order.id }, // snake_case
            update: {
                transaction_id: merchantTransactionId, // snake_case
                paid_amount: order.updated_amount,     // snake_case
                status: "PENDING",
            },
            create: {
                order_id: order.id, // snake_case
                transaction_id: merchantTransactionId, // snake_case
                paid_amount: order.updated_amount,     // snake_case
                status: "PENDING",
            },
        });

        res.json({ url: redirectUrl });

    } catch (error: any) {
        console.error("Payment Init Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Payment initiation failed" });
    }
}

export async function paymentCallback(req: Request, res: Response) {
    try {
        console.log("--- Payment Callback Hit ---");

        let merchantTransactionId;
        let code;
        let paymentId;

        if (req.body.response) {
            const decoded = Buffer.from(req.body.response, "base64").toString("utf-8");
            const data = JSON.parse(decoded);
            merchantTransactionId = data.data.merchantTransactionId;
            code = data.data.code;
            paymentId = data.data.transactionId;
        } else if (req.body.code && req.body.transactionId) {
            merchantTransactionId = req.body.transactionId;
            code = req.body.code;
            paymentId = req.body.providerReferenceId || "SIMULATOR_TEST_ID";
        } else {
            return res.status(400).json({ error: "Invalid callback data" });
        }

        const payment = await prisma.payment.findUnique({
            where: { transaction_id: merchantTransactionId }, // snake_case
            include: { order: { include: { user: true } } }
        });

        if (!payment) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        if (code === "PAYMENT_SUCCESS") {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "SUCCESS", payment_id: paymentId } // snake_case
            });

            // Access order_id via payment relation
            const qrData = generateQRData(payment.order_id, merchantTransactionId);

            await prisma.order.update({
                where: { id: payment.order_id }, // snake_case
                data: {
                    is_verified: true, // snake_case
                    qr_code_data: qrData // snake_case
                }
            });

            if (payment.order.user?.email) {
                sendSuccessEmail(
                    payment.order.user.email,
                    payment.order_id, // snake_case
                    Number(payment.order.updated_amount),
                    qrData
                );
            }

            return res.redirect(`${process.env.FRONTEND_URL}/payment/success?oid=${payment.order_id}`);
        } else {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: "FAILED" }
            });
            return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
        }

    } catch (error) {
        console.error("Callback Error:", error);
        res.status(500).send("Callback Processing Failed");
    }
}