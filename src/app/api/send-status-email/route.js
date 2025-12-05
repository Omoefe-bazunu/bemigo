// app/api/send-status-email/route.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { orderId, status, customerEmail, customerName } = await request.json();

  const statusText = status === "fulfilled" ? "Fulfilled" : "Rejected";
  const color = status === "fulfilled" ? "#10b981" : "#ef4444";

  try {
    await resend.emails.send({
      from: "Bemigo Orders <info@higher.com.ng>",
      to: customerEmail,
      subject: `Your Order #${orderId
        .slice(-8)
        .toUpperCase()} has been ${statusText}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #f97316;">Bemigo Enterprises</h2>
          <h3>Hi ${customerName},</h3>
          <p>Your order has been <strong style="color: ${color};">${statusText.toUpperCase()}</strong>!</p>
          <p><strong>Order ID:</strong> #${orderId.slice(-8).toUpperCase()}</p>
          <p>Thank you for shopping with us!</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">© 2025 Bemigo Enterprises. All rights reserved.</p>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
