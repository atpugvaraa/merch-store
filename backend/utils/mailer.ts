import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD, // App Password, not your real password
    },
});

export const sendSuccessEmail = async (to: string, orderId: string, amount: number, qrCodeData: string) => {
    try {
        const mailOptions = {
            from: `"CCS Merch Store" <${process.env.EMAIL_HOST_USER}>`,
            to,
            subject: "Order Confirmed - CCS Merch Store",
            html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Thank you for your purchase!</h2>
          <p>Your order <strong>${orderId}</strong> has been successfully placed.</p>
          <p><strong>Amount Paid:</strong> ₹${amount}</p>
          <hr/>
          <h3>Your Order QR Code</h3>
          <p>Please show this QR code at the counter to collect your items.</p>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeData)}" alt="Order QR Code" />
          <p style="margin-top: 20px; font-size: 12px; color: gray;">Transaction ID: ${orderId}</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email Error:", error);
    }
};