// app/api/send-order-email/route.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const body = await request.json();

  const itemsHtml = body.items
    .map(
      (i) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${i.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${i.qty}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">₦${i.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">₦${(
        i.price * i.qty
      ).toLocaleString()}</td>
    </tr>
  `
    )
    .join("");

  try {
    await resend.emails.send({
      from: "Bemigo Orders <info@higher.com.ng>",
      to: ["raniem57@gmail.com", "ajemigbitsejennifer@gmail.com"],
      subject: `New Order #${body.orderId}`,
      html: `
        <h2>New Order Received!</h2>
        <p><strong>Order ID:</strong> ${body.orderId}</p>
        <p><strong>Customer:</strong> ${body.customerName}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phone}</p>
        <p><strong>Address:</strong> ${body.address}</p>
        <p><strong>Total:</strong> ₦${body.total.toLocaleString()}</p>
        <h3>Items:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f97316; color: white;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: left;">Qty</th>
              <th style="padding: 12px; text-align: left;">Price</th>
              <th style="padding: 12px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <p><a href="${body.proofURL}">View Payment Proof</a></p>
      `,
    });

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
